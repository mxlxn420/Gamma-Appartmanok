"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { hu }        from "date-fns/locale";
import { format }    from "date-fns";
import { motion }    from "framer-motion";
import { Plus, Trash2, X, RefreshCw } from "lucide-react";
import { formatDateHu }    from "@/lib/utils";

// Apartman szín per sorrend (Gamma 1-4)
const APT_COLORS = ["bg-emerald-500", "bg-orange-400", "bg-sky-500", "bg-violet-500"];
import "react-day-picker/dist/style.css";

interface BookingItem {
  id:           string;
  checkIn:      string;
  checkOut:     string;
  status:       string;
  guestName:    string;
  apartmentIds: string[];
}

interface BlockedItem {
  id:          string;
  dateFrom:    string;
  dateTo:      string;
  reason?:     string | null;
  apartmentId: string | null;
}

interface ApartmentOption {
  id:   string;
  name: string;
}

interface Props {
  bookings:   BookingItem[];
  blocked:    BlockedItem[];
  apartments: ApartmentOption[];
}

export default function AdminCalendar({ bookings, blocked: initialBlocked, apartments }: Props) {
  const [blocked, setBlocked]   = useState<BlockedItem[]>(initialBlocked);
  const [range, setRange]       = useState<{ from?: Date; to?: Date }>({});
  const [reason, setReason]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  // null = Összes, string = apartmentId
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Apartman → szín térkép
  const aptColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    apartments.forEach((apt, i) => { m[apt.id] = APT_COLORS[i % APT_COLORS.length]; });
    return m;
  }, [apartments]);

  // Nap → érintett apartman ID-k térkép (csak Összes fülhöz)
  const dayApartmentMap = useMemo(() => {
    if (activeTab !== null) return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    for (const booking of bookings) {
      const cur = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      while (cur < end) {
        const key = format(cur, "yyyy-MM-dd");
        const existing = map.get(key) ?? [];
        for (const aptId of booking.apartmentIds) {
          if (!existing.includes(aptId)) existing.push(aptId);
        }
        map.set(key, existing);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [bookings, activeTab]);

  // Refs hogy a stabil callback hozzáférjen a legfrissebb map-ekhez
  const dayApartmentMapRef = useRef(dayApartmentMap);
  dayApartmentMapRef.current = dayApartmentMap;
  const aptColorMapRef = useRef(aptColorMap);
  aptColorMapRef.current = aptColorMap;

  // Stabil DayButton – pontok az aktív apartmanokra
  const CustomDayButton = useCallback(({ day, modifiers, children, ...props }: any) => {
    const key = format(day.date, "yyyy-MM-dd");
    const aptIds = dayApartmentMapRef.current.get(key) ?? [];
    return (
      <button {...props}>
        {children}
        {aptIds.length > 0 && (
          <span className="flex gap-0.5 justify-center mt-0.5">
            {aptIds.map((id: string) => (
              <span key={id} className={`w-1.5 h-1.5 rounded-full inline-block ${aptColorMapRef.current[id] ?? "bg-stone-400"}`} />
            ))}
          </span>
        )}
      </button>
    );
  }, []);

  // Szűrt foglalások és blokkolt időszakok az aktív tab alapján
  const filteredBookings = activeTab === null
    ? bookings
    : bookings.filter(b => b.apartmentIds.includes(activeTab));

  const filteredBlocked = activeTab === null
    ? blocked
    : blocked.filter(b => b.apartmentId === null || b.apartmentId === activeTab);

  // Foglalt napok
  const bookedDays = filteredBookings.flatMap(({ checkIn, checkOut }) => {
    const days = [];
    const cur  = new Date(checkIn);
    const end  = new Date(checkOut);
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  });

  // Blokkolt napok (középső napok – érkezés/távozás nélkül)
  const blockedDays = filteredBlocked.flatMap(({ dateFrom, dateTo }) => {
    const days = [];
    const cur  = new Date(dateFrom);
    cur.setDate(cur.getDate() + 1); // első nap kihagyva
    const end  = new Date(dateTo);
    while (cur < end) {              // utolsó nap kihagyva
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  });

  // Érkezési napok (dateFrom) – átlós jobb-alul
  const blockedArrivalDays = filteredBlocked.map(({ dateFrom }) => new Date(dateFrom));

  // Távozási napok (dateTo) – csak ha nem azonos a dateFrom-mal
  const blockedDepartureDays = filteredBlocked
    .filter(({ dateFrom, dateTo }) => dateFrom !== dateTo)
    .map(({ dateTo }) => new Date(dateTo));

  // Egész napos blokk (dateFrom === dateTo)
  const blockedSingleDays = filteredBlocked
    .filter(({ dateFrom, dateTo }) => dateFrom === dateTo)
    .map(({ dateFrom }) => new Date(dateFrom));

  const handleBlock = async () => {
    if (!range.from || !range.to) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/block", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          dateFrom:    format(range.from, "yyyy-MM-dd"),
          dateTo:      format(range.to,   "yyyy-MM-dd"),
          reason:      reason || null,
          apartmentId: activeTab ?? null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBlocked((prev) => [...prev, data.data]);
        setRange({});
        setReason("");
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await fetch(`/api/admin/block/${id}`, { method: "DELETE" });
      setBlocked((prev) => prev.filter((b) => b.id !== id));
    } catch {
      console.error("Feloldás sikertelen");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res  = await fetch("/api/admin/ical-sync", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error("Szinkron hiba");
      const summary = data.results
        .map((r: any) => r.error
          ? `${r.source}: hiba (${r.error})`
          : `${r.source}: +${r.added} / -${r.removed}`
        )
        .join(", ");
      setSyncResult(summary || "Nincs beállított iCal forrás");

      // Frissítjük a blokkolt periódusokat
      const blockedRes = await fetch("/api/admin/block");
      const blockedData = await blockedRes.json();
      if (blockedData.success) setBlocked(blockedData.data.map((b: any) => ({
        ...b, apartmentId: b.apartmentId ?? null,
      })));
    } catch {
      setSyncResult("Hiba történt a szinkronizálás során");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Apartman fülek */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab(null); setShowForm(false); setRange({}); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === null
              ? "bg-forest-600 text-white shadow-sm"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          Összes
        </button>
        {apartments.map((apt) => (
          <button
            key={apt.id}
            onClick={() => { setActiveTab(apt.id); setShowForm(false); setRange({}); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === apt.id
                ? "bg-forest-600 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {apt.name}
          </button>
        ))}
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Naptár */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
        <DayPicker
          mode="range"
          selected={{ from: range.from, to: range.to }}
          onSelect={(r) => {
            setRange({ from: r?.from, to: r?.to });
            if (r?.from) setShowForm(true);
          }}
          numberOfMonths={isMobile ? 1 : 2}
          locale={hu}
          modifiers={{
            booked:          bookedDays,
            blocked:         blockedDays,
            blockedArrival:  blockedArrivalDays,
            blockedDeparture: blockedDepartureDays,
            blockedSingle:   blockedSingleDays,
          }}
          modifiersStyles={{
            booked:           { backgroundColor: "#dde8fb", color: "#2347a8" },
            blocked:          { backgroundColor: "#f5e6d8", color: "#a86435" },
            blockedArrival:   { background: "linear-gradient(to bottom right, transparent 50%, #f5e6d8 50%)", color: "#a86435" },
            blockedDeparture: { background: "linear-gradient(to bottom right, #f5e6d8 50%, transparent 50%)", color: "#a86435" },
            blockedSingle:    { background: "linear-gradient(to bottom right, #f5e6d8 50%, transparent 50%)", color: "#a86435" },
          }}
          {...(activeTab === null ? { components: { DayButton: CustomDayButton } } : {})}
        />

        {/* Jelmagyarázat */}
        <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-stone-100">
          {[
            { color: "bg-forest-900", label: "Kiválasztott" },
            { color: "bg-forest-100", label: "Foglalt"       },
            { color: "bg-terra-100",  label: "Zárva"         },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-stone-500">
              <span className={`w-4 h-4 rounded-full ${color} inline-block`} />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-4 h-4 rounded-full inline-block" style={{ background: "linear-gradient(to bottom right, transparent 50%, #f5e6d8 50%)", border: "1px solid #e7c9aa" }} />
            Érkezés
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-4 h-4 rounded-full inline-block" style={{ background: "linear-gradient(to bottom right, #f5e6d8 50%, transparent 50%)", border: "1px solid #e7c9aa" }} />
            Távozás
          </div>
          {activeTab === null && apartments.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {apartments.map((apt, i) => (
                <div key={apt.id} className="flex items-center gap-1 text-xs text-stone-500">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${APT_COLORS[i % APT_COLORS.length]}`} />
                  {apt.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobb panel */}
      <div className="space-y-4">

        {/* iCal szinkron */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="font-medium text-stone-800 mb-3">iCal szinkron</h3>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl bg-forest-800 text-cream text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Szinkronizálás..." : "Szinkronizálás most"}
          </button>
          {syncResult && (
            <p className="text-xs text-stone-500 mt-2 text-center">{syncResult}</p>
          )}
        </div>

        {/* Blokkolás form */}
        {showForm && range.from && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-stone-800">Napok zárása</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {activeTab ? apartments.find(a => a.id === activeTab)?.name ?? "" : "Minden apartman"}
                </p>
              </div>
              <button onClick={() => { setShowForm(false); setRange({}); }}>
                <X size={16} className="text-stone-400" />
              </button>
            </div>
            <div className="text-sm text-stone-600 mb-3">
              <span className="font-medium">{formatDateHu(range.from)}</span>
              {range.to && range.to !== range.from && (
                <> – <span className="font-medium">{formatDateHu(range.to)}</span></>
              )}
            </div>
            <input
              className="input-base mb-3"
              placeholder="Megjegyzés (pl. karbantartás)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button
              onClick={handleBlock}
              disabled={loading}
              className="btn-primary w-full justify-center text-sm py-3"
            >
              <Plus size={14} />
              {loading ? "Mentés..." : "Zárás"}
            </button>
          </motion.div>
        )}

        {/* Blokkolt időszakok listája */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="font-medium text-stone-800 mb-4">Zárt időszakok</h3>
          {filteredBlocked.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">
              Nincs zárt időszak
            </p>
          ) : (
            <div className="space-y-2">
              {filteredBlocked.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-terra-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      {formatDateHu(b.dateFrom)} – {formatDateHu(b.dateTo)}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {b.apartmentId
                        ? apartments.find(a => a.id === b.apartmentId)?.name ?? "Ismeretlen apartman"
                        : "Minden apartman"}
                    </p>
                    {b.reason && (
                      <p className="text-xs text-stone-400 mt-0.5">{b.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblock(b.id)}
                    className="w-7 h-7 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
    </div>
  );
}