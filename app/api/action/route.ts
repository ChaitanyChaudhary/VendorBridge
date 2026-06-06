import { NextResponse } from "next/server";
import { calculateGST } from "@/lib/currency";
import { createId } from "@/lib/server/auth";
import { ensureSchema, pool } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/session";
import type { PoolClient } from "pg";

export const runtime = "nodejs";

type ApprovalComment = { user: string; text: string; date: string };
type QuotationLineItem = { totalPrice?: number };

async function insertActivity(
  client: PoolClient,
  userName: string,
  action: string,
  category: "User" | "System" | "Error",
  details: string
) {
  await client.query(
    `INSERT INTO activity_logs (id, timestamp, user_name, action, category, details)
     VALUES ($1, NOW(), $2, $3, $4, $5)`,
    [createId("LOG"), userName, action, category, details]
  );
}

export async function POST(request: Request) {
  await ensureSchema();

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  const payload = body?.payload || {};

  const client = await pool.connect();

  try {
    if (action === "addVendor") {
      const nextId = createId("VND");
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO vendors (id, name, category, status, rating, email, phone, address, country, gst_number, registered_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)`,
        [
          nextId,
          String(payload.name || "").trim(),
          String(payload.category || "").trim(),
          String(payload.status || "Pending"),
          Number(payload.rating || 4),
          String(payload.email || "").trim(),
          String(payload.phone || "").trim(),
          String(payload.address || "").trim(),
          String(payload.country || "").trim(),
          String(payload.gstNumber || ""),
        ]
      );
      await insertActivity(
        client,
        user.name,
        "Add Vendor",
        "User",
        `New vendor registered: ${String(payload.name || nextId)}.`
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, id: nextId });
    }

    if (action === "addRFQ") {
      const nextId = createId("RFQ");
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO rfqs (id, title, description, category, deadline, status, items, selected_suppliers, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)`,
        [
          nextId,
          String(payload.title || "").trim(),
          String(payload.description || "").trim(),
          String(payload.category || "").trim(),
          String(payload.deadline || new Date().toISOString().split("T")[0]),
          String(payload.status || "Open"),
          JSON.stringify(payload.items || []),
          payload.selectedSuppliers || [],
        ]
      );
      await insertActivity(
        client,
        user.name,
        "Publish RFQ",
        "User",
        `Published RFQ ${String(payload.title || nextId)} to ${Array.isArray(payload.selectedSuppliers) ? payload.selectedSuppliers.length : 0} suppliers.`
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, id: nextId });
    }

    if (action === "submitQuotation") {
      const rfqId = String(payload.rfqId || "");
      const vendorId = String(payload.vendorId || "");
      const vendorResult = await client.query<{ name: string }>("SELECT name FROM vendors WHERE id = $1", [vendorId]);
      const rfqResult = await client.query<{ title: string }>("SELECT title FROM rfqs WHERE id = $1", [rfqId]);
      const nextId = createId("QTN");
      const items = Array.isArray(payload.items) ? payload.items : [];
      const total = items.reduce((sum: number, item: { totalPrice?: number }) => sum + Number(item.totalPrice || 0), 0);

      await client.query("BEGIN");
      await client.query(
        `INSERT INTO quotations (
           id, rfq_id, vendor_id, vendor_name, items, delivery_time, payment_terms, additional_remarks, status, submitted_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE)`,
        [
          nextId,
          rfqId,
          vendorId,
          vendorResult.rows[0]?.name || String(payload.vendorName || "Unknown Vendor"),
          JSON.stringify(items),
          String(payload.deliveryTime || ""),
          String(payload.paymentTerms || ""),
          String(payload.remarks || ""),
          "Pending Review",
        ]
      );
      await client.query("UPDATE rfqs SET status = 'Comparing' WHERE id = $1", [rfqId]);
      await insertActivity(
        client,
        vendorResult.rows[0]?.name || "Vendor",
        "Submit Quotation",
        "User",
        `Submitted quotation for RFQ "${rfqResult.rows[0]?.title || rfqId}" (${rfqId}). Bid: $${total.toLocaleString()}.`
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, id: nextId });
    }

    if (action === "selectQuotationWinner") {
      const rfqId = String(payload.rfqId || "");
      const vendorId = String(payload.vendorId || "");

      const quotationResult = await client.query<{
        id: string;
        vendor_name: string;
        items: Array<{ totalPrice?: number }>;
      }>("SELECT id, vendor_name, items FROM quotations WHERE rfq_id = $1 AND vendor_id = $2 LIMIT 1", [rfqId, vendorId]);

      const rfqResult = await client.query<{ title: string }>("SELECT title FROM rfqs WHERE id = $1", [rfqId]);
      const quotation = quotationResult.rows[0];
      if (!quotation) {
        return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
      }

      const totalAmount = quotation.items.reduce(
        (sum: number, item: { totalPrice?: number }) => sum + Number(item.totalPrice || 0),
        0
      );
      const nextApprovalId = createId("APRV");

      await client.query("BEGIN");
      await client.query(
        `UPDATE quotations
         SET status = CASE WHEN vendor_id = $2 THEN 'Selected' ELSE 'Rejected' END
         WHERE rfq_id = $1`,
        [rfqId, vendorId]
      );
      await client.query("UPDATE rfqs SET status = 'Under Review' WHERE id = $1", [rfqId]);
      await client.query(
        `INSERT INTO approvals (id, rfq_id, rfq_title, vendor_id, vendor_name, amount, stage, comments, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [
          nextApprovalId,
          rfqId,
          rfqResult.rows[0]?.title || rfqId,
          vendorId,
          quotation.vendor_name,
          totalAmount,
          "Prepared",
          JSON.stringify([
            {
              user: user.name,
              text: `Selected ${quotation.vendor_name} as winner. Technical parameters and pricing approved. Submitting to management for final workflow approval.`,
              date: new Date().toISOString().replace("T", " ").substring(0, 16),
            },
          ]),
        ]
      );
      await insertActivity(
        client,
        user.name,
        "Select RFQ Winner",
        "User",
        `Selected ${quotation.vendor_name} as the winner for RFQ "${rfqResult.rows[0]?.title || rfqId}".`
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, approvalId: nextApprovalId });
    }

    if (action === "approveWorkflow") {
      const workflowId = String(payload.workflowId || "");
      const comment = String(payload.comment || "Approved.");
      const workflowResult = await client.query<{
        id: string;
        rfq_id: string;
        rfq_title: string;
        vendor_id: string;
        vendor_name: string;
        amount: number;
        stage: string;
        comments: ApprovalComment[];
      }>("SELECT * FROM approvals WHERE id = $1", [workflowId]);

      const workflow = workflowResult.rows[0];
      if (!workflow) {
        return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
      }

      let nextStage: "Reviewed" | "Approved" | "Completed" = "Reviewed";
      if (workflow.stage === "Prepared") nextStage = "Reviewed";
      else if (workflow.stage === "Reviewed") nextStage = "Approved";
      else if (workflow.stage === "Approved") nextStage = "Completed";

      const newComments = [
        ...(workflow.comments || []),
        {
          user: user.name,
          text: comment || "Approved.",
          date: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
      ];

      await client.query("BEGIN");
      await client.query(
        `UPDATE approvals
         SET stage = $2, comments = $3, updated_at = NOW()
         WHERE id = $1`,
          [workflowId, nextStage, JSON.stringify(newComments)]
        );

      await insertActivity(
        client,
        user.name,
        `Approve Stage: ${nextStage}`,
        "User",
        `Approved workflow ${workflowId} to stage "${nextStage}".`
      );

      if (nextStage === "Approved" || nextStage === "Completed") {
        const vendorResult = await client.query<{
          email: string;
          phone: string;
          address: string;
          country: string;
        }>("SELECT email, phone, address, country FROM vendors WHERE id = $1", [workflow.vendor_id]);

        const quotationResult = await client.query<{ items: QuotationLineItem[] }>(
          "SELECT items FROM quotations WHERE rfq_id = $1 AND vendor_id = $2 LIMIT 1",
          [workflow.rfq_id, workflow.vendor_id]
        );

        const poId = createId("PO");
        const items = quotationResult.rows[0]?.items || [];
        const subtotal = items.reduce(
          (sum: number, item: { totalPrice?: number }) => sum + Number(item.totalPrice || 0),
          0
        );
        const gst = calculateGST(subtotal);
        const invoiceNumber = `INV-${poId}`;

        await client.query(
          `INSERT INTO purchase_orders (
             id, rfq_id, vendor_id, vendor_name, vendor_email, vendor_phone, vendor_address, vendor_country,
             amount, status, date, items, invoice_number, invoice_status, tax_amount, total_amount
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_DATE,$11,$12,$13,$14,$15)`,
          [
            poId,
            workflow.rfq_id,
            workflow.vendor_id,
            workflow.vendor_name,
            vendorResult.rows[0]?.email || "",
            vendorResult.rows[0]?.phone || "",
            vendorResult.rows[0]?.address || "",
            vendorResult.rows[0]?.country || "",
            Number(workflow.amount),
            "Issued",
            JSON.stringify(items),
            invoiceNumber,
            "Generated",
            gst.totalGst,
            gst.grandTotal,
          ]
        );

        await client.query("UPDATE rfqs SET status = 'Approved' WHERE id = $1", [workflow.rfq_id]);
        await insertActivity(
          client,
          "System",
          "PO Generated",
          "System",
          `Purchase Order ${poId} and invoice ${invoiceNumber} generated after approval of RFQ: ${workflow.rfq_title}.`
        );
      }

      await client.query("COMMIT");
      return NextResponse.json({ ok: true, stage: nextStage });
    }

    if (action === "rejectWorkflow") {
      const workflowId = String(payload.workflowId || "");
      const comment = String(payload.comment || "");
      const workflowResult = await client.query<{ rfq_id: string }>("SELECT rfq_id FROM approvals WHERE id = $1", [workflowId]);
      if (!workflowResult.rows[0]) {
        return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
      }

      const workflow = workflowResult.rows[0];
      const existingResult = await client.query<{ comments: ApprovalComment[] }>(
        "SELECT comments FROM approvals WHERE id = $1",
        [workflowId]
      );
      const comments = [
        ...(existingResult.rows[0]?.comments || []),
        {
          user: user.name,
          text: `REJECTED/RETURNED: ${comment}`,
          date: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
      ];

      await client.query("BEGIN");
      await client.query(
        `UPDATE approvals
         SET stage = 'Prepared', comments = $2, updated_at = NOW()
         WHERE id = $1`,
        [workflowId, JSON.stringify(comments)]
      );
      await client.query("UPDATE rfqs SET status = 'Comparing' WHERE id = $1", [workflow.rfq_id]);
      await insertActivity(
        client,
        user.name,
        "Reject Workflow Stage",
        "User",
        `Workflow ${workflowId} was returned/rejected. Reason: ${comment}`
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true });
    }

    if (action === "updateProfile") {
      const userId = String(payload.userId || user.id);
      await client.query("BEGIN");
      await client.query(
        `UPDATE users
         SET name = COALESCE($2, name),
             email = COALESCE($3, email),
             role = COALESCE($4, role),
             phone = COALESCE($5, phone),
             address = COALESCE($6, address),
             avatar_url = COALESCE($7, avatar_url),
             avatar_grayscale = COALESCE($8, avatar_grayscale)
         WHERE id = $1`,
        [
          userId,
          payload.name ?? null,
          payload.email ?? null,
          payload.role ?? null,
          payload.phone ?? null,
          payload.address ?? null,
          payload.avatarUrl ?? null,
          payload.avatarGrayscale ?? null,
        ]
      );
      await insertActivity(client, user.name, "Update Profile", "User", "User profile updated.");
      await client.query("COMMIT");
      return NextResponse.json({ ok: true });
    }

    if (action === "addActivity") {
      await client.query("BEGIN");
      await insertActivity(
        client,
        String(payload.user || user.name),
        String(payload.actionLabel || payload.action || "Action"),
        String(payload.category || "User") as "User" | "System" | "Error",
        String(payload.details || "")
      );
      await client.query("COMMIT");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
