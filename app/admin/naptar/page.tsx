import { cookies }               from "next/headers";
import { redirect }              from "next/navigation";
import { prisma }                from "@/lib/prisma";
import AdminCalendar             from "@/components/admin/AdminCalendar";
import AdminPriceCalendar        from "@/components/admin/AdminPriceCalendar";
import AdminBookingCalendar      from "@/components/admin/AdminBookingCalendar";

export default async function AdminNaptar() {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  const [bookings, blocked, rules, apartments] = await Promise.all([
    prisma.booking.findMany({
      where:   { status: { in: ["PENDING", "CONFIRMED", "PAID"] } },
      select:  { checkIn: true, checkOut: true, status: true, guestName: true, id: true,
                 apartments: { select: { apartmentId: true } } },
      orderBy: { checkIn: "asc" },
    }),
    prisma.blockedPeriod.findMany({
      orderBy: { dateFrom: "asc" },
    }),
    prisma.pricingRule.findMany({
      where:   { isActive: true },
      orderBy: { priority: "desc" },
    }),
    prisma.apartment.findMany({
      where:   { isActive: true },
      orderBy: { name: "asc" },
      select:  { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">Naptár</h1>
        <p className="text-stone-500 text-sm mt-1">Foglalt és zárt napok</p>
      </div>
      <AdminCalendar
        bookings={bookings.map((b) => ({
          ...b,
          checkIn:      b.checkIn.toISOString(),
          checkOut:     b.checkOut.toISOString(),
          apartmentIds: b.apartments.map(a => a.apartmentId),
        }))}
        blocked={blocked.map((b) => ({
          ...b,
          dateFrom:    b.dateFrom.toISOString(),
          dateTo:      b.dateTo.toISOString(),
          apartmentId: b.apartmentId ?? null,
        }))}
        apartments={apartments}
      />
      <div className="mt-8">
        <h2 className="font-serif text-xl text-stone-800 mb-4">Foglalások</h2>
        <AdminBookingCalendar
          apartments={apartments}
          bookings={[
            ...bookings.map((b) => ({
              ...b,
              checkIn:      b.checkIn.toISOString(),
              checkOut:     b.checkOut.toISOString(),
              status:       b.status as "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED" | "BLOCKED",
              apartmentIds: b.apartments.map(a => a.apartmentId),
            })),
            ...blocked.map((b) => ({
              id:           b.id,
              guestName:    b.reason || "Zárva",
              checkIn:      b.dateFrom.toISOString(),
              checkOut:     b.dateTo.toISOString(),
              status:       "BLOCKED" as const,
              apartmentIds: b.apartmentId ? [b.apartmentId] : [],
            })),
          ]}
        />
      </div>
      <div className="mt-8">
        <h2 className="font-serif text-xl text-stone-800 mb-4">Árak és szabályok</h2>
        <AdminPriceCalendar apartments={apartments} rules={rules
          .filter((r) => r.dateFrom && r.dateTo)
          .map((r) => ({
            ...r,
            price3:        r.price3        ?? 0,
            price4:        r.price4        ?? 0,
            price5:        r.price5        ?? 0,
            price6:        r.price6        ?? 0,
            weekendPrice3: r.weekendPrice3 ?? 0,
            weekendPrice4: r.weekendPrice4 ?? 0,
            weekendPrice5: r.weekendPrice5 ?? 0,
            weekendPrice6: r.weekendPrice6 ?? 0,
            dateFrom:      r.dateFrom?.toISOString() ?? null,
            dateTo:        r.dateTo?.toISOString()   ?? null,
          }))} />
      </div>
    </div>
  );
}