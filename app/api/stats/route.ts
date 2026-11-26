import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getStore } from "@/lib/store";

// Signup totals per company for the Morcoin team. Never returns emails.
// Usage: curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<site>/api/stats
export async function GET(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(token ?? "");
  const ok = !!token && a.length === b.length && timingSafeEqual(a, b);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getStore().getStats());
}
