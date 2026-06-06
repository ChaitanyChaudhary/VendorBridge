import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/server/db";
import { createId, createToken, hashPassword } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureSchema();

  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = String(body?.role || "Procurement Officer").trim();
  const phone = String(body?.phone || "").trim();
  const address = String(body?.address || "").trim();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const userId = createId("USR");
  const passwordHash = hashPassword(password);

  await query(
    `INSERT INTO users (id, name, email, password_hash, role, phone, address, avatar_url, avatar_grayscale)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      userId,
      name,
      email,
      passwordHash,
      role,
      phone,
      address,
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.replace(/\s+/g, "").toLowerCase())}`,
      false,
    ]
  );

  const token = createToken();
  await query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')", [
    token,
    userId,
  ]);
  await query(
    `INSERT INTO activity_logs (id, timestamp, user_name, action, category, details)
     VALUES ($1, NOW(), $2, $3, $4, $5)`,
    [
      `LOG-${createToken().slice(0, 8).toUpperCase()}`,
      name,
      "Registration & Login",
      "User",
      `New user ${name} registered and logged in as ${role}.`,
    ]
  );

  const response = NextResponse.json({
    user: { id: userId, name, email, role, phone, address, avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.replace(/\s+/g, "").toLowerCase())}`, avatarGrayscale: false },
  });

  response.cookies.set("vendorbridge_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
