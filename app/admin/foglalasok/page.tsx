import { cookies }       from "next/headers";
import { redirect }      from "next/navigation";
import dynamic           from "next/dynamic";
import { prisma }        from "@/lib/prisma";
import Link              from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminBookingsList = dynamic(() => import("@/components/admin/AdminBookingsList"));

const PAGE_SIZE = 50;

export default async function AdminFoglalasok({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const params = await searchParams;
  const page   = Math.max(1, Number(params.page ?? 1));
  const skip   = (page - 1) * PAGE_SIZE;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        apartments: {
          include: { apartment: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.booking.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Foglalások</h1>
          <p className="text-stone-500 text-sm mt-1">
            {total} foglalás összesen · {page}. oldal / {totalPages}
          </p>
        </div>
      </div>

      <AdminBookingsList bookings={bookings} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          {page > 1 ? (
            <Link
              href={`/admin/foglalasok?page=${page - 1}`}
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
              href={`/admin/foglalasok?page=${page + 1}`}
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
