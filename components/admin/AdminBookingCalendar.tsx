"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths,
  isSameDay, format, getDay, startOfDay,
} from "date-fns";
import { hu } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BookingStatus } from "@/types";

interface BookingItem {
  id:           string;
  guestName:    string;
  checkIn:      string;
  checkOut:     string;
  status:       BookingStatus;
  apartmentIds?: string[];
}

interface ApartmentOption {
  id:   string;
  name: string;
}

interface Props {
  bookings:   BookingItem[];
  apartments: ApartmentOption[];
}

const APT_COLORS: Record<number, string> = {
  0: "bg-emerald-500",
  1: "bg-orange-400",
  2: "bg-sky-500",
  3: "bg-violet-500",
};

const STATUS_CONFIG: Record<BookingStatus, { label: string; border: string }> = {
  PENDING:   { label: "Előlegre vár", border: "border-yellow-400" },
  CONFIRMED: { label: "Jóváhagyva",  border: "border-forest-400" },
  PAID:      { label: "Fizetve",     border: "border-green-400"  },
  CANCELLED: { label: "Elutasítva",  border: "border-red-300"    },
  BLOCKED:   { label: "Zárva",       border: "border-stone-400"  },
};

// Visszatér a napon megjelenítendő foglalásokkal: először a távozók, majd az érkezők
function getDayBookings(day: Date, bookings: BookingItem[]): { booking: BookingItem; isCheckOut: boolean }[] {
  const d = startOfDay(day);
  const checkingOut = bookings.filter((b) => {
    if (b.status === "CANCELLED") return false;
    return isSameDay(startOfDay(new Date(b.checkOut)), d);
  }).map((b) => ({ booking: b, isCheckOut: true }));

  const staying = bookings.filter((b) => {
    if (b.status === "CANCELLED") return false;
    const checkIn  = startOfDay(new Date(b.checkIn));
    const checkOut = startOfDay(new Date(b.checkOut));
    return d >= checkIn && d < checkOut && !isSameDay(checkIn, d);
  }).map((b) => ({ booking: b, isCheckOut: false }));

  const checkingIn = bookings.filter((b) => {
    if (b.status === "CANCELLED") return false;
    return isSameDay(startOfDay(new Date(b.checkIn)), d);
  }).map((b) => ({ booking: b, isCheckOut: false }));

  return [...checkingOut, ...staying, ...checkingIn];
}

