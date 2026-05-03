import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ success: false, error: "Foglalás nem található" }, { status: 404 });
    }

    if (booking.depositPaidAt) {
      return NextResponse.json({ success: false, error: "Az előleg már be van fizetve" }, { status: 409 });
    }

    const body = await req.json().catch(() => ({}));
    const depositPaidAt     = body.paidAt ? new Date(body.paidAt) : new Date();
    const depositPaidAmount = body.paidAmount != null ? Number(body.paidAmount) : null;
    const depositPaidMethod = body.paidMethod ?? null;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        depositPaidAt,
        depositPaidAmount,
        depositPaidMethod,
        ...(depositPaidAmount != null && depositPaidAmount !== booking.depositAmount
          ? { depositAmount: depositPaidAmount }
          : {}),
        status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
      },
    });

    // Szezon policy lekérése (depositPercent, freeCancelDays)
    const checkInDate = new Date(booking.checkIn);
    const periodRule = await prisma.pricingRule.findFirst({
      where: {
        isActive: true,
        dateFrom: { not: null, lte: checkInDate },
        dateTo:   { not: null, gte: checkInDate },
      },
      orderBy: { priority: "desc" },
      include: { policy: true },
    });
    const applicableRule = periodRule ?? await prisma.pricingRule.findFirst({
      where:   { isActive: true, dateFrom: null, dateTo: null },
      orderBy: { priority: "desc" },
      include: { policy: true },
    });
    const depositPercent = (applicableRule as any)?.policy?.depositPercent ?? 30;
    const freeCancelDays = (applicableRule as any)?.policy?.freeCancelDays ?? 11;

    // Email küldés
    let emailSent = false;
    let emailError: string | null = null;
    try {
      const { sendDepositConfirmationEmail } = await import("@/lib/email");
      await sendDepositConfirmationEmail({
        guestName:             booking.guestName,
        guestEmail:            booking.guestEmail,
        guestPhone:            booking.guestPhone,
        guestAddress:          booking.guestAddress,
        checkIn:               format(new Date(booking.checkIn),  "yyyy-MM-dd"),
        checkOut:              format(new Date(booking.checkOut), "yyyy-MM-dd"),
        nights:                booking.nights,
        guests:                booking.numberOfGuests,
        numberOfAdults:        booking.numberOfAdults       ?? undefined,
        numberOfTeens:         booking.numberOfTeens        ?? undefined,
        numberOfBabies:        booking.numberOfBabies       ?? undefined,
        numberOfChildren2to6:  booking.numberOfChildren2to6 ?? undefined,
        numberOfChildren6to12: booking.numberOfChildren6to12 ?? undefined,
        totalPrice:            booking.totalPrice,
        depositAmount:         depositPaidAmount ?? booking.depositAmount,
        depositPercent,
        freeCancelDays,
        depositMethod:         depositPaidMethod,
        depositPaidAt:         format(depositPaidAt, "yyyy. MM. dd."),
        bookingId:             booking.id,
        basePrice:             booking.basePrice        ?? undefined,
        touristTax:            booking.touristTax       ?? undefined,
        childPrice2to6:        booking.childPrice2to6   ?? undefined,
        childPrice6to12:       booking.childPrice6to12  ?? undefined,
        extraServices:         Array.isArray(booking.extraServices)
                                 ? (booking.extraServices as any[]).map((s: any) => ({
                                     name:        String(s.name ?? ""),
                                     total:       Number(s.total ?? 0),
                                     quantity:    s.quantity  != null ? Number(s.quantity)  : undefined,
                                     nights:      s.nights    != null ? Number(s.nights)    : undefined,
                                     price:       s.price     != null ? Number(s.price)     : undefined,
                                     pricingType: s.pricingType ?? undefined,
                                   }))
                                 : undefined,
        discountPercent:       booking.discountPercent  ?? undefined,
        discountAmount:        booking.discountAmount   ?? undefined,
        notes:                 booking.notes,
      });
      emailSent = true;
    } catch (err: any) {
      emailError = err?.message ?? "Ismeretlen email hiba";
      console.error("Előleg email hiba:", emailError);
    }

    return NextResponse.json({ success: true, data: updated, emailSent, emailError });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
