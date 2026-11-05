import { cookies }       from "next/headers";
import { redirect }      from "next/navigation";
import dynamic           from "next/dynamic";
import { prisma }        from "@/lib/prisma";
import Link              from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Prisma }   from "@prisma/client";
import type { BookingStatus } from "@/types";
import AdminBookingsFilters from "@/components/admin/AdminBookingsFilters";

const AdminBookingsList = dynamic(() => import("@/components/admin/AdminBookingsList"));

const PAGE_SIZE = 50;

type SortField = "checkIn" | "checkOut";
type SortDir   = "asc" | "desc";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "PAID", "CANCELLED", "BLOCKED"];
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

type Params = {
  page?: string;
  sort?: string;
  dir?: string;
  apt?: string;
  status?: string;
  inFrom?: string;
  inTo?: string;
  outFrom?: string;
  outTo?: string;
  past?: string;
};

// A foglalások dátumai UTC éjfélként vannak tárolva (yyyy-MM-ddT00:00:00Z)
function utcDay(value: string | undefined): Date | null {
  if (!value || !DATE_RE.test(value)) return null;
  const d = new Date(value + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function nextDay(d: Date): Date {
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

function todayBudapest(): Date {
  const str = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Budapest" }).format(new Date());
  return new Date(str + "T00:00:00Z");
}

function rangeFilter(from: Date | null, to: Date | null): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: from } : {}),
    ...(to   ? { lt: nextDay(to) } : {}),
  };
}

export default async function AdminFoglalasok({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const params = await searchParams;
  const page   = Math.max(1, Number(params.page ?? 1) || 1);
  const skip   = (page - 1) * PAGE_SIZE;

  const sort: SortField = params.sort === "checkOut" ? "checkOut" : "checkIn";
  const dir:  SortDir   = params.dir === "desc" ? "desc" : "asc";
  const status = STATUSES.includes(params.status as BookingStatus) ? (params.status as BookingStatus) : undefined;
  const apt    = params.apt && /^[\w-]{1,64}$/.test(params.apt) ? params.apt : undefined;
  const inFrom  = utcDay(params.inFrom);
  const inTo    = utcDay(params.inTo);
  const outFrom = utcDay(params.outFrom);
  const outTo   = utcDay(params.outTo);
  const showPast = params.past === "1";

  const hasDateFilter = !!(inFrom || inTo || outFrom || outTo);

  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(apt ? { apartments: { some: { apartmentId: apt } } } : {}),
  };

  const checkInFilter  = rangeFilter(inFrom, inTo);
  const checkOutFilter = rangeFilter(outFrom, outTo);
  if (checkInFilter)  where.checkIn  = checkInFilter;
  if (checkOutFilter) where.checkOut = checkOutFilter;

  // Alapból csak a közelgő / jelenleg bent lévő foglalások (a távozás ma vagy később)
  if (!showPast && !hasDateFilter) {
    where.checkOut = { gte: todayBudapest() };
  }

  const [bookings, total, apartments] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: [{ [sort]: dir }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip,
      include: {
        apartments: {
          include: { apartment: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.booking.count({ where }),
    prisma.apartment.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isFiltered = !!(status || apt || hasDateFilter);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged: Record<string, string | undefined> = { ...params, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    const s = qs.toString();
    return `/admin/foglalasok${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Foglalások</h1>
          <p className="text-stone-500 text-sm mt-1">
            {total} {isFiltered ? "találat" : showPast || hasDateFilter ? "foglalás összesen" : "közelgő foglalás"} · {page}. oldal / {totalPages}
          </p>
        </div>
      </div>

      <AdminBookingsFilters apartments={apartments} />

      <AdminBookingsList
        bookings={bookings}
        sort={sort}
        dir={dir}
        sortHrefs={{
          checkIn:  buildHref({ sort: "checkIn",  dir: sort === "checkIn"  && dir === "asc" ? "desc" : "asc", page: undefined }),
          checkOut: buildHref({ sort: "checkOut", dir: sort === "checkOut" && dir === "asc" ? "desc" : "asc", page: undefined }),
        }}
        emptyText={isFiltered ? "Nincs a szűrőknek megfelelő foglalás." : showPast ? undefined : "Nincs közelgő foglalás."}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          {page > 1 ? (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <ChevronLeft size={15} /> Előző
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-100 text-sm text-stone-300 cursor-not-allowed">
              <ChevronLeft size={15} /> Előző
            </span>
          )}

          <span className="text-sm text-stone-500">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Következő <ChevronRight size={15} />
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-100 text-sm text-stone-300 cursor-not-allowed">
              Következő <ChevronRight size={15} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
