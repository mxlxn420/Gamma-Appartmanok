import { cookies }       from "next/headers";
import { redirect }      from "next/navigation";
import dynamic           from "next/dynamic";
import { prisma }        from "@/lib/prisma";
import AdminStats        from "@/components/admin/AdminStats";

const AdminBookingsList = dynamic(() => import("@/components/admin/AdminBookingsList"));

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const [allBookings, totalCount, pendingCount, revenueData] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        apartments: {
          include: { apartment: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.booking.count(),
    prisma.booking.count({
      where: { status: "PENDING" },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _sum:  { totalPrice: true },
    }),
  ]);

  const stats = {
    total:   totalCount,
    pending: pendingCount,
    revenue: revenueData._sum.totalPrice ?? 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">Áttekintés</h1>
        <p className="text-stone-500 text-sm mt-1">Gamma Apartmanok foglaláskezelő</p>
      </div>
      <AdminStats stats={stats} />
      <div className="mt-8">
        <h2 className="font-serif text-xl text-stone-800 mb-4">Legutóbbi foglalások</h2>
        <AdminBookingsList bookings={allBookings} />
      </div>
    </div>
  );
}