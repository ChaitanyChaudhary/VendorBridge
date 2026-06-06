import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/server/db";
import { createToken, verifyPassword } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureSchema();

  const body = await request.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const userResult = await query<{
    id: string;
    name: string;
    email: string;
    role: string;
    password_hash: string;
    phone: string;
    address: string;
    avatar_url: string;
    avatar_grayscale: boolean;
  }>(
    "SELECT id, name, email, role, password_hash, phone, address, avatar_url, avatar_grayscale FROM users WHERE email = $1",
    [email]
  );

  if (!userResult.rows[0]) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const user = userResult.rows[0];
  if (!verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = createToken();
  await query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')", [
    token,
    user.id,
  ]);
  await query(
    `INSERT INTO activity_logs (id, timestamp, user_name, action, category, details)
     VALUES ($1, NOW(), $2, $3, $4, $5)`,
    [
      `LOG-${createToken().slice(0, 8).toUpperCase()}`,
      user.name,
      "Login",
      "User",
      `User ${user.name} (${user.role}) successfully logged into the system.`,
    ]
  );

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatarUrl: user.avatar_url,
      avatarGrayscale: user.avatar_grayscale,
    },
  });

  response.cookies.set("vendorbridge_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
