import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Átfedés-ellenőrzés: csak kiemelt időszakok (priority >= 10) ne fedhessék egymást
    if (body.dateFrom && body.dateTo && Number(body.priority) >= 10) {
      const newFrom = new Date(body.dateFrom);
      const newTo   = new Date(body.dateTo);

      const overlap = await prisma.pricingRule.findFirst({
        where: {
          isActive:    true,
          priority:    { gte: 10 },
          apartmentId: body.apartmentId ?? null,
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

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "A szezon neve kötelező" }, { status: 400 });
    }
    if (body.name.length > 100) {
      return NextResponse.json({ success: false, error: "A szezon neve maximum 100 karakter lehet" }, { status: 400 });
    }

    const priceFields = ["pricePerNight", "price3", "price4", "price5", "price6", "weekendPrice", "weekendPrice3", "weekendPrice4", "weekendPrice5", "weekendPrice6", "childPrice2to6", "childPrice6to12"];
    for (const field of priceFields) {
      const val = Number(body[field]);
      if (body[field] !== undefined && body[field] !== null && body[field] !== "" && val < 0) {
        return NextResponse.json({ success: false, error: "Az ár nem lehet negatív" }, { status: 400 });
      }
    }
    if (!body.pricePerNight || Number(body.pricePerNight) <= 0) {
      return NextResponse.json({ success: false, error: "Az alap éjszakadíj kötelező és pozitív kell legyen" }, { status: 400 });
    }

    const rule = await prisma.pricingRule.create({
      data: {
        name:            body.name.trim(),
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
        extraGuestFee:   0,
        extraGuestFrom:  3,
        isActive:        body.isActive ?? true,
        priority:        Number(body.priority)        || 5,
        policyId:        body.policyId    ?? null,
        apartmentId:     body.apartmentId ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...rule,
        price3:          (rule as any).price3          ?? 0,
        price4:          (rule as any).price4          ?? 0,
        weekendPrice:    (rule as any).weekendPrice    ?? 0,
        weekendPrice3:   (rule as any).weekendPrice3   ?? 0,
        weekendPrice4:   (rule as any).weekendPrice4   ?? 0,
        childPrice2to6:  (rule as any).childPrice2to6  ?? 0,
        childPrice6to12: (rule as any).childPrice6to12 ?? 0,
        dateFrom: rule.dateFrom?.toISOString() ?? null,
        dateTo:   rule.dateTo?.toISOString()   ?? null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}