export default function AdminBookingCalendar({ bookings, apartments }: Props) {
  const today = new Date();
  const [month, setMonth]       = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState<BookingItem | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // apartmentId → szín index térkép
  const aptColorIndex = useMemo(() => {
    const m: Record<string, number> = {};
    apartments.forEach((apt, i) => { m[apt.id] = i; });
    return m;
  }, [apartments]);

  const filteredBookings = activeTab === null
    ? bookings
    : bookings.filter(b => b.apartmentIds?.includes(activeTab) ?? false);

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const firstDayOffset = (getDay(days[0]) + 6) % 7;

  const monthBookings = filteredBookings.filter((b) => {
    if (b.status === "CANCELLED") return false;
    const checkIn  = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    return checkIn <= endOfMonth(month) && checkOut >= startOfMonth(month);
  });

  const monthBookingsSorted = [...monthBookings].sort(
    (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  );

  const Header = (
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-serif text-xl text-stone-800">
        {format(month, "yyyy. MMMM", { locale: hu })}
      </h2>
      <div className="flex gap-2">
        <button onClick={() => setMonth((m) => subMonths(m, 1))} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setMonth(startOfMonth(today))} className="px-3 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 transition-colors">
          Ma
        </button>
        <button onClick={() => setMonth((m) => addMonths(m, 1))} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => { setActiveTab(null); setSelected(null); }}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === null ? "bg-forest-600 text-white shadow-sm" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
      >
        Összes
      </button>
      {apartments.map((apt) => (
        <button
          key={apt.id}
          onClick={() => { setActiveTab(apt.id); setSelected(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === apt.id ? "bg-forest-600 text-white shadow-sm" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
        >
          {apt.name}
        </button>
      ))}
    </div>
    <div className="bg-white rounded-2xl shadow-card p-6">

      {/* ── Mobil lista nézet ── */}
      <div className="sm:hidden">
        {Header}
        {monthBookingsSorted.length === 0 ? (
          <p className="text-center text-sm text-stone-400 py-6">Nincs foglalás ebben a hónapban.</p>
        ) : (
          <div className="space-y-3">
            {monthBookingsSorted.map((b) => {
              const cfg = STATUS_CONFIG[b.status];
              return (
                <div key={b.id} className={`rounded-xl border-l-4 ${cfg.border} bg-stone-50 p-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-stone-800">{b.guestName}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeTab === null && b.apartmentIds && b.apartmentIds.length > 0 && (
                        <span className="flex gap-0.5 items-center">
                          {b.apartmentIds.map((id) => (
                            <span key={id} className={`w-2 h-2 rounded-full inline-block ${APT_COLORS[aptColorIndex[id] ?? 0] ?? "bg-stone-400"}`} />
                          ))}
                        </span>
                      )}
                      <span className="text-xs font-medium text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    {format(new Date(b.checkIn), "yyyy. MM. dd.")} – {format(new Date(b.checkOut), "MM. dd.")}
                  </p>
                  <p className="font-mono text-xs text-stone-300 mt-0.5">{b.id.slice(-8)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Desktop naptár nézet ── */}
      <div className="hidden sm:block">
        {Header}

        <div className="grid grid-cols-7 mb-1">
          {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-stone-400 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px]" />
          ))}
          {days.map((day) => {
            const dayBookings = getDayBookings(day, filteredBookings);
            const isToday     = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[90px] rounded-xl border p-1.5 flex flex-col gap-1 transition-colors
                  ${dayBookings.length > 0 ? "border-stone-200 bg-stone-50" : "border-stone-100 bg-white"}
                  ${isToday ? "ring-2 ring-forest-500 ring-offset-1" : ""}`}
              >
                <span className={`text-xs font-semibold ${isToday ? "text-forest-700" : "text-stone-500"}`}>
                  {format(day, "d")}
                </span>
                {dayBookings.map(({ booking: b, isCheckOut: isCO }) => {
                  const status = STATUS_CONFIG[b.status];
                  return (
                    <button
                      key={b.id + (isCO ? "-out" : "-in")}
                      onClick={() => setSelected(selected?.id === b.id ? null : b)}
                      className={`w-full text-left rounded-lg px-1.5 py-1 border-l-2 hover:opacity-80 transition-opacity
                        ${isCO ? "bg-red-50 text-red-800 border-red-300 opacity-70" : `bg-forest-50 text-forest-800 ${status.border}`}`}
                    >
                      <p className="text-[10px] font-semibold leading-tight truncate">{b.guestName}</p>
                      <p className="text-[9px] opacity-60 leading-tight">{isCO ? "Távozik" : status.label}</p>
                      {activeTab === null && b.apartmentIds && b.apartmentIds.length > 0 && (
                        <span className="flex gap-0.5 mt-0.5">
                          {b.apartmentIds.map((id) => (
                            <span key={id} className={`w-1.5 h-1.5 rounded-full inline-block ${APT_COLORS[aptColorIndex[id] ?? 0] ?? "bg-stone-400"}`} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <p className="font-medium text-stone-800">{selected.guestName}</p>
              <p className="text-sm text-stone-500">
                {format(new Date(selected.checkIn), "yyyy. MM. dd.")} – {format(new Date(selected.checkOut), "MM. dd.")}
                {" · "}{STATUS_CONFIG[selected.status]?.label}
              </p>
            </div>
            <span className="font-mono text-xs text-stone-400">{selected.id}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-stone-100 text-xs text-stone-500">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <span key={key} className={`border-l-2 pl-1.5 ${cfg.border}`}>{cfg.label}</span>
          ))}
          {activeTab === null && apartments.map((apt, i) => (
            <span key={apt.id} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full inline-block ${APT_COLORS[i] ?? "bg-stone-400"}`} />
              {apt.name}
            </span>
          ))}
        </div>

        {monthBookings.length === 0 && (
          <p className="text-center text-sm text-stone-400 mt-4">Nincs foglalás ebben a hónapban.</p>
        )}
      </div>

    </div>
    </div>
  );
}
