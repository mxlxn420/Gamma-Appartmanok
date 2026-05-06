import { NextResponse }   from "next/server";
import { syncIcalFeeds } from "@/lib/icalSync";
import { requireAuth }   from "@/lib/auth";

export async function POST() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const results = await syncIcalFeeds();
  return NextResponse.json({ success: true, results });
}
