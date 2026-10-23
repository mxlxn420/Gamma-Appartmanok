import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const rules = await prisma.pricingRule.findMany({
      where:   { isActive: true },
      orderBy: { priority: "desc" },
      include: { policy: true },
    });

    const data = rules.map((r) => ({
      id:              r.id,
      name:            r.name,
      pricePerNight:   r.pricePerNight,
      price3:          (r as any).price3          ?? 0,
      price4:          (r as any).price4          ?? 0,
      price5:          (r as any).price5          ?? 0,
      price6:          (r as any).price6          ?? 0,
      weekendPrice:    (r as any).weekendPrice    ?? 0,
      weekendPrice3:   (r as any).weekendPrice3   ?? 0,
      weekendPrice4:   (r as any).weekendPrice4   ?? 0,
      weekendPrice5:   (r as any).weekendPrice5   ?? 0,
      weekendPrice6:   (r as any).weekendPrice6   ?? 0,
      childPrice2to6:  (r as any).childPrice2to6  ?? 0,
      childPrice6to12: (r as any).childPrice6to12 ?? 0,
      dateFrom:        r.dateFrom?.toISOString()  ?? null,
      dateTo:          r.dateTo?.toISOString()    ?? null,
      minNights:       r.minNights,
      weekendMinNights: r.weekendMinNights,
      minAdvanceDays:  r.minAdvanceDays,
      isActive:        r.isActive,
      priority:        r.priority,
      apartmentId:     r.apartmentId ?? null,
      depositPercent:  (r as any).policy?.depositPercent ?? 30,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Pricing API hiba:", error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}