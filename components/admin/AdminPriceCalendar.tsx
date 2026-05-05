"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getDay, addWeeks, subWeeks, startOfWeek, addDays,
  format, isSameDay, startOfDay,
} from "date-fns";
import { hu } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PricingRule } from "@/types";

interface ApartmentOption {
  id:   string;
  name: string;
}

interface Props {
  rules:      PricingRule[];
  apartments: ApartmentOption[];
}

function getApplicableRule(date: Date, rules: PricingRule[]): PricingRule | null {
  if (!rules.length) return null;
  const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  for (const rule of sorted) {
    if (rule.dateFrom && rule.dateTo) {
      const from = new Date(rule.dateFrom);
      const to   = new Date(rule.dateTo);
      if (date >= from && date <= to) return rule;
    }
  }
  return sorted.find((r) => !r.dateFrom && !r.dateTo) ?? null;
}

function getPriceForDay(date: Date, rule: PricingRule): number {
  if (rule.weekendPrice > 0 && [5, 6].includes(getDay(date))) return rule.weekendPrice;
  return rule.pricePerNight;
}

const RULE_COLORS = [
  { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-800",   badge: "bg-blue-100 text-blue-700"   },
  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-800",  badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", badge: "bg-purple-100 text-purple-700" },
  { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-800",   badge: "bg-teal-100 text-teal-700"   },
  { bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-800",   badge: "bg-rose-100 text-rose-700"   },
];
const BASE_COLOR = { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-700", badge: "bg-stone-100 text-stone-600" };

interface BookedRange { from: Date; to: Date; }

export default function AdminPriceCalendar({ rules, apartments }: Props) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(today, { weekStartsOn: 1 })
  );
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const url = activeTab
      ? `/api/availability?apartmentIds=${activeTab}`
      : "/api/availability";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBookedRanges([
            ...data.data.bookings,
            ...data.data.blocked,
          ].map((b: any) => ({ from: new Date(b.checkIn), to: new Date(b.checkOut) })));
        }
      })
      .catch(() => {});
  }, [activeTab]);

  // Aktív tab: globális + apt-specifikus szabályok (vagy csak globális)
  const filteredRules = useMemo(() =>
    activeTab === null
      ? rules
      : rules.filter(r => !(r as any).apartmentId || (r as any).apartmentId === activeTab),
    [rules, activeTab]
  );

  const isBooked = (day: Date) => {
    const d = startOfDay(day);
    return bookedRanges.some((r) => d >= startOfDay(r.from) && d < startOfDay(r.to));
  };

  const seasonRules = filteredRules.filter((r) => r.dateFrom || r.dateTo);
  const ruleColorMap: Record<string, typeof BASE_COLOR> = {};
  seasonRules.forEach((r, i) => {
    ruleColorMap[r.id] = RULE_COLORS[i % RULE_COLORS.length];
  });
  const baseRule = filteredRules.find((r) => !r.dateFrom && !r.dateTo);
  if (baseRule) ruleColorMap[baseRule.id] = BASE_COLOR;

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];

  return (
    <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setActiveTab(null)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === null ? "bg-forest-600 text-white shadow-sm" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
      >
        Globális
      </button>
      {apartments.map((apt) => (
        <button
          key={apt.id}
          onClick={() => setActiveTab(apt.id)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === apt.id ? "bg-forest-600 text-white shadow-sm" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
        >
          {apt.name}
        </button>
      ))}
    </div>
    <div className="bg-white rounded-2xl shadow-card p-6">

      {/* ── Mobil lista nézet ── */}
      <div className="sm:hidden">
        <h2 className="font-serif text-xl text-stone-800 mb-4">Árazási szabályok</h2>
        {filteredRules.length === 0 ? (
          <p className="text-center text-sm text-stone-400 py-6">Nincs aktív árazási szabály.</p>
        ) : (
          <div className="space-y-3">
            {filteredRules.map((rule) => {
              const colors = ruleColorMap[rule.id] ?? BASE_COLOR;
              return (
                <div key={rule.id} className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`font-medium text-sm ${colors.text}`}>{rule.name}</span>
                    {rule.dateFrom && rule.dateTo && (
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                        {format(new Date(rule.dateFrom), "MM. dd.")} – {format(new Date(rule.dateTo), "MM. dd.")}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-stone-400">1–2 fő/éj</p>
                      <p className={`font-semibold ${colors.text}`}>{formatCurrency(rule.pricePerNight)}</p>
                    </div>
                    {(rule as any).price3 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">3 fő/éj</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).price3)}</p>
                      </div>
                    )}
                    {(rule as any).price4 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">4 fő/éj</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).price4)}</p>
                      </div>
                    )}
                    {(rule as any).price5 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">5 fő/éj</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).price5)}</p>
                      </div>
                    )}
                    {(rule as any).price6 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">6 fő/éj</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).price6)}</p>
                      </div>
                    )}
                    {rule.weekendPrice > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Hétvége 1–2 fő</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency(rule.weekendPrice)}</p>
                      </div>
                    )}
                    {(rule as any).weekendPrice3 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Hétvége 3 fő</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).weekendPrice3)}</p>
                      </div>
                    )}
                    {(rule as any).weekendPrice4 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Hétvége 4 fő</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).weekendPrice4)}</p>
                      </div>
                    )}
                    {(rule as any).weekendPrice5 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Hétvége 5 fő</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).weekendPrice5)}</p>
                      </div>
                    )}
                    {(rule as any).weekendPrice6 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Hétvége 6 fő</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency((rule as any).weekendPrice6)}</p>
                      </div>
                    )}
                    {rule.childPrice2to6 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Gyerek 2–6/éj</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency(rule.childPrice2to6)}</p>
                      </div>
                    )}
                    {rule.childPrice6to12 > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Gyerek 6–12/éj</p>
                        <p className={`font-semibold ${colors.text}`}>{formatCurrency(rule.childPrice6to12)}</p>
                      </div>
                    )}
                    {rule.minNights > 1 && (
                      <div>
                        <p className="text-xs text-stone-400">Min. éjszaka</p>
                        <p className={`font-semibold ${colors.text}`}>{rule.minNights} éj</p>
                      </div>
                    )}
                    {(rule as any).minAdvanceDays > 0 && (
                      <div>
                        <p className="text-xs text-stone-400">Előfoglalás</p>
                        <p className={`font-semibold ${colors.text}`}>{(rule as any).minAdvanceDays} nap</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Desktop heti rács nézet ── */}
      <div className="hidden sm:block">
        {/* Fejléc */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-medium text-stone-800">{format(weekStart, "yyyy. MMM d.", { locale: hu })}</span>
            <span className="text-stone-400 mx-2">–</span>
            <span className="font-medium text-stone-800">{format(weekEnd, "MMM d.", { locale: hu })}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setWeekStart((w) => subWeeks(w, 1))} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekStart(startOfWeek(today, { weekStartsOn: 1 }))} className="px-3 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 transition-colors">
              Ezen a héten
            </button>
            <button onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Heti rács */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const rule    = getApplicableRule(day, filteredRules);
            const price   = rule ? getPriceForDay(day, rule) : null;
            const colors  = rule ? (ruleColorMap[rule.id] ?? BASE_COLOR) : BASE_COLOR;
            const weekend = [5, 6].includes(getDay(day));
            const isToday = isSameDay(day, today);
            const booked  = isBooked(day);
            return (
              <div
                key={day.toISOString()}
                className={`rounded-2xl border p-3 flex flex-col gap-1.5 relative overflow-hidden ${booked ? "border-red-300" : colors.border} ${booked ? "bg-red-50" : colors.bg} ${isToday ? "ring-2 ring-forest-500 ring-offset-1" : ""}`}
              >
                {booked && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(239,68,68,0.08) 6px, rgba(239,68,68,0.08) 12px)" }}
                  />
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${weekend ? "text-red-500" : "text-stone-500"}`}>
                    {format(day, "EEE", { locale: hu }).toUpperCase()}
                  </span>
                  <span className={`text-sm font-bold ${booked ? "text-red-700" : colors.text}`}>{format(day, "d")}</span>
                </div>
                {booked && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white w-fit z-10">Foglalt</span>
                )}
                {rule ? (
                  <>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${colors.badge}`}>{rule.name}</span>
                    <div className="mt-0.5 space-y-0.5">
                      <div>
                        <p className="text-[10px] text-stone-400 leading-none">1–2 fő/éj</p>
                        <p className={`text-xs font-bold ${colors.text}`}>{formatCurrency(price!)}</p>
                      </div>
                      {(rule as any).price3 > 0 && (
                        <div>
                          <p className="text-[10px] text-stone-400 leading-none">3 fő/éj</p>
                          <p className={`text-xs font-semibold ${colors.text}`}>{formatCurrency(weekend && (rule as any).weekendPrice3 > 0 ? (rule as any).weekendPrice3 : (rule as any).price3)}</p>
                        </div>
                      )}
                      {(rule as any).price4 > 0 && (
                        <div>
                          <p className="text-[10px] text-stone-400 leading-none">4 fő/éj</p>
                          <p className={`text-xs font-semibold ${colors.text}`}>{formatCurrency(weekend && (rule as any).weekendPrice4 > 0 ? (rule as any).weekendPrice4 : (rule as any).price4)}</p>
                        </div>
                      )}
                      {(rule as any).price5 > 0 && (
                        <div>
                          <p className="text-[10px] text-stone-400 leading-none">5 fő/éj</p>
                          <p className={`text-xs font-semibold ${colors.text}`}>{formatCurrency(weekend && (rule as any).weekendPrice5 > 0 ? (rule as any).weekendPrice5 : (rule as any).price5)}</p>
                        </div>
                      )}
                      {(rule as any).price6 > 0 && (
                        <div>
                          <p className="text-[10px] text-stone-400 leading-none">6 fő/éj</p>
                          <p className={`text-xs font-semibold ${colors.text}`}>{formatCurrency(weekend && (rule as any).weekendPrice6 > 0 ? (rule as any).weekendPrice6 : (rule as any).price6)}</p>
                        </div>
                      )}
                    </div>
                    {(rule.childPrice2to6 > 0 || rule.childPrice6to12 > 0) && (
                      <div className="border-t border-current border-opacity-10 pt-1.5 space-y-0.5">
                        {rule.childPrice2to6 > 0 && (
                          <div>
                            <p className="text-[10px] text-stone-400 leading-none">Gyerek 2–6</p>
                            <p className={`text-xs font-semibold ${colors.text}`}>{formatCurrency(rule.childPrice2to6)}</p>
                          </div>
                        )}
                        {rule.childPrice6to12 > 0 && (
                          <div>
                            <p className="text-[10px] text-stone-400 leading-none">Gyerek 6–12</p>
                            <p className={`text-xs font-semibold ${colors.text}`}>{formatCurrency(rule.childPrice6to12)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {(rule.minNights > 1 || (rule as any).minAdvanceDays > 0) && (
                      <div className="border-t border-current border-opacity-10 pt-1.5 space-y-0.5">
                        {rule.minNights > 1 && (
                          <div>
                            <p className="text-[10px] text-stone-400 leading-none">Min. foglalás</p>
                            <p className={`text-xs font-semibold ${colors.text}`}>{rule.minNights} éj</p>
                          </div>
                        )}
                        {(rule as any).minAdvanceDays > 0 && (
                          <div>
                            <p className="text-[10px] text-stone-400 leading-none">Előfoglalás</p>
                            <p className={`text-xs font-semibold ${colors.text}`}>{(rule as any).minAdvanceDays} nap</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-stone-400 mt-1">Nincs aktív szabály</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Jelmagyarázat */}
        {filteredRules.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-stone-100">
            {filteredRules.map((rule) => {
              const colors = ruleColorMap[rule.id] ?? BASE_COLOR;
              return (
                <div key={rule.id} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                  {rule.name}
                  {rule.dateFrom && rule.dateTo && (
                    <span className="opacity-60">({format(new Date(rule.dateFrom), "MM.dd.")}–{format(new Date(rule.dateTo), "MM.dd.")})</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
    </div>
  );
}
