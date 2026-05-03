"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, Settings, LogOut, Home,
  ScrollText, Sparkles, Tag, Image, Info, CheckSquare, Images, Menu, X, Building2,
} from "lucide-react";

const LINKS = [
  { href: "/admin",                        icon: LayoutDashboard, label: "Áttekintés"          },
  { href: "/admin/apartmanok",              icon: Building2,       label: "Apartmanok"           },
  { href: "/admin/foglalasok",             icon: Calendar,        label: "Foglalások"           },
  { href: "/admin/naptar",                 icon: Calendar,        label: "Naptár"               },
  { href: "/admin/arak",                   icon: Settings,        label: "Árak"                 },
  { href: "/admin/szabalyok",              icon: ScrollText,      label: "Szabályok"            },
  { href: "/admin/kedvezmenyek",           icon: Tag,             label: "Kedvezmények"         },
  { href: "/admin/extra-szolgaltatasok",   icon: Sparkles,        label: "Extra szolgáltatások" },
  { href: "/admin/hero",                   icon: Image,           label: "Kezdőlap"             },
  { href: "/admin/rolunk",                 icon: Info,            label: "Rólunk"               },
  { href: "/admin/felszereltseg",          icon: CheckSquare,     label: "Felszereltség"        },
  { href: "/admin/galeria",               icon: Images,          label: "Galéria"              },
];

function NavContent({ pathname, onClose, onLogout }: {
  pathname: string;
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="font-serif text-xl text-cream">Milán Kuckó</p>
          <p className="text-xs text-cream/50 tracking-widest uppercase mt-0.5">Admin</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-cream/60 hover:text-cream md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {LINKS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
              pathname === href
                ? "bg-white/15 text-cream font-medium"
                : "text-cream/60 hover:text-cream hover:bg-white/8"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Alt */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-cream/60 hover:text-cream hover:bg-white/8 transition-colors"
        >
          <Home size={17} />
          Főoldal
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-cream/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={17} />
          Kijelentkezés
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-forest-900 flex-col z-50">
        <NavContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-forest-900 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <p className="font-serif text-base text-cream">Milán Kuckó</p>
          <p className="text-[10px] text-cream/50 tracking-widest uppercase">Admin</p>
        </div>
        <button onClick={() => setOpen(true)} className="text-cream/70 hover:text-cream p-1">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile top bar spacer */}
      <div className="md:hidden h-[60px]" />

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 bg-forest-900 flex flex-col z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent pathname={pathname} onClose={() => setOpen(false)} onLogout={handleLogout} />
      </aside>
    </>
  );
}
