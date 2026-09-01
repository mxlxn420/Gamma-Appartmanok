import { NextRequest, NextResponse } from "next/server";
import { syncIcalFeeds }            from "@/lib/icalSync";
import { sendIcalSyncErrorEmail }   from "@/lib/email";

// Külső cron (cron-job.org) hívja 15 percenként — CRON_SECRET-tel védett.
// A források lekérése párhuzamos, forrásonként max. 10mp timeouttal — ehhez elég ráhagyás.
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const secret   = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncIcalFeeds();

  const failed = results.filter(r => r.error);
  if (failed.length > 0) {
    await sendIcalSyncErrorEmail(failed);
  }

  return NextResponse.json({ success: true, results });
}
