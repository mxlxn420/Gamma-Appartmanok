import { Suspense } from "react";
import StripeSuccessContent from "./StripeSuccessContent";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { getAdminNightBreakdown } from "@/lib/utils";

export const metadata = { title: "Sikeres fizetés – Gamma Apartmanok" };

async function verifyAndFinalize(sessionId: string, bookingId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return;

    const updated = await prisma.booking.updateMany({
      where: { id: bookingId, status: { not: "PAID" } },
      data:  { status: "PAID", paidAt: new Date() },
    });

    if (updated.count === 0) return; // webhook már lefutott, email ne menjen duplán

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

    const allRules = await prisma.pricingRule.findMany({ where: { isActive: true } });
    const apartmentBookings = await prisma.bookingApartment.findMany({
      where: { bookingId },
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
      return { name: ab.apartment.name, numberOfGuests, numberOfAdults: adultCount, numberOfBabies: babyCount, breakdown, aptBasePrice, aptTouristTax };
    });

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
      depositAmount: booking.totalPrice,
      depositPercent: 100,
      freeCancelDays: 0,
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
  } catch (err) {
    console.error("Stripe success page fallback hiba:", err);
  }
}

export default async function StripeSikeresPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; session_id?: string }>;
}) {
  const { bookingId, session_id } = await searchParams;

  if (session_id && bookingId) {
    await verifyAndFinalize(session_id, bookingId);
  }

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20 flex items-center justify-center">
      <div className="container-custom max-w-xl text-center">
        <Suspense>
          <StripeSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
