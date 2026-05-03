import { cookies }       from "next/headers";
import { redirect }      from "next/navigation";
import { prisma }        from "@/lib/prisma";
import AdminBookingsList from "@/components/admin/AdminBookingsList";

export default async function AdminFoglalasok() {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      apartments: {
        include: { apartment: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">Foglalások</h1>
        <p className="text-stone-500 text-sm mt-1">Összes foglalás kezelése</p>
      </div>
      <AdminBookingsList bookings={bookings} />
    </div>
  );
}