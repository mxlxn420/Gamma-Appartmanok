import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { requireAuth } from "@/lib/auth";
import { getAdminNightBreakdown } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ success: false, error: "Foglalás nem található" }, { status: 404 });

    const allRules = await prisma.pricingRule.findMany({ where: { isActive: true } });

    const apartmentBookings = await prisma.bookingApartment.findMany({
      where: { bookingId: id },
      include: { apartment: { select: { id: true, name: true } } },
    });

    const TOURIST_TAX = 450;
    const emailApartments = apartmentBookings.map((ab) => {
      const adultCount  = ab.numberOfAdults;
      const teenCount   = ab.numberOfTeens;
      const babyCount   = ab.numberOfBabies;
      const child2Count = ab.numberOfChildren2to6;
      const child6Count = ab.numberOfChildren6to12;
      const numberOfGuests = adultCount + teenCount + babyCount + child2Count + child6Count;
      const pc = adultCount + teenCount + Math.max(0, babyCount - 1);
      const aptRules = allRules.filter((r: any) => r.apartmentId === ab.apartmentId || !r.apartmentId);
      const breakdown = getAdminNightBreakdown(booking.checkIn, booking.checkOut, aptRules as any, pc);
      const aptBasePrice = breakdown.reduce((s, g) => s + g.count * g.rate, 0);
      const aptTouristTax = adultCount * booking.nights * TOURIST_TAX;
      return {
        name: ab.apartment.name,
        numberOfGuests,
        numberOfAdults: adultCount,
        numberOfBabies: babyCount,
        breakdown,
        aptBasePrice,
        aptTouristTax,
      };
    });

    const isCard = booking.paymentMethod === "card";
    const depositPercent = isCard ? 100 : (booking.depositAmount > 0 ? Math.round(booking.depositAmount / booking.totalPrice * 100) : 30);
    const freeCancelDays = isCard ? 0 : 11;

    const { sendBookingEmails } = await import("@/lib/email");
    await sendBookingEmails({
      guestName:    booking.guestName,
      guestEmail:   booking.guestEmail,
      guestPhone:   booking.guestPhone,
      guestAddress: booking.guestAddress ?? "",
      checkIn:      format(booking.checkIn, "yyyy-MM-dd"),
      checkOut:     format(booking.checkOut, "yyyy-MM-dd"),
      nights:       booking.nights,
      guests:       booking.numberOfGuests,
      numberOfAdults: booking.numberOfAdults,
      totalPrice:   booking.totalPrice,
      bookingId:    booking.id,
      notes:        booking.notes ?? undefined,
      basePrice:    booking.basePrice,
      touristTax:   booking.touristTax,
      depositAmount: isCard ? booking.totalPrice : booking.depositAmount,
      depositPercent,
      freeCancelDays,
      extraServices: Array.isArray(booking.extraServices)
        ? (booking.extraServices as any[]).map((s) => ({
            name:        String(s.name ?? ""),
            total:       Number(s.total ?? 0),
            quantity:    s.quantity != null ? Number(s.quantity) : undefined,
            nights:      s.nights   != null ? Number(s.nights)   : undefined,
            price:       s.price    != null ? Number(s.price)    : undefined,
            pricingType: s.pricingType ?? undefined,
          }))
        : [],
      extraServicesTotal:    booking.extraServicesTotal,
      paymentMethod:         booking.paymentMethod,
      discountPercent:       booking.discountPercent,
      discountAmount:        booking.discountAmount,
      numberOfTeens:         booking.numberOfTeens,
      numberOfBabies:        booking.numberOfBabies,
      numberOfChildren2to6:  booking.numberOfChildren2to6,
      numberOfChildren6to12: booking.numberOfChildren6to12,
      childPrice2to6:        booking.childPrice2to6,
      childPrice6to12:       booking.childPrice6to12,
      apartments:            emailApartments.length > 0 ? emailApartments : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
