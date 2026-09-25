import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { stripe } from "@/lib/stripe";
import { getRuleForNight, getNightRateFromRule, TOURIST_TAX, CLEANING_FEE } from "@/lib/utils";

// A POST a Stripe session létrehozása mellett a foglalás-visszaigazoló emaileket is várja
// (max. ~8mp timeout + 1 retry emailenként, párhuzamosan) — ehhez elég ráhagyás.
export const maxDuration = 30;

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

const MAX_PAGE_SIZE = 100;

// ─── GET ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Nincs jogosultság" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get("pageSize")) || 50));

    const prisma = await getPrisma();
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take:    pageSize,
        skip:    (page - 1) * pageSize,
        include: {
          apartments: {
            include: { apartment: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      prisma.booking.count(),
    ]);
    return NextResponse.json({ success: true, data: bookings, total, page, pageSize });
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
      notes,
      checkIn,
      checkOut,
      extraServices,
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

    // apartmentGuests: [{ id, adults, teens, babies, children2to6, children6to12 }]
    // Létszámok nem negatív egészre szorítva — negatív/tört szám nem csökkentheti az árat
    const toCount = (v: unknown) => Math.max(0, Math.min(20, Math.floor(Number(v) || 0)));
    const apartmentGuests: { id: string; adults: number; teens: number; babies: number; children2to6: number; children6to12: number }[] = [];
    for (const a of Array.isArray(body.apartmentGuests) ? body.apartmentGuests : []) {
      if (typeof a?.id !== "string" || apartmentGuests.some((x) => x.id === a.id)) continue;
      apartmentGuests.push({
        id:            a.id,
        adults:        toCount(a.adults),
        teens:         toCount(a.teens),
        babies:        toCount(a.babies),
        children2to6:  toCount(a.children2to6),
        children6to12: toCount(a.children6to12),
      });
    }

    if (apartmentGuests.length === 0) {
      return NextResponse.json(
        { success: false, error: "Kérjük, válasszon apartmant!" },
        { status: 400 }
      );
    }

    // Booking-szintű létszámok az apartmanonkénti bontásból
    const adults         = apartmentGuests.reduce((s, a) => s + a.adults, 0);
    const teens          = apartmentGuests.reduce((s, a) => s + a.teens, 0);
    const babies         = apartmentGuests.reduce((s, a) => s + a.babies, 0);
    const children2to6   = apartmentGuests.reduce((s, a) => s + a.children2to6, 0);
    const children6to12  = apartmentGuests.reduce((s, a) => s + a.children6to12, 0);
    const numberOfGuests = adults + teens + babies + children2to6 + children6to12;

    if (adults < 1) {
      return NextResponse.json(
        { success: false, error: "Legalább 1 felnőtt szükséges!" },
        { status: 400 }
      );
    }

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
    const aptRecords = await prisma.apartment.findMany({
      where:  { id: { in: selectedApartmentIds } },
      select: { id: true, name: true, slug: true },
    });
    if (aptRecords.length !== selectedApartmentIds.length) {
      return NextResponse.json(
        { success: false, error: "Ismeretlen apartman" },
        { status: 400 }
      );
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "PAID"] },
        apartments: { some: { apartmentId: { in: selectedApartmentIds } } },
        AND: [
          { checkIn:  { lt: checkOutDate } },
          { checkOut: { gt: checkInDate  } },
          staleCardPendingFilter,
        ],
      },
    });

    // Admin által lezárt (vagy iCal-ból importált) időszakok — globális vagy a kiválasztott apartmanokra
    const blockedConflict = await prisma.blockedPeriod.findFirst({
      where: {
        dateFrom: { lt: checkOutDate },
        dateTo:   { gt: checkInDate  },
        OR: [
          { apartmentId: null },
          { apartmentId: { in: selectedApartmentIds } },
        ],
      },
    });

    if (conflict || blockedConflict) {
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

    // ─── Szerver oldali árszámítás (a kliens által küldött árak nem megbízhatók) ───
    // Éjszakánkénti szabály: apartman-specifikus szabály előnyben, utána a globális
    const globalRules = allRules.filter((r) => !r.apartmentId);
    const ruleFor = (date: Date, aptId: string) =>
      getRuleForNight(date, allRules.filter((r) => r.apartmentId === aptId)) ??
      getRuleForNight(date, globalRules);

    const apartmentBreakdowns = apartmentGuests.map((a) => {
      // personCount: felnőtt + gyerek + (baba - 1, első ingyenes)
      const personCount = a.adults + a.teens + Math.max(0, a.babies - 1);
      const breakdown: { count: number; rate: number }[] = [];
      const cur = new Date(checkInDate);
      while (cur < checkOutDate) {
        const rule = ruleFor(cur, a.id);
        const rate = rule ? getNightRateFromRule(rule, cur, personCount) : 0;
        if (breakdown.length > 0 && breakdown[breakdown.length - 1].rate === rate) {
          breakdown[breakdown.length - 1].count++;
        } else {
          breakdown.push({ count: 1, rate });
        }
        cur.setDate(cur.getDate() + 1);
      }
      const checkInRule     = ruleFor(checkInDate, a.id);
      const childRate2to6   = a.children2to6  > 0 ? checkInRule?.childPrice2to6  ?? 0 : 0;
      const childRate6to12  = a.children6to12 > 0 ? checkInRule?.childPrice6to12 ?? 0 : 0;
      const aptChildTotal   = (childRate2to6 * a.children2to6 + childRate6to12 * a.children6to12) * nights;
      const aptBasePrice    = breakdown.reduce((s, g) => s + g.count * g.rate, 0);
      const aptTouristTax   = a.adults * nights * TOURIST_TAX;
      const apt = aptRecords.find((r) => r.id === a.id);
      return {
        id: a.id,
        name: apt?.name ?? a.id,
        adults: a.adults,
        babies: a.babies,
        personCount,
        numberOfGuests: a.adults + a.teens + a.babies + a.children2to6 + a.children6to12,
        breakdown,
        childRate2to6,
        childRate6to12,
        aptChildTotal,
        aptBasePrice,
        aptTouristTax,
      };
    });

    const totalBasePrice  = apartmentBreakdowns.reduce((s, a) => s + a.aptBasePrice, 0);
    const totalChildPrice = apartmentBreakdowns.reduce((s, a) => s + a.aptChildTotal, 0);
    const totalTouristTax = apartmentBreakdowns.reduce((s, a) => s + a.aptTouristTax, 0);
    const childPrice2to6  = apartmentBreakdowns.find((a) => a.childRate2to6  > 0)?.childRate2to6  ?? 0;
    const childPrice6to12 = apartmentBreakdowns.find((a) => a.childRate6to12 > 0)?.childRate6to12 ?? 0;

    // Kedvezmény összeg számítása (csak a szállásdíjra, IFA és extrák nélkül)
    let discountAmount = 0;
    if (applicableDiscount && discountPercent > 0) {
      if (applicableDiscount.isLastMinute) {
        const deadline = new Date(todayUTC);
        deadline.setDate(deadline.getDate() + applicableDiscount.lastMinuteDays);
        let discountedBase = 0;
        for (const a of apartmentBreakdowns) {
          const cur = new Date(checkInDate);
          while (cur < checkOutDate) {
            if (cur <= deadline) {
              const rule = ruleFor(cur, a.id);
              discountedBase += rule ? getNightRateFromRule(rule, cur, a.personCount) : 0;
            }
            cur.setDate(cur.getDate() + 1);
          }
        }
        discountAmount = Math.round(discountedBase * discountPercent / 100);
      } else {
        discountAmount = Math.round((totalBasePrice + totalChildPrice) * discountPercent / 100);
      }
    }

    // Extra szolgáltatások validálása az adatbázis alapján
    const requestedServiceIds = Array.isArray(extraServices)
      ? extraServices.map((s: any) => s?.id).filter((id: any) => typeof id === "string")
      : [];
    const dbServices = requestedServiceIds.length > 0
      ? await prisma.extraService.findMany({ where: { id: { in: requestedServiceIds }, isActive: true } })
      : [];
    let extraServicesTotal = 0;
    const seenServiceIds = new Set<string>();
    const validatedExtraServices = (Array.isArray(extraServices) ? extraServices : [])
      .map((sel: any) => {
        const dbSvc = dbServices.find((s) => s.id === sel?.id);
        if (!dbSvc || dbSvc.price == null || seenServiceIds.has(dbSvc.id)) return null;
        seenServiceIds.add(dbSvc.id);
        const quantity  = Math.max(1, Math.min(20, Math.round(Number(sel.quantity)) || 1));
        // PER_NIGHT: a vendég 1..foglalt éj között választhat
        const svcNights = dbSvc.pricingType === "PER_NIGHT"
          ? Math.max(1, Math.min(nights, Math.round(Number(sel.nights)) || nights))
          : 1;
        const total = dbSvc.price * quantity * svcNights;
        extraServicesTotal += total;
        return { id: dbSvc.id, name: dbSvc.name, pricingType: dbSvc.pricingType, price: dbSvc.price, quantity, nights: svcNights, total };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const finalTotal = Math.round(totalBasePrice + totalChildPrice + totalTouristTax - discountAmount + extraServicesTotal);
    if (!finalTotal || finalTotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Érvénytelen ár" },
        { status: 400 }
      );
    }

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
          numberOfGuests,
          numberOfAdults:        adults,
          numberOfTeens:         teens,
          numberOfBabies:        babies,
          numberOfChildren2to6:  children2to6,
          numberOfChildren6to12: children6to12,
          notes: notes || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          basePrice:       totalBasePrice,
          childPrice2to6,
          childPrice6to12,
          guestSurcharge:  0,
          cleaningFee:     CLEANING_FEE,
          touristTax:      totalTouristTax,
          totalPrice: finalTotal,
          discountPercent,
          discountAmount,
          depositAmount,
          extraServices:     validatedExtraServices.length > 0 ? validatedExtraServices : undefined,
          extraServicesTotal,
          paymentMethod:     body.paymentMethod ?? null,
          status: "PENDING",
        },
      });

      if (apartmentGuests.length > 0) {
        await tx.bookingApartment.createMany({
          data: apartmentGuests.map(a => ({
            bookingId:             bookingRef,
            apartmentId:           a.id,
            numberOfAdults:        a.adults,
            numberOfTeens:         a.teens,
            numberOfBabies:        a.babies,
            numberOfChildren2to6:  a.children2to6,
            numberOfChildren6to12: a.children6to12,
          })),
        });
      }

      return b;
    });

    // Naptár cache frissítése — a most lefoglalt apartman(ok) iCal/availability route-jai
    // azonnal friss adatot adjanak, a cache bevezetése (revalidate) mellett is.
    revalidatePath("/api/availability");
    revalidatePath("/api/calendar.ics");
    for (const a of aptRecords) revalidatePath(`/api/calendar/${a.slug}`);

    // Apartmanonkénti árlebontás az emailhez (a fenti szerver oldali számításból)
    const emailApartments = apartmentBreakdowns.map((a) => ({
      name:           a.name,
      numberOfGuests: a.numberOfGuests,
      numberOfAdults: a.adults,
      numberOfBabies: a.babies,
      breakdown:      a.breakdown,
      aptBasePrice:   a.aptBasePrice,
      aptTouristTax:  a.aptTouristTax,
    }));

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
        guests: numberOfGuests,
        numberOfAdults: adults,
        totalPrice: finalTotal,
        bookingId: bookingRef,
        notes,
        basePrice: totalBasePrice,
        touristTax: totalTouristTax,
        depositAmount,
        depositPercent,
        freeCancelDays,
        extraServices: validatedExtraServices.map((s) => ({
          name:        s.name,
          total:       s.total,
          quantity:    s.quantity,
          nights:      s.nights,
          price:       s.price,
          pricingType: s.pricingType,
        })),
        extraServicesTotal,
        paymentMethod: body.paymentMethod ?? null,
        discountPercent,
        discountAmount,
        numberOfTeens:         teens,
        numberOfBabies:        babies,
        numberOfChildren2to6:  children2to6,
        numberOfChildren6to12: children6to12,
        childPrice2to6,
        childPrice6to12,
        apartments:            emailApartments,
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