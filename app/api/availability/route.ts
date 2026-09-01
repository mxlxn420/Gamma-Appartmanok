import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aptParam = searchParams.get("apartmentIds");
    const apartmentIds = aptParam ? aptParam.split(",").filter(Boolean) : [];

    const [bookings, blocked] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status:   { in: ["PENDING", "CONFIRMED", "PAID", "BLOCKED"] },
          checkOut: { gte: new Date() },
          ...(apartmentIds.length > 0 ? {
            apartments: { some: { apartmentId: { in: apartmentIds } } },
          } : {}),
        },
        select: { checkIn: true, checkOut: true, status: true },
      }),
      prisma.blockedPeriod.findMany({
        where: {
          dateTo: { gte: new Date() },
          ...(apartmentIds.length > 0 ? {
            OR: [
              { apartmentId: { in: apartmentIds } },
              { apartmentId: null },
            ],
          } : {}),
        },
        select: { dateFrom: true, dateTo: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings.map((b) => ({
          checkIn:  b.checkIn.toISOString(),
          checkOut: b.checkOut.toISOString(),
          status:   b.status,
        })),
        blocked: blocked.map((b) => ({
          checkIn:  b.dateFrom.toISOString(),
          checkOut: b.dateTo.toISOString(),
          status:   "BLOCKED",
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
