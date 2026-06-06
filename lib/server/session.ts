import { cookies } from "next/headers";
import { query } from "@/lib/server/db";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("vendorbridge_session")?.value;
  if (!token) return null;

  const sessionResult = await query<{
    token: string;
    user_id: string;
    expires_at: string;
  }>(
    "SELECT token, user_id, expires_at FROM sessions WHERE token = $1 AND expires_at > NOW()",
    [token]
  );

  if (sessionResult.rowCount === 0) return null;

  const userResult = await query<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    address: string;
    avatar_url: string;
    avatar_grayscale: boolean;
  }>(
    "SELECT id, name, email, role, phone, address, avatar_url, avatar_grayscale FROM users WHERE id = $1",
    [sessionResult.rows[0].user_id]
  );

  if (userResult.rowCount === 0) return null;

  const user = userResult.rows[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    avatarUrl: user.avatar_url,
    avatarGrayscale: user.avatar_grayscale,
  };
}
