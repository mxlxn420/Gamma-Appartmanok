"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";
import { format, addDays } from "date-fns";
import { hu } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { useBookingStore } from "@/store/bookingStore";
import "react-day-picker/dist/style.css";

type Panel = "none" | "checkin" | "checkout" | "guests";

function Counter({
  label, sublabel, value, min = 0, atMax = false, onChange,
}: {
  label: string; sublabel?: string; value: number; min?: number; atMax?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <div>
        <p className="text-sm text-stone-700 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors"
        >
          <Minus size={13} />
        </button>
        <span className="w-5 text-center font-semibold text-stone-800 text-sm">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function BookingWidget() {
  const router = useRouter();
  const {
    setCheckIn:  storeSetCheckIn,
    setCheckOut: storeSetCheckOut,
    setAdults:   storeSetAdults,
    setTeens:    storeSetTeens,
    setBabies:   storeSetBabies,
  } = useBookingStore();

  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults]     = useState(2);
  const [teens, setTeens]       = useState(0);
  const [babies, setBabies]     = useState(0);
  const [panel, setPanel]       = useState<Panel>("none");
  const [isMobile, setIsMobile] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggle = (p: Panel) => setPanel((prev) => (prev === p ? "none" : p));
  const fmt    = (d: Date | null) => d ? format(d, "yyyy. MM. dd.", { locale: hu }) : null;

  const totalGuests = adults + teens + babies;
  const guestLabel  = teens > 0 || babies > 0
    ? `${adults} felnőtt${teens > 0 ? `, ${teens} gyerek` : ""}${babies > 0 ? `, ${babies} baba` : ""}`
    : `${adults} felnőtt`;

  const nights = checkIn && checkOut
    ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
    : null;

  // Panel pozíció számítás (mindig lefelé nyílik)
  useEffect(() => {
    if (panel === "none" || !widgetRef.current) return;
    const update = () => {
      if (!widgetRef.current) return;
      const rect = widgetRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openDown = spaceBelow > 320 || spaceBelow > window.innerHeight / 2;
      setPanelStyle(openDown
        ? { position: "fixed", top: rect.bottom + 8, left: isMobile ? 8 : rect.left, right: isMobile ? 8 : "auto", zIndex: 9999 }
        : { position: "fixed", bottom: window.innerHeight - rect.top + 8, left: isMobile ? 8 : rect.left, right: isMobile ? 8 : "auto", zIndex: 9999 }
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [panel, isMobile]);

  const handleBooking = () => {
    storeSetCheckIn(checkIn);
    storeSetCheckOut(checkOut);
    storeSetAdults(adults);
    storeSetTeens(teens);
    storeSetBabies(babies);
    router.push("/foglalas");
  };

  return (
    <div className="relative w-full max-w-3xl" ref={widgetRef}>

      {/* Mobil gomb */}
      <div className="md:hidden">
        <motion.a
          href="/foglalas"
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 text-forest-900 font-medium text-sm"
        >
          <Calendar size={18} className="text-forest-700" />
          Foglaljon most
          <ArrowRight size={16} className="text-terra-400" />
        </motion.a>
      </div>

      {/* Desktop widget */}
      <div className="hidden md:block bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-visible">
        <div className="flex divide-x divide-stone-100/80">

          {/* Érkezés */}
          <button
            onClick={() => toggle("checkin")}
            className={`flex-1 flex items-center gap-3 px-5 py-4 text-left rounded-l-2xl transition-colors hover:bg-stone-50/60 ${panel === "checkin" ? "bg-stone-50/80" : ""}`}
          >
            <Calendar size={17} className="text-terra-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-400 mb-0.5">Érkezés</p>
              <p className={`text-sm font-medium truncate ${checkIn ? "text-stone-800" : "text-stone-400"}`}>
                {fmt(checkIn) ?? "Dátum kiválasztása"}
              </p>
            </div>
            <ChevronDown size={14} className={`ml-auto text-stone-300 shrink-0 transition-transform ${panel === "checkin" ? "rotate-180" : ""}`} />
          </button>

          {/* Távozás */}
          <button
            onClick={() => toggle("checkout")}
            className={`flex-1 flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-stone-50/60 ${panel === "checkout" ? "bg-stone-50/80" : ""}`}
          >
            <Calendar size={17} className="text-terra-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-400 mb-0.5">Távozás</p>
              <p className={`text-sm font-medium truncate ${checkOut ? "text-stone-800" : "text-stone-400"}`}>
                {fmt(checkOut) ?? "Dátum kiválasztása"}
              </p>
            </div>
            <ChevronDown size={14} className={`ml-auto text-stone-300 shrink-0 transition-transform ${panel === "checkout" ? "rotate-180" : ""}`} />
          </button>

          {/* Vendégek */}
          <button
            onClick={() => toggle("guests")}
            className={`flex-1 flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-stone-50/60 ${panel === "guests" ? "bg-stone-50/80" : ""}`}
          >
            <Users size={17} className="text-terra-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-400 mb-0.5">Vendégek</p>
              <p className="text-sm font-medium text-stone-800 truncate">{guestLabel}</p>
            </div>
            <ChevronDown size={14} className={`ml-auto text-stone-300 shrink-0 transition-transform ${panel === "guests" ? "rotate-180" : ""}`} />
          </button>

          {/* CTA */}
          <div className="flex items-center px-4 py-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBooking}
              className="flex items-center gap-2 px-7 py-3 bg-terra-400 hover:bg-terra-500 text-white text-xs font-semibold tracking-[0.15em] uppercase rounded-xl transition-colors whitespace-nowrap"
            >
              Foglalás <ArrowRight size={14} />
            </motion.button>
          </div>

        </div>

        {/* Éjszakák kis badge */}
        {nights && nights > 0 && (
          <div className="px-5 pb-2.5 flex gap-2 items-center">
            <span className="text-xs text-stone-400">{nights} éjszaka</span>
            <span className="text-stone-200">·</span>
            <span className="text-xs text-stone-400">{totalGuests} vendég</span>
          </div>
        )}
      </div>

      {/* Panelek */}
      <AnimatePresence>
        {(panel === "checkin" || panel === "checkout") && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={panelStyle}
            className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-4"
          >
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 px-1">
              {panel === "checkin" ? "Érkezés dátuma" : "Távozás dátuma"}
            </p>
            <DayPicker
              mode="range"
              selected={{ from: checkIn ?? undefined, to: checkOut ?? undefined }}
              onSelect={(range) => {
                const from = range?.from ?? null;
                const to   = range?.to   ?? null;
                setCheckIn(from);
                setCheckOut(to);
                storeSetCheckIn(from);
                storeSetCheckOut(to);
                if (from && to) setPanel("none");
              }}
              startMonth={new Date()}
              endMonth={addDays(new Date(), 365)}
              disabled={{ before: new Date(), after: addDays(new Date(), 365) }}
              numberOfMonths={isMobile ? 1 : 2}
              locale={hu}
            />
          </motion.div>
        )}

        {panel === "guests" && (
          <motion.div
            key="guests"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ ...panelStyle, left: typeof panelStyle.left === "number" ? Math.max(8, (panelStyle.left as number) + 200) : panelStyle.left }}
            className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 w-[300px]"
          >
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Vendégek száma
            </p>
            <Counter
              label="Felnőtt"
              sublabel="18+ év · IFA köteles"
              value={adults}
              min={1}
              onChange={(n) => { setAdults(n); storeSetAdults(n); }}
            />
            <Counter
              label="Gyerek"
              sublabel="2–17 év"
              value={teens}
              onChange={(n) => { setTeens(n); storeSetTeens(n); }}
            />
            <Counter
              label="Baba"
              sublabel="0–2 év · ingyenes"
              value={babies}
              onChange={(n) => { setBabies(n); storeSetBabies(n); }}
            />
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
              <p className="text-xs text-stone-500">Összesen: <strong className="text-stone-700">{totalGuests} fő</strong></p>
              <button
                onClick={() => setPanel("none")}
                className="text-xs text-forest-600 font-medium hover:text-forest-800 transition-colors"
              >
                Kész
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {panel !== "none" && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setPanel("none")} />
      )}
    </div>
  );
}
