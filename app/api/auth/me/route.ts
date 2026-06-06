import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  await ensureSchema();
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
