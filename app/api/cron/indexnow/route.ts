import { NextRequest, NextResponse } from "next/server";
import { submitIndexNow }           from "@/lib/indexnow";

// Kézi / cron indítás: az összes nyilvános oldal beküldése IndexNow-ra. CRON_SECRET-tel védett.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const results = await submitIndexNow();
  return NextResponse.json({ success: results.every((r) => r.status === 200 || r.status === 202), results });
}
