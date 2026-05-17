import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

// Stripe nyers body-t vár, nem JSON parse-olt
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Hiányzó Stripe aláírás" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Stripe webhook aláírás hiba:", err.message);
    return NextResponse.json({ error: "Érvénytelen webhook aláírás" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error("Stripe webhook: hiányzó bookingId a metadatából");
      return NextResponse.json({ error: "Hiányzó bookingId" }, { status: 400 });
    }

    try {
      const prisma = await getPrisma();

      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data:  { status: "PAID", paidAt: new Date() },
      });

      // Email küldés fizetés után
      try {
        const { sendBookingEmails } = await import("@/lib/email");
        const { format } = await import("date-fns");
        const { getAdminNightBreakdown } = await import("@/lib/utils");

        const allRules = await prisma.pricingRule.findMany({ where: { isActive: true } });

        const apartmentBookings = await prisma.bookingApartment.findMany({
          where: { bookingId },
          include: { apartment: { select: { id: true, name: true } } },
        });

        const TOURIST_TAX = 450;
        const emailApartments = apartmentBookings.map((ab) => {
          const adultCount = ab.numberOfAdults;
          const teenCount  = ab.numberOfTeens;
          const babyCount  = ab.numberOfBabies;
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

        const depositPercent = 100; // kártyás fizetésnél azonnal teljes összeget fizet
        const freeCancelDays = 0;

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
      } catch (emailErr) {
        console.error("Email hiba Stripe webhook-ban (foglalás mentve):", emailErr);
      }
    } catch (dbErr) {
      console.error("DB hiba Stripe webhook-ban:", dbErr);
      return NextResponse.json({ error: "DB hiba" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
