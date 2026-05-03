import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAuthed(): Promise<boolean> {
  const store         = await cookies();
  const token         = store.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  return !!token && !!expectedToken && token === expectedToken;
}

// ─── GET – egy foglalás adatai ───────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Nincs jogosultság" }, { status: 401 });
  }
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ success: false, error: "Foglalás nem található" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: booking });
  } catch {
    return NextResponse.json({ success: false, error: "Szerver hiba" }, { status: 500 });
  }
}

// ─── PATCH – státusz VAGY teljes szerkesztés ─────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Nincs jogosultság" }, { status: 401 });
  }
  try {
    const body = await req.json();

    // Státusz-módosítás
    if ("status" in body && !("checkIn" in body)) {
      const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Érvénytelen státusz" }, { status: 400 });
      }
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: body.status },
      });

      // Törlési email küldése (csak ha sendEmail !== false)
      if (body.status === "CANCELLED" && body.sendEmail !== false) {
        try {
          const { sendCancellationEmail } = await import("@/lib/email");
          const { format } = await import("date-fns");
          await sendCancellationEmail({
            guestName:  updated.guestName,
            guestEmail: updated.guestEmail,
            checkIn:    format(new Date(updated.checkIn),  "yyyy. MM. dd."),
            checkOut:   format(new Date(updated.checkOut), "yyyy. MM. dd."),
            nights:     updated.nights,
            bookingId:  updated.id,
            adminNote:  body.adminNote ?? undefined,
          });
        } catch (emailErr) {
          console.error("Törlési email hiba (státusz mentve):", emailErr);
        }
      }

      return NextResponse.json({ success: true, data: updated });
    }

    // Teljes szerkesztés
    const ci = new Date(body.checkIn);
    const co = new Date(body.checkOut);
    const nights = differenceInCalendarDays(co, ci);

    if (nights <= 0) {
      return NextResponse.json({ success: false, error: "A távozás napjának az érkezés utánra kell esnie." }, { status: 400 });
    }

    // Ütközésellenőrzés (saját foglalást kizárjuk)
    const conflicts = await prisma.booking.findMany({
      where: {
        id:     { not: id },
        status: { in: ["PENDING", "CONFIRMED", "PAID", "BLOCKED"] },
        AND: [
          { checkIn:  { lt: co } },
          { checkOut: { gt: ci } },
        ],
      },
    });
    if (conflicts.length > 0) {
      return NextResponse.json({ success: false, error: "Az időszak már foglalt." }, { status: 409 });
    }

    const adults       = Number(body.numberOfAdults)       || 0;
    const teens        = Number(body.numberOfTeens)         || 0;
    const babies       = Number(body.numberOfBabies)        || 0;
    const ch2to6       = Number(body.numberOfChildren2to6)  || 0;
    const ch6to12      = Number(body.numberOfChildren6to12) || 0;
    const numberOfGuests = adults + teens + babies + ch2to6 + ch6to12;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        guestName:              body.guestName,
        guestEmail:             body.guestEmail,
        guestPhone:             body.guestPhone,
        checkIn:                ci,
        checkOut:               co,
        nights,
        numberOfAdults:         adults,
        numberOfTeens:          teens,
        numberOfBabies:         babies,
        numberOfChildren2to6:   ch2to6,
        numberOfChildren6to12:  ch6to12,
        numberOfGuests,
        notes:                  body.notes || null,
        totalPrice:             Number(body.totalPrice),
        depositAmount:          Number(body.depositAmount) || 0,
        discountPercent:        Number(body.discountPercent) || 0,
        discountAmount:         Number(body.discountAmount)  || 0,
        basePrice:              Number(body.basePrice)    || 0,
        childPrice2to6:         Number(body.childPrice2to6)  || 0,
        childPrice6to12:        Number(body.childPrice6to12) || 0,
        cleaningFee:            Number(body.cleaningFee)  || 0,
        touristTax:             Number(body.touristTax)   || 0,
        guestSurcharge:         Number(body.guestSurcharge) || 0,
        ...(body.status ? { status: body.status } : {}),
        ...(body.extraServices !== undefined ? {
          extraServices:     body.extraServices,
          extraServicesTotal: Number(body.extraServicesTotal) || 0,
        } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// ─── DELETE – foglalás törlése ────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAuthed())) {
    return NextResponse.json({ success: false, error: "Nincs jogosultság" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (booking && body.sendEmail !== false) {
      try {
        const { sendCancellationEmail } = await import("@/lib/email");
        await sendCancellationEmail({
          guestName:  booking.guestName,
          guestEmail: booking.guestEmail,
          checkIn:    format(new Date(booking.checkIn),  "yyyy-MM-dd"),
          checkOut:   format(new Date(booking.checkOut), "yyyy-MM-dd"),
          nights:     booking.nights,
          bookingId:  booking.id,
          adminNote:  body.adminNote,
        });
      } catch (emailErr) {
        console.error("Törlési email hiba:", emailErr);
      }
    }
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
