import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { apartments: { include: { apartment: { select: { name: true } } } } },
    });

    if (!booking) return NextResponse.json({ success: false, error: "Foglalás nem található" }, { status: 404 });
    if (booking.depositPaidAt) return NextResponse.json({ success: false, error: "Az előleg már be van fizetve" }, { status: 409 });

    const checkInDate = new Date(booking.checkIn);
    const periodRule = await prisma.pricingRule.findFirst({
      where: { isActive: true, dateFrom: { not: null, lte: checkInDate }, dateTo: { not: null, gte: checkInDate } },
      orderBy: { priority: "desc" },
      include: { policy: true },
    });
    const applicableRule = periodRule ?? await prisma.pricingRule.findFirst({
      where: { isActive: true, dateFrom: null, dateTo: null },
      orderBy: { priority: "desc" },
      include: { policy: true },
    });
    const freeCancelDays = (applicableRule as any)?.policy?.freeCancelDays ?? 11;

    const { sendPaymentReminderEmail } = await import("@/lib/email");
    await sendPaymentReminderEmail({
      guestName:    booking.guestName,
      guestEmail:   booking.guestEmail,
      checkIn:      format(new Date(booking.checkIn),  "yyyy-MM-dd"),
      checkOut:     format(new Date(booking.checkOut), "yyyy-MM-dd"),
      nights:       booking.nights,
      totalPrice:    booking.totalPrice,
      depositAmount: booking.totalPrice,
      bookingId:    booking.id,
      freeCancelDays,
      paymentMethod: booking.paymentMethod ?? undefined,
      apartments:   booking.apartments.map(a => a.apartment.name),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
