import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/server/db";
import { createToken } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureSchema();

  const body = await request.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const userResult = await query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (userResult.rowCount === 0) {
    return NextResponse.json({ ok: true, message: "If the account exists, a reset token was created." });
  }

  const token = createToken();
  await query("INSERT INTO forgot_password_tokens (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')", [
    token,
    userResult.rows[0].id,
  ]);

  return NextResponse.json({
    ok: true,
    message: "Reset token created. Use it in a local password reset flow.",
    token,
  });
}
