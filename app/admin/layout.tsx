import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Login oldalt NE védjük!
  // Ez a layout csak az /admin/* oldalakra vonatkozik
  // de a /admin/login-t ki kell venni
  
  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${token ? "bg-stone-100" : "bg-forest-100"}`}>
      <ScrollToTop />
      {token && <AdminSidebar />}
      <main className={token ? "flex-1 md:ml-64 p-4 md:p-8 min-w-0" : "flex-1"}>
        {children}
      </main>
    </div>
  );
}