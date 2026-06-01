import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    const body = await req.json();


    // Átfedés-ellenőrzés: csak kiemelt időszakok (priority >= 10) ne fedhessék egymást
    if (body.dateFrom && body.dateTo && Number(body.priority) >= 10) {
      const newFrom = new Date(body.dateFrom);
      const newTo   = new Date(body.dateTo);

      // Az átfedés-ellenőrzés csak az ugyanolyan apartmentId scope-on belül
      const existing = await prisma.pricingRule.findUnique({ where: { id }, select: { apartmentId: true } });
      const overlap = await prisma.pricingRule.findFirst({
        where: {
          id:          { not: id },
          isActive:    true,
          priority:    { gte: 10 },
          apartmentId: existing?.apartmentId ?? null,
          dateFrom:    { not: null },
          dateTo:      { not: null },
          AND: [
            { dateFrom: { lte: newTo   } },
            { dateTo:   { gte: newFrom } },
          ],
        },
      });

      if (overlap) {
        return NextResponse.json(
          { success: false, error: `\u00C1tfed\u00E9s: "${overlap.name}" sz\u00E9zon m\u00E1r lefedi ezt az id\u0151szakot.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.pricingRule.update({
      where: { id },
      data: {
        name:            body.name,
        pricePerNight:   Number(body.pricePerNight),
        price3:          Number(body.price3)          || 0,
        price4:          Number(body.price4)          || 0,
        price5:          Number(body.price5)          || 0,
        price6:          Number(body.price6)          || 0,
        weekendPrice:    Number(body.weekendPrice)    || 0,
        weekendPrice3:   Number(body.weekendPrice3)   || 0,
        weekendPrice4:   Number(body.weekendPrice4)   || 0,
        weekendPrice5:   Number(body.weekendPrice5)   || 0,
        weekendPrice6:   Number(body.weekendPrice6)   || 0,
        childPrice2to6:  Number(body.childPrice2to6)  || 0,
        childPrice6to12: Number(body.childPrice6to12) || 0,
        dateFrom:        body.dateFrom ? new Date(body.dateFrom) : null,
        dateTo:          body.dateTo   ? new Date(body.dateTo)   : null,
        minNights:       Number(body.minNights)       || 2,
        minAdvanceDays:  Number(body.minAdvanceDays) ?? 2,
        isActive:        Boolean(body.isActive),
        priority:        Number(body.priority)        || 0,
        policyId:        body.policyId ?? null,
      },
    });


    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        price3:          (updated as any).price3          ?? 0,
        price4:          (updated as any).price4          ?? 0,
        weekendPrice:    (updated as any).weekendPrice    ?? 0,
        weekendPrice3:   (updated as any).weekendPrice3   ?? 0,
        weekendPrice4:   (updated as any).weekendPrice4   ?? 0,
        childPrice2to6:  (updated as any).childPrice2to6  ?? 0,
        childPrice6to12: (updated as any).childPrice6to12 ?? 0,
        dateFrom: updated.dateFrom?.toISOString() ?? null,
        dateTo:   updated.dateTo?.toISOString()   ?? null,
      },
    });
  } catch (error: any) {
    console.error("PATCH pricing error:", error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    await prisma.pricingRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}