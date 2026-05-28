import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkIn  = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: "checkIn és checkOut kötelező" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn + "T00:00:00Z");
    const now         = new Date();
    const todayUTC    = new Date(now.toISOString().split("T")[0] + "T00:00:00Z");

    const allDiscounts = await prisma.discount.findMany({
      where: { isActive: true },
      orderBy: { discountPercent: "desc" },
    });

    const applicable = allDiscounts.filter((d) => {
      const inBookingWindow =
        (!d.bookingFrom && !d.bookingTo) ||
        (d.bookingFrom && !d.bookingTo && d.bookingFrom <= now) ||
        (!d.bookingFrom && d.bookingTo && d.bookingTo >= now) ||
        (d.bookingFrom && d.bookingTo && d.bookingFrom <= now && d.bookingTo >= now);

      if (!inBookingWindow) return false;

      if (d.isLastMinute) {
        const deadline = new Date(todayUTC);
        deadline.setDate(deadline.getDate() + d.lastMinuteDays);
        return checkInDate >= todayUTC && checkInDate <= deadline;
      }

      return d.stayFrom <= checkInDate && d.stayTo >= checkInDate;
    });

    const best = applicable[0] ?? null;

    return NextResponse.json({
      success: true,
      data: best ? {
        id:              best.id,
        name:            best.name,
        discountPercent: best.discountPercent,
        isLastMinute:    best.isLastMinute,
        lastMinuteDays:  best.lastMinuteDays,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
