"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar } from "lucide-react";

const NAV_LINKS = [
  { label: "Kezdőlap", href: "/#hero" },
  { label: "Rólunk", href: "/#rolunk" },
  { label: "Felszereltség", href: "/#felszereltseg" },
  { label: "Galéria", href: "/galeria" },
  { label: "Árak", href: "/#arak" },
  { label: "Értékelések", href: "/#ertekelesek" },
  { label: "GYIK", href: "/#gyik" },
  { label: "Környék", href: "/#kornyek" },
  { label: "Kapcsolat", href: "/#kapcsolat" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHeroPage = pathname === "/" || pathname === "";

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        animate={isScrolled || !isHeroPage
          ? { backgroundColor: "rgba(84,48,24,0.97)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.06)" }
          : { backgroundColor: "rgba(0,0,0,0)", backdropFilter: "blur(0px)", borderColor: "rgba(255,255,255,0)" }
        }
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ height: "var(--navbar-h)" }}
      >
        <div className="container-custom h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl font-light text-cream tracking-tight">
              Gamma Apartmanok
            </span>
            <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-cream/60">
              Miskolctapolca
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs font-sans font-medium tracking-[0.08em] uppercase text-cream/80 hover:text-cream transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-terra-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              href="/foglalas"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-terra-400 text-white text-xs font-medium tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:bg-terra-500 hover:-translate-y-px hover:shadow-lg"
            >
              <Calendar size={14} />
              Foglalás
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 text-cream"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Menü bezárása" : "Menü megnyitása"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                ><X size={22} /></motion.span>
              ) : (
                <motion.span key="menu"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                ><Menu size={22} /></motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobil overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-forest-900 lg:hidden flex flex-col"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <span className="font-serif text-xl text-cream">Gamma Apartmanok</span>
                <button onClick={() => setMobileOpen(false)} className="text-cream/60 hover:text-cream">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 flex flex-col justify-center px-6 gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.href}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                  >
                    <Link href={link.href}
                      className="block py-3 px-4 text-cream/80 hover:text-cream text-sm tracking-[0.12em] uppercase rounded-xl hover:bg-white/5 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="px-6 pb-8">
                <Link href="/foglalas" onClick={() => setMobileOpen(false)}
                  className="btn-accent w-full justify-center"
                >
                  <Calendar size={16} />
                  Foglalás indítása
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}