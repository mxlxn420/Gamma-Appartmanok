"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, ArrowUpRight } from "lucide-react";

const NAV = [
  { label: "Rólunk", href: "/#rolunk" },
  { label: "Felszereltség", href: "/#felszereltseg" },
  { label: "Galéria", href: "/#galeria" },
  { label: "Árak", href: "/#arak" },
  { label: "GYIK", href: "/#gyik" },
  { label: "Kapcsolat", href: "/#kapcsolat" },
];

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-cream/70">
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Branding */}
          <div>
            <Link href="/" className="block mb-5">
              <p className="font-serif text-3xl font-light text-cream">Gamma Apartmanok</p>
              <p className="text-xs text-cream/50 tracking-[0.25em] uppercase mt-1">Miskolctapolca</p>
            </Link>
            <p className="text-sm leading-relaxed text-cream/60 mb-6">
              4 különálló apartman időpontra foglalható privát jakuzzival, panorámás terasszal és teljes felszereltséggel –
              Miskolctapolca szívében, a Bükk természeti kincseitől karnyújtásnyira.
            </p>

            {/* Social média */}
            <div className="flex items-center gap-3">

              <a href="https://www.facebook.com/profile.php?id=100078204042760"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-cream/20 text-cream/60 hover:text-cream hover:border-cream/50 transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigáció */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-cream mb-6">Navigáció</h3>
            <ul className="space-y-3">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="group flex items-center gap-1.5 text-sm text-cream/60 hover:text-cream transition-colors"
                  >
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Elérhetőség */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-cream mb-6">Elérhetőség</h3>
            <ul className="space-y-4">
              <li>
                <a href="https://www.google.com/maps/place/Mil%C3%A1n+Kuck%C3%B3/@48.0729848,20.747624,19.75z/data=!4m9!3m8!1s0x47409f03c29cd2c9:0x12b2c6f766a0724d!5m2!4m1!1i2!8m2!3d48.0731645!4d20.7470249!16s%2Fg%2F11xkrxtm8c" target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-cream/60 hover:text-cream transition-colors group"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-terra-400" />
                  3519 Miskolctapolca, Beregi utca 11.
                </a>
              </li>
              <li>
                <a href="tel:+36203599222" className="flex items-center gap-3 text-sm text-cream/60 hover:text-cream transition-colors">
                  <Phone size={16} className="shrink-0 text-terra-400" />
                  +36 20 359 9222
                </a>
              </li>
              <li>
                <a href="mailto:gammaapartmanok@gmail.com" className="flex items-center gap-3 text-sm text-cream/60 hover:text-cream transition-colors">
                  <Mail size={16} className="shrink-0 text-terra-400" />
                  gammaapartmanok@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-cream mb-6">Foglalás</h3>
            <p className="text-sm text-cream/60 mb-5 leading-relaxed">
              Foglaljon közvetlenül nálunk a legalacsonyabb áron.
            </p>
            <Link href="/foglalas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terra-400 text-white text-xs font-medium tracking-[0.15em] uppercase rounded-full hover:bg-terra-500 transition-all hover:-translate-y-0.5"
            >
              Szabad dátumok <ArrowUpRight size={14} />
            </Link>
            <div className="mt-5 p-4 rounded-xl border border-cream/10 bg-white/5 text-sm">
              <div className="flex justify-between text-cream/60 mb-1">
                <span>Érkezés</span><span className="text-cream">15:00 – 00:00</span>
              </div>
              <div className="flex justify-between text-cream/60">
                <span>Távozás</span><span className="text-cream">8:00 – 11:00</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} Gamma Apartmanok – Minden jog fenntartva.</p>
          <div className="flex gap-6">
            <Link href="/adatvedelem" className="hover:text-cream/70 transition-colors">Adatvédelem</Link>
            <Link href="/aszf" className="hover:text-cream/70 transition-colors">ÁSZF</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}