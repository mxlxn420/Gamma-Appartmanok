import { cookies }        from "next/headers";
import { redirect }       from "next/navigation";
import { prisma }         from "@/lib/prisma";
import AdminApartments    from "@/components/admin/AdminApartments";

export default async function AdminApartmanokPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const apartments = await prisma.apartment.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">Apartmanok</h1>
        <p className="text-stone-500 text-sm mt-1">Borítóképek és leírások szerkesztése</p>
      </div>
      <AdminApartments apartments={apartments} />
    </div>
  );
}
