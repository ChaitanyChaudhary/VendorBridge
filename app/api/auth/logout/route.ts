import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/server/db";
import { createToken } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureSchema();

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/vendorbridge_session=([^;]+)/);
  const token = match?.[1];

  if (token) {
    const sessionUser = await query<{ user_id: string }>("SELECT user_id FROM sessions WHERE token = $1", [token]);
    const sessionRow = sessionUser.rows[0];
    if (sessionRow) {
      const userId = sessionRow.user_id;
      const userResult = await query<{ name: string }>("SELECT name FROM users WHERE id = $1", [userId]);
      const userRow = userResult.rows[0];
      if (userRow) {
        await query(
          `INSERT INTO activity_logs (id, timestamp, user_name, action, category, details)
           VALUES ($1, NOW(), $2, $3, $4, $5)`,
          [
            `LOG-${createToken().slice(0, 8).toUpperCase()}`,
            userRow.name,
            "Logout",
            "User",
            `User ${userRow.name} logged out.`,
          ]
        );
      }
    }
    await query("DELETE FROM sessions WHERE token = $1", [token]);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("vendorbridge_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
