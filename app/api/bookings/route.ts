import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { cookies } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { stripe } from "@/lib/stripe";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(3, "60 m"),
  prefix: "bookings",
});

// Prisma-t try-catch-ben importálunk
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

async function isAuthed(): Promise<boolean> {
  const store         = await cookies();
  const token         = store.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  return !!token && !!expectedToken && token === expectedToken;
}

// ─── GET ────────────────────────────────────────────────────
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Nincs jogosultság" }, { status: 401 });
  }
  try {
    const prisma = await getPrisma();
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        apartments: {
          include: { apartment: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("GET /api/bookings hiba:", error);
    return NextResponse.json(
      { success: false, error: "Szerver hiba, kérjük próbáld újra." },
      { status: 500 }
    );
  }
}

// ─── POST ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Túl sok foglalási kísérlet. Próbáld újra 1 óra múlva." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const {
      guestName,
      guestEmail,
      guestPhone,
      guestAddress,
      numberOfGuests,
      notes,
      checkIn,
      checkOut,
      basePrice,
      guestSurcharge,
      cleaningFee,
      touristTax,
      totalPrice,
      extraServices,
      extraServicesTotal,
    } = body;

    // Hossz- és típus-validáció
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof guestName    === "string" && guestName.length    > 100) return NextResponse.json({ success: false, error: "A név maximum 100 karakter lehet" },     { status: 400 });
    if (typeof guestEmail   === "string" && guestEmail.length   > 200) return NextResponse.json({ success: false, error: "Az e-mail maximum 200 karakter lehet" }, { status: 400 });
    if (typeof guestPhone   === "string" && guestPhone.length   > 30)  return NextResponse.json({ success: false, error: "A telefon maximum 30 karakter lehet" },  { status: 400 });
    if (typeof guestAddress === "string" && guestAddress.length > 200) return NextResponse.json({ success: false, error: "A lakcím maximum 200 karakter lehet" },  { status: 400 });
    if (typeof notes        === "string" && notes.length        > 1000) return NextResponse.json({ success: false, error: "A megjegyzés maximum 1000 karakter lehet" }, { status: 400 });

    // Validáció
    if (!guestName || !guestEmail || !guestPhone || !guestAddress || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: "Hiányzó kötelező mezők" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(guestEmail)) {
      return NextResponse.json(
        { success: false, error: "Érvénytelen e-mail cím" },
        { status: 400 }
      );
    }

    if (!body.numberOfAdults || Number(body.numberOfAdults) < 1) {
      return NextResponse.json(
        { success: false, error: "Legalább 1 felnőtt szükséges!" },
        { status: 400 }
      );
    }

    const adults        = Number(body.numberOfAdults        ?? 0);
    const teens         = Number(body.numberOfTeens         ?? 0);
    const babies        = Number(body.numberOfBabies        ?? 0);
    const children2to6  = Number(body.numberOfChildren2to6  ?? 0);
    const children6to12 = Number(body.numberOfChildren6to12 ?? 0);

    // apartmentGuests: [{ id, adults, teens, babies, children2to6, children6to12 }]
    const apartmentGuests: { id: string; adults: number; teens: number; babies: number; children2to6: number; children6to12: number }[] =
      Array.isArray(body.apartmentGuests) ? body.apartmentGuests : [];

    // Dátum-only string (yyyy-MM-dd) → UTC éjfél, timezone-mentes összehasonlításhoz
    const checkInDate  = new Date(checkIn  + "T00:00:00Z");
    const checkOutDate = new Date(checkOut + "T00:00:00Z");
    const nights = differenceInCalendarDays(checkOutDate, checkInDate);

    if (nights <= 0) {
      return NextResponse.json(
        { success: false, error: "Érvénytelen dátumok" },
        { status: 400 }
      );
    }

    const todayUTC = new Date(new Date().toISOString().split("T")[0] + "T00:00:00Z");
    if (checkInDate < todayUTC) {
      return NextResponse.json(
        { success: false, error: "A bejelentkezés dátuma nem lehet múltbeli" },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();

    // MinNights ellenőrzés: minden éjszakára megnézzük a szezon szabályát
    const allRules = await prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });
    let effectiveMinNights = 1;
    const cur = new Date(checkInDate);
    while (cur < checkOutDate) {
      const rule =
        allRules.find((r) => r.dateFrom && r.dateTo && cur >= r.dateFrom && cur <= r.dateTo) ??
        allRules.find((r) => !r.dateFrom && !r.dateTo);
      if (rule && rule.minNights > effectiveMinNights) effectiveMinNights = rule.minNights;
      cur.setDate(cur.getDate() + 1);
    }
    if (nights < effectiveMinNights) {
      return NextResponse.json(
        { success: false, error: `Ebben az időszakban minimum ${effectiveMinNights} éjszakára lehet foglalni!` },
        { status: 400 }
      );
    }

    // Ütközés ellenőrzés — csak a kiválasztott apartmanokra
    // Kizárjuk a 2 óránál régebbi kártyás PENDING foglalásokat (Stripe session lejárt)
    const selectedApartmentIds = apartmentGuests.map(a => a.id);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const staleCardPendingFilter = {
      NOT: {
        AND: [
          { status: "PENDING" as const },
          { paymentIntentId: { not: null } },
          { createdAt: { lt: twoHoursAgo } },
        ],
      },
    };
    const conflict = selectedApartmentIds.length > 0
      ? await prisma.booking.findFirst({
          where: {
            status: { in: ["PENDING", "CONFIRMED", "PAID"] },
            apartments: { some: { apartmentId: { in: selectedApartmentIds } } },
            AND: [
              { checkIn:  { lt: checkOutDate } },
              { checkOut: { gt: checkInDate  } },
              staleCardPendingFilter,
            ],
          },
        })
      : await prisma.booking.findFirst({
          where: {
            status: { in: ["PENDING", "CONFIRMED", "PAID"] },
            AND: [
              { checkIn:  { lt: checkOutDate } },
              { checkOut: { gt: checkInDate  } },
              staleCardPendingFilter,
            ],
          },
        });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: "Ez az időszak már foglalt!" },
        { status: 409 }
      );
    }

    // Előleg kiszámítása az érvényes árrule policy-ja alapján
    // Először szezon-specifikus szabályt keresünk, ha nincs, akkor az alapértelmezettet
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
    // Kedvezmény keresés — sima + last minute
    const now = new Date();
    const allDiscounts = await prisma.discount.findMany({
      where: { isActive: true },
      orderBy: { discountPercent: "desc" },
    });
    const applicableDiscount = allDiscounts.find((d) => {
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
    }) ?? null;

    const discountPercent = applicableDiscount?.discountPercent ?? 0;
    const finalTotal      = Number(totalPrice);
    if (!finalTotal || finalTotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Érvénytelen ár" },
        { status: 400 }
      );
    }
    const discountAmount  = Number(body.discountAmount) || 0;

    const depositPercent  = (applicableRule as any)?.policy?.depositPercent ?? 100;
    const freeCancelDays  = (applicableRule as any)?.policy?.freeCancelDays ?? 11;
    const depositAmount  = Math.round(finalTotal * depositPercent / 100);

    // Foglalás ID
    const bookingRef = "GA-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const isCardPayment = body.paymentMethod === "card";

    // Mentés — transaction: booking + apartman linkek atomikusan
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          id: bookingRef,
          guestName,
          guestEmail,
          guestPhone,
          guestAddress: guestAddress || null,
          numberOfGuests:        Number(numberOfGuests)              || 2,
          numberOfAdults:        Number(body.numberOfAdults)        || 2,
          numberOfTeens:         Number(body.numberOfTeens)         || 0,
          numberOfBabies:        Number(body.numberOfBabies)        || 0,
          numberOfChildren2to6:  Number(body.numberOfChildren2to6)  || 0,
          numberOfChildren6to12: Number(body.numberOfChildren6to12) || 0,
          notes: notes || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          basePrice: Number(basePrice),
          childPrice2to6: Number(body.childPrice2to6) || 0,
          childPrice6to12: Number(body.childPrice6to12) || 0,
          guestSurcharge: Number(guestSurcharge) || 0,
          cleaningFee:    Number(cleaningFee)    || 0,
          touristTax:     Number(touristTax)     || 0,
          totalPrice: finalTotal,
          discountPercent,
          discountAmount,
          depositAmount,
          extraServices:     extraServices     ?? null,
          extraServicesTotal: Number(extraServicesTotal) || 0,
          paymentMethod:     body.paymentMethod ?? null,
          status: "PENDING",
        },
      });

      if (apartmentGuests.length > 0) {
        await tx.bookingApartment.createMany({
          data: apartmentGuests.map(a => ({
            bookingId:             bookingRef,
            apartmentId:           a.id,
            numberOfAdults:        Number(a.adults)        || 0,
            numberOfTeens:         Number(a.teens)         || 0,
            numberOfBabies:        Number(a.babies)        || 0,
            numberOfChildren2to6:  Number(a.children2to6)  || 0,
            numberOfChildren6to12: Number(a.children6to12) || 0,
          })),
        });
      }

      return b;
    });

    // Apartman nevek + árlebontás lekérése az emailhez (transaction után)
    let emailApartments: { name: string; numberOfGuests: number; numberOfAdults: number; breakdown: { count: number; rate: number }[]; aptBasePrice: number; aptTouristTax: number }[] = [];
    if (apartmentGuests.length > 0) {
      const aptRecords = await prisma.apartment.findMany({
        where: { id: { in: apartmentGuests.map(a => a.id) } },
        select: { id: true, name: true },
      });
      const { getAdminNightBreakdown } = await import("@/lib/utils");
      const allRulesForEmail = await prisma.pricingRule.findMany({ where: { isActive: true } });
      const TOURIST_TAX = 450;
      emailApartments = apartmentGuests.map(a => {
        const apt = aptRecords.find(r => r.id === a.id);
        const adultCount   = Number(a.adults)       || 0;
        const teenCount    = Number(a.teens)         || 0;
        const babyCount    = Number(a.babies)        || 0;
        const child2Count  = Number(a.children2to6)  || 0;
        const child6Count  = Number(a.children6to12) || 0;
        const numberOfGuests = adultCount + teenCount + babyCount + child2Count + child6Count;
        const pc = adultCount + teenCount + Math.max(0, babyCount - 1);
        const aptRules = allRulesForEmail.filter((r: any) => r.apartmentId === a.id || !r.apartmentId);
        const breakdown = getAdminNightBreakdown(checkInDate, checkOutDate, aptRules as any, pc);
        const aptBasePrice = breakdown.reduce((s, g) => s + g.count * g.rate, 0);
        const aptTouristTax = adultCount * nights * TOURIST_TAX;
        return { name: apt?.name ?? a.id, numberOfGuests, numberOfAdults: adultCount, numberOfBabies: babyCount, breakdown, aptBasePrice, aptTouristTax };
      });
    }

    // Email (opcionális, nem töri el a foglalást) – kártyás fizetésnél is azonnal megy az adminnak,
    // így akkor is értesül a foglalási kísérletről, ha a fizetés végül nem sikerül.
    // A vendég kártyás fizetésnél csak a sikeres fizetés után kap visszaigazolást (Stripe webhook).
    try {
      const { sendBookingEmails } = await import("@/lib/email");
      await sendBookingEmails({
        guestName,
        guestEmail,
        guestPhone,
        guestAddress,
        checkIn,
        checkOut,
        nights,
        guests: Number(numberOfGuests),
        numberOfAdults: adults,
        totalPrice: finalTotal,
        bookingId: bookingRef,
        notes,
        basePrice: Number(basePrice),
        touristTax: Number(touristTax),
        depositAmount,
        depositPercent,
        freeCancelDays,
        extraServices: Array.isArray(extraServices)
          ? extraServices.map((s: any) => ({
              name:        String(s.name ?? ""),
              total:       Number(s.total ?? 0),
              quantity:    s.quantity != null ? Number(s.quantity) : undefined,
              nights:      s.nights   != null ? Number(s.nights)   : undefined,
              price:       s.price    != null ? Number(s.price)    : undefined,
              pricingType: s.pricingType ?? undefined,
            }))
          : [],
        extraServicesTotal: Number(extraServicesTotal) || 0,
        paymentMethod: body.paymentMethod ?? null,
        discountPercent,
        discountAmount,
        numberOfTeens:         teens,
        numberOfBabies:        babies,
        numberOfChildren2to6:  children2to6,
        numberOfChildren6to12: children6to12,
        childPrice2to6:        Number(body.childPrice2to6)  || 0,
        childPrice6to12:       Number(body.childPrice6to12) || 0,
        apartments:            emailApartments.length > 0 ? emailApartments : undefined,
      }, { adminOnly: isCardPayment });
    } catch (emailErr) {
      console.error("Email hiba (foglalás mentve):", emailErr);
    }

    // Kártyás fizetés: Stripe Checkout session létrehozás
    if (isCardPayment) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "huf",
              unit_amount: Math.round(finalTotal * 100), // HUF: fillérben kell megadni
              product_data: {
                name: `Gamma Apartman foglalás – ${bookingRef}`,
                description: `${nights} éj, ${guestName}, ${checkIn} – ${checkOut}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { bookingId: bookingRef },
        customer_email: guestEmail,
        success_url: `${siteUrl}/foglalas/sikeres?bookingId=${bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${siteUrl}/foglalas?cancelled=1`,
      });

      await prisma.booking.update({
        where: { id: bookingRef },
        data:  { paymentIntentId: session.id },
      });

      return NextResponse.json(
        { success: true, data: { id: bookingRef, stripeUrl: session.url } },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: true, data: { id: booking.id } },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("POST /api/bookings hiba:", error);
    return NextResponse.json(
      { success: false, error: "Szerver hiba, kérjük próbáld újra." },
      { status: 500 }
    );
  }
}