"use client";

import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import { DayPicker, DateRange } from "react-day-picker";
import { differenceInCalendarDays, getDay, startOfDay, addDays, format } from "date-fns";
import { hu }                  from "date-fns/locale";
import { ArrowRight, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDateHu, formatCurrency }  from "@/lib/utils";
import { useBookingStore }     from "@/store/bookingStore";
import type { BookingData, ApartmentGuests } from "./BookingPage";
import "react-day-picker/dist/style.css";

interface PricingRule {
  id:             string;
  name:           string;
  pricePerNight:  number;
  price3:         number;
  price4:         number;
  weekendPrice:   number;
  weekendPrice3:  number;
  weekendPrice4:  number;
  childPrice2to6: number;
  childPrice6to12: number;
  dateFrom:       string | null;
  dateTo:         string | null;
  minNights:      number;
  minAdvanceDays: number;
  isActive:       boolean;
  priority:       number;
  apartmentId:    string | null;
}

interface BookedRange { from: Date; to: Date; }

function getApplicableRuleForApartment(date: Date, rules: PricingRule[], apartmentId: string): PricingRule | null {
  const dateStr = format(date, "yyyy-MM-dd");

  // Apartman-specifikus szabályok előnyben
  for (const scope of [rules.filter(r => r.apartmentId === apartmentId), rules.filter(r => r.apartmentId === null)]) {
    const sorted = [...scope].sort((a, b) => b.priority - a.priority);
    for (const rule of sorted) {
      if (rule.dateFrom && rule.dateTo) {
        const fromStr = format(new Date(rule.dateFrom), "yyyy-MM-dd");
        const toStr   = format(new Date(rule.dateTo),   "yyyy-MM-dd");
        if (dateStr >= fromStr && dateStr <= toStr) return rule;
      }
    }
    const base = sorted.find(r => !r.dateFrom && !r.dateTo);
    if (base) return base;
  }
  return null;
}

function getGlobalApplicableRule(date: Date, rules: PricingRule[]): PricingRule | null {
  const globalRules = rules.filter(r => r.apartmentId === null);
  const dateStr = format(date, "yyyy-MM-dd");
  const sorted = [...globalRules].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    if (rule.dateFrom && rule.dateTo) {
      const fromStr = format(new Date(rule.dateFrom), "yyyy-MM-dd");
      const toStr   = format(new Date(rule.dateTo),   "yyyy-MM-dd");
      if (dateStr >= fromStr && dateStr <= toStr) return rule;
    }
  }
  return sorted.find(r => !r.dateFrom && !r.dateTo) ?? null;
}

function getPriceForNight(date: Date, rule: PricingRule, personCount: number): number {
  const isWeekend = [5, 6].includes(getDay(date));
  const wkday3 = rule.price3 > 0 ? rule.price3 : rule.pricePerNight;
  const wkday4 = rule.price4 > 0 ? rule.price4 : wkday3;
  let tier1to2: number, tier3: number, tier4: number;
  if (isWeekend) {
    tier1to2 = rule.weekendPrice  > 0 ? rule.weekendPrice  : rule.pricePerNight;
    tier3    = rule.weekendPrice3 > 0 ? rule.weekendPrice3 : wkday3;
    tier4    = rule.weekendPrice4 > 0 ? rule.weekendPrice4 : wkday4;
  } else {
    tier1to2 = rule.pricePerNight;
    tier3    = wkday3;
    tier4    = wkday4;
  }
  if (personCount >= 4) return tier4;
  if (personCount >= 3) return tier3;
  return tier1to2;
}

function calcApartmentPrice(
  checkIn: Date, checkOut: Date, rules: PricingRule[], apt: ApartmentGuests
): { baseTotal: number; touristTax: number; nightBreakdown: { count: number; rate: number }[] } {
  // personCount: felnőtt + gyerek + (baba - 1, első ingyenes)
  const personCount = apt.adults + apt.children + Math.max(0, apt.babies - 1);
  let baseTotal = 0;
  const groups: { count: number; rate: number }[] = [];
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const rule = getApplicableRuleForApartment(cur, rules, apt.id);
    const rate = rule ? getPriceForNight(cur, rule, personCount) : 0;
    if (groups.length > 0 && groups[groups.length - 1].rate === rate) {
      groups[groups.length - 1].count++;
    } else {
      groups.push({ count: 1, rate });
    }
    baseTotal += rate;
    cur.setDate(cur.getDate() + 1);
  }
  const nights    = differenceInCalendarDays(checkOut, checkIn);
  const touristTax = 450 * apt.adults * nights;
  return { baseTotal, touristTax, nightBreakdown: groups };
}

