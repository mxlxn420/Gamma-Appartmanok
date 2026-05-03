import { cookies }    from "next/headers";
import { redirect }   from "next/navigation";
import { prisma }     from "@/lib/prisma";
import AdminPricing   from "@/components/admin/AdminPricing";

export default async function AdminArak() {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  const [rules, policies, apartments] = await Promise.all([
    prisma.pricingRule.findMany({ orderBy: { priority: "desc" } }),
    prisma.bookingPolicy.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.apartment.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, maxGuests: true } }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">Árak</h1>
        <p className="text-stone-500 text-sm mt-1">Szezonális árak szerkesztése</p>
      </div>
      <AdminPricing
        rules={rules.map((r) => ({
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
          apartmentId:   r.apartmentId ?? null,
        }))}
        policies={policies.map((p) => ({ id: p.id, name: p.name }))}
        apartments={apartments}
      />
    </div>
  );
}
