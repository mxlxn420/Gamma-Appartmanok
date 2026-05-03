import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blocked = await prisma.blockedPeriod.findMany({ orderBy: { dateFrom: "asc" } });
  return NextResponse.json({
    success: true,
    data: blocked.map((b) => ({
      ...b,
      dateFrom:    b.dateFrom.toISOString(),
      dateTo:      b.dateTo.toISOString(),
      apartmentId: b.apartmentId ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dateFrom, dateTo } = body;
    const reason      = typeof body.reason      === "string" ? body.reason.slice(0, 200) : null;
    const apartmentId = typeof body.apartmentId === "string" ? body.apartmentId : null;

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ success: false, error: "A dátumok megadása kötelező" }, { status: 400 });
    }

    const from = new Date(dateFrom);
    const to   = new Date(dateTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json({ success: false, error: "Érvénytelen dátum" }, { status: 400 });
    }

    if (to <= from) {
      return NextResponse.json({ success: false, error: "A záró dátumnak a kezdő dátum után kell lennie" }, { status: 400 });
    }

    const blocked = await prisma.blockedPeriod.create({
      data: {
        dateFrom:    from,
        dateTo:      to,
        reason:      reason || null,
        apartmentId: apartmentId || null,
      },
    });

    return NextResponse.json({ success: true, data: {
      ...blocked,
      dateFrom:    blocked.dateFrom.toISOString(),
      dateTo:      blocked.dateTo.toISOString(),
      apartmentId: blocked.apartmentId ?? null,
    }});
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