function getEffectiveMinNights(checkIn: Date, checkOut: Date, rules: PricingRule[]): number {
  let max = 1;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const rule = getGlobalApplicableRule(cur, rules);
    if (rule && rule.minNights > max) max = rule.minNights;
    cur.setDate(cur.getDate() + 1);
  }
  return max;
}

function isRangeOverlapping(from: Date, to: Date, bookedRanges: BookedRange[]): boolean {
  const f = startOfDay(from);
  const t = startOfDay(to);
  return bookedRanges.some((r) => f < startOfDay(r.to) && t > startOfDay(r.from));
}

interface Props {
  apartmentGuests: ApartmentGuests[];
  onBack:          () => void;
  onNext:          (data: BookingData) => void;
}

export default function BookingCalendar({ apartmentGuests, onBack, onNext }: Props) {
  const store = useBookingStore();

  const storeCheckIn  = store.checkIn  ? new Date(store.checkIn)  : null;
  const storeCheckOut = store.checkOut ? new Date(store.checkOut) : null;

  const [range, setRange]               = useState<DateRange | undefined>(
    storeCheckIn && storeCheckOut ? { from: storeCheckIn, to: storeCheckOut } : undefined
  );
  const [error, setError]               = useState<string | null>(null);
  const [rules, setRules]               = useState<PricingRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [discount, setDiscount]         = useState<{ name: string; discountPercent: number } | null>(null);
  const [openApt, setOpenApt]           = useState<string | null>(null);

  const apartmentIds = apartmentGuests.map(a => a.id).join(",");

  useEffect(() => {
    fetch("/api/pricing")
      .then(r => r.json())
      .then(d => { if (d.success) setRules(d.data); })
      .catch(console.error)
      .finally(() => setLoadingRules(false));
  }, []);

  useEffect(() => {
    fetch(`/api/availability?apartmentIds=${apartmentIds}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBookedRanges([...d.data.bookings, ...d.data.blocked].map((b: any) => ({
            from: new Date(b.checkIn),
            to:   new Date(b.checkOut),
          })));
        }
      })
      .catch(console.error);
  }, [apartmentIds]);

  useEffect(() => {
    if (!range?.from || !range?.to) { setDiscount(null); return; }
    const ci = format(range.from, "yyyy-MM-dd");
    const co = format(range.to,   "yyyy-MM-dd");
    fetch(`/api/discounts?checkIn=${ci}&checkOut=${co}`)
      .then(r => r.json())
      .then(d => { if (d.success) setDiscount(d.data); })
      .catch(() => {});
  }, [range]);

  const checkIn  = range?.from ?? null;
  const checkOut = range?.to   ?? null;
  const nights   = checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;
  const minNights = checkIn && checkOut ? getEffectiveMinNights(checkIn, checkOut, rules) : 2;

  const weekendNights = checkIn && checkOut ? (() => {
    let count = 0;
    const cur = new Date(checkIn);
    while (cur < checkOut) { if ([5, 6].includes(getDay(cur))) count++; cur.setDate(cur.getDate() + 1); }
    return count;
  })() : 0;
  const weekdayNights = nights - weekendNights;

  // Per-apartman árszámítás
  const aptPrices = checkIn && checkOut && nights > 0
    ? apartmentGuests.map(apt => ({ apt, ...calcApartmentPrice(checkIn, checkOut, rules, apt) }))
    : [];

  const totalBase       = aptPrices.reduce((s, a) => s + a.baseTotal, 0);
  const totalTouristTax = aptPrices.reduce((s, a) => s + a.touristTax, 0);
  const discountAmount  = discount ? Math.round(totalBase * discount.discountPercent / 100) : 0;
  const grandTotal      = totalBase + totalTouristTax - discountAmount;

  // Összesített vendégszámok
  const totalAdults   = apartmentGuests.reduce((s, a) => s + a.adults, 0);
  const totalChildren = apartmentGuests.reduce((s, a) => s + a.children, 0);
  const totalBabies   = apartmentGuests.reduce((s, a) => s + a.babies, 0);
  const totalGuests   = totalAdults + totalChildren + totalBabies;

  const handleSelect = (r: DateRange | undefined) => {
    setError(null);
    if (r?.from && r?.to && isRangeOverlapping(r.from, r.to, bookedRanges)) {
      setError("Ez az időszak már foglalt! Kérjük válasszon másik dátumot.");
      setRange(undefined);
      return;
    }
    setRange(r);
    if (r?.from) store.setCheckIn(r.from);
    if (r?.to)   store.setCheckOut(r.to);
  };

  const handleNext = () => {
    setError(null);
    if (!checkIn || !checkOut) { setError("Kérjük válasszon érkezési és távozási dátumot!"); return; }
    if (nights < minNights) { setError(`Minimum ${minNights} éjszakára lehet foglalni ebben az időszakban!`); return; }
    if (isRangeOverlapping(checkIn, checkOut, bookedRanges)) { setError("Ez az időszak már foglalt!"); return; }

    const refApt = aptPrices[0];
    onNext({
      apartmentGuests,
      checkIn,
      checkOut,
      guests:          totalGuests,
      adults:          totalAdults,
      children:        totalChildren,
      babies:          totalBabies,
      nights,
      weekdayNights,
      weekendNights,
      weekdayRate:     refApt?.nightBreakdown[0]?.rate ?? 0,
      weekendRate:     refApt?.nightBreakdown[0]?.rate ?? 0,
      totalPrice:      grandTotal,
      basePrice:       totalBase,
      childPrice2to6:  0,
      childPrice6to12: 0,
      guestSurcharge:  0,
      touristTax:      totalTouristTax,
      discountPercent: discount?.discountPercent ?? 0,
      discountAmount,
      discountName:    discount?.name ?? "",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Naptár */}
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-card p-6">
        <h2 className="font-serif text-xl text-forest-900 mb-1">Válasszon dátumot</h2>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleSelect}
          startMonth={startOfDay(new Date())}
          endMonth={startOfDay(addDays(new Date(), 365))}
          numberOfMonths={2}
          locale={hu}
          disabled={(day) => {
            const d = startOfDay(day);
            const latest  = startOfDay(addDays(new Date(), 365));
            const advance = getGlobalApplicableRule(d, rules)?.minAdvanceDays ?? 2;
            const earliest = startOfDay(addDays(new Date(), advance));
            if (d < earliest || d > latest) return true;
            return bookedRanges.some(r => d > startOfDay(r.from) && d < startOfDay(r.to));
          }}
          modifiers={{
            booked: (day) => bookedRanges.some(r => {
              const d = startOfDay(day);
              return d > startOfDay(r.from) && d < startOfDay(r.to);
            }),
            checkoutOnly: (day) => {
              const d = startOfDay(day);
              return bookedRanges.some(r => d.getTime() === startOfDay(r.from).getTime());
            },
            tooSoon: (day) => {
              const d = startOfDay(day);
              const advance = getGlobalApplicableRule(d, rules)?.minAdvanceDays ?? 2;
              const earliest = startOfDay(addDays(new Date(), advance));
              return d >= startOfDay(new Date()) && d < earliest;
            },
          }}
          modifiersStyles={{
            booked:       { backgroundColor: "#f5e6d8", color: "#a86435", textDecoration: "line-through", cursor: "not-allowed", opacity: 0.7 },
            tooSoon:      { backgroundColor: "#f5e6d8", color: "#a86435", textDecoration: "line-through", cursor: "not-allowed", opacity: 0.7 },
            checkoutOnly: { background: "linear-gradient(135deg, #fff 50%, #f5e6d8 50%)", color: "#a86435", cursor: "pointer" },
          }}
          styles={{ months: { gap: "1rem" } }}
        />
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-forest-900 inline-block" /> Kiválasztva
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-stone-200 inline-block" /> Szabad
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-terra-200 inline-block" /> Foglalt
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ background: "linear-gradient(135deg, #fff 50%, #f5e6d8 50%)", border: "1px solid #e8c9a8" }} /> Csak távozás
          </div>
        </div>
      </div>

      {/* Jobb panel */}
      <div className="flex flex-col gap-4">

        {/* Árösszesítő */}
        <div className="bg-white rounded-3xl shadow-card p-6 flex-1">
          <h3 className="font-medium text-stone-800 mb-4">Árösszesítő</h3>

          {loadingRules ? (
            <div className="flex items-center justify-center py-6 text-stone-400">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-sm">Betöltés...</span>
            </div>
          ) : nights > 0 ? (
            <>
              {/* Per-apartman bontás */}
              <div className="space-y-2 mb-4">
                {aptPrices.map(({ apt, baseTotal, touristTax: aptTax, nightBreakdown }) => {
                  const aptSubtotal = baseTotal + aptTax;
                  const isOpen = openApt === apt.id;
                  return (
                    <div key={apt.id} className="border border-stone-100 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenApt(isOpen ? null : apt.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50 transition-colors"
                      >
                        <span className="font-medium text-stone-700">{apt.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-800 font-semibold">{formatCurrency(aptSubtotal)}</span>
                          {isOpen ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                        </div>
                      </button>
                      {isOpen && (() => {
                        const personCount = apt.adults + apt.children + Math.max(0, apt.babies - 1);
                        const ratePerNight = personCount > 0 && nights > 0 ? Math.round(baseTotal / nights) : 0;
                        return (
                          <div className="px-4 pb-3 space-y-1.5 text-xs border-t border-stone-100 pt-2">
                            <div className="flex justify-between text-stone-600 font-medium">
                              <div>
                                <p>Szállás ({personCount} fő)</p>
                                <p className="text-stone-400 font-normal">{nights} éj × {formatCurrency(ratePerNight)}/éj</p>
                                <p className="text-stone-400 font-normal">
                                  ({apt.adults} felnőtt{apt.children > 0 ? ` + ${apt.children} gyerek` : ""}{apt.babies > 0 ? ` + ${apt.babies} baba` : ""})
                                </p>
                              </div>
                              <span>{formatCurrency(baseTotal)}</span>
                            </div>
                            {apt.babies >= 1 && <div className="flex justify-between text-forest-600"><span>Baba (1 db ingyenes)</span><span>–</span></div>}
                            <div className="flex justify-between text-stone-600"><span>IFA ({apt.adults} felnőtt × {nights} éj)</span><span>{formatCurrency(aptTax)}</span></div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>

              {discountAmount > 0 && discount && (
                <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg mb-3 text-sm">
                  <span className="text-green-700 font-medium">Kedvezmény – {discount.name}</span>
                  <span className="text-green-700 font-medium">−{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-stone-800">Összesen</p>
                  <p className="text-xs text-stone-400">{nights} éjszaka · {totalGuests} vendég</p>
                </div>
                <span className="font-serif text-2xl text-forest-900">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Érkezés</span>
                  <span className="text-stone-700 font-medium">{formatDateHu(checkIn!)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Távozás</span>
                  <span className="text-stone-700 font-medium">{formatDateHu(checkOut!)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Min. foglalás</span>
                  <span className="text-stone-700 font-medium">{minNights} éj</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-stone-400 text-sm mb-1">Válasszon dátumot</p>
              <p className="text-stone-300 text-xs">az ár megtekintéséhez</p>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100"
          >
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="px-6 py-4 rounded-full border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors">
            Vissza
          </button>
          <button onClick={handleNext} className="btn-primary flex-1 justify-center">
            Tovább az adatokhoz <ArrowRight size={16} />
          </button>
        </div>

        {/* Díjszabás segítség */}
        {!loadingRules && rules.length > 0 && (() => {
          const today = new Date();
          const refRule = getGlobalApplicableRule(today, rules);
          if (!refRule) return null;
          const p1 = refRule.pricePerNight;
          const p3 = (refRule as any).price3 > 0 ? (refRule as any).price3 : null;
          const p4 = (refRule as any).price4 > 0 ? (refRule as any).price4 : null;
          return (
            <div className="bg-forest-50 rounded-2xl p-4 space-y-2 text-xs text-forest-800">
              <p className="font-semibold text-forest-900 text-sm">Díjszabás</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>1–2 fő / éj</span>
                  <span className="font-semibold">{formatCurrency(p1)}</span>
                </div>
                {p3 && (
                  <div className="flex justify-between">
                    <span>3 fő / éj</span>
                    <span className="font-semibold">{formatCurrency(p3)}</span>
                  </div>
                )}
                {p4 && (
                  <div className="flex justify-between">
                    <span>4 fő / éj</span>
                    <span className="font-semibold">{formatCurrency(p4)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-forest-200 pt-2 space-y-1 text-forest-700">
                <p>• <strong>Felnőtt (18+):</strong> szobadíj + IFA (450 Ft/éj)</p>
                <p>• <strong>Gyerek (2–17):</strong> szobadíj, IFA nélkül</p>
                <p>• <strong>Baba (0–2):</strong> 1 db ingyenes, többi szobadíj</p>
                <p>• A szobadíj az apartmán teljes éjszakás ára a létszám alapján</p>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
