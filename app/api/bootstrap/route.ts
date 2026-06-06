import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

function normalizeDate(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value);
}

function normalizeTimestamp(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().replace("T", " ").substring(0, 19);
  return String(value);
}

export async function GET() {
  await ensureSchema();

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [vendors, rfqs, quotations, approvals, pos, activityLogs] = await Promise.all([
    query("SELECT * FROM vendors ORDER BY registered_date DESC"),
    query("SELECT * FROM rfqs ORDER BY created_at DESC"),
    query("SELECT * FROM quotations ORDER BY submitted_at DESC"),
    query("SELECT * FROM approvals ORDER BY updated_at DESC"),
    query("SELECT * FROM purchase_orders ORDER BY date DESC"),
    query("SELECT * FROM activity_logs ORDER BY timestamp DESC"),
  ]);

  return NextResponse.json({
    user,
    vendors: vendors.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      rating: Number(row.rating),
      email: row.email,
      phone: row.phone,
      address: row.address,
      country: row.country,
      registeredDate: normalizeDate(row.registered_date),
      gstNumber: row.gst_number || "",
    })),
    rfqs: rfqs.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      deadline: normalizeDate(row.deadline),
      status: row.status,
      items: row.items,
      selectedSuppliers: row.selected_suppliers || [],
      createdAt: normalizeDate(row.created_at),
    })),
    quotations: quotations.rows.map((row) => ({
      id: row.id,
      rfqId: row.rfq_id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      items: row.items,
      deliveryTime: row.delivery_time,
      paymentTerms: row.payment_terms,
      additionalRemarks: row.additional_remarks,
      status: row.status,
      submittedAt: normalizeDate(row.submitted_at),
    })),
    approvals: approvals.rows.map((row) => ({
      id: row.id,
      rfqId: row.rfq_id,
      rfqTitle: row.rfq_title,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      amount: Number(row.amount),
      stage: row.stage,
      comments: row.comments,
      updatedAt: normalizeTimestamp(row.updated_at),
    })),
    pos: pos.rows.map((row) => ({
      id: row.id,
      rfqId: row.rfq_id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      vendorEmail: row.vendor_email,
      vendorPhone: row.vendor_phone,
      vendorAddress: row.vendor_address,
      vendorCountry: row.vendor_country,
      amount: Number(row.amount),
      status: row.status,
      date: normalizeDate(row.date),
      items: row.items,
      invoiceNumber: row.invoice_number,
      invoiceStatus: row.invoice_status,
      taxAmount: Number(row.tax_amount),
      totalAmount: Number(row.total_amount),
    })),
    activityLogs: activityLogs.rows.map((row) => ({
      id: row.id,
      timestamp: normalizeTimestamp(row.timestamp),
      user: row.user_name,
      action: row.action,
      category: row.category,
      details: row.details,
    })),
  });
}
