"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DayPicker, DateRange } from "react-day-picker";
import { differenceInCalendarDays, getDay, startOfDay, addDays, format } from "date-fns";
import { hu } from "date-fns/locale";
import {
  Users, Baby, ArrowRight, AlertCircle,
  ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { formatDateHu, formatCurrency } from "@/lib/utils";
import { useBookingStore } from "@/store/bookingStore";
import type { BookingData } from "./BookingPage";
import "react-day-picker/dist/style.css";

interface PricingRule {
  id: string;
  name: string;
  pricePerNight: number;
  weekendPrice: number;
  childPrice2to6: number;
  childPrice6to12: number;
  dateFrom: string | null;
  dateTo: string | null;
  minNights: number;
  minAdvanceDays: number;
  isActive: boolean;
  priority: number;
}

interface BookedRange {
  from: Date;
  to: Date;
}

function getApplicableRule(checkIn: Date, rules: PricingRule[]): PricingRule | null {
  if (!rules.length) return null;
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);
  const ciStr = format(checkIn, "yyyy-MM-dd");
  for (const rule of sorted) {
    if (rule.dateFrom && rule.dateTo) {
      const fromStr = format(new Date(rule.dateFrom), "yyyy-MM-dd");
      const toStr   = format(new Date(rule.dateTo),   "yyyy-MM-dd");
      if (ciStr >= fromStr && ciStr <= toStr) return rule;
    }
  }
  return sorted.find((r) => !r.dateFrom && !r.dateTo) ?? null;
}

function getEffectiveMinNights(checkIn: Date, checkOut: Date, rules: PricingRule[]): number {
  let max = 1;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const rule = getApplicableRule(cur, rules);
    if (rule && rule.minNights > max) max = rule.minNights;
    cur.setDate(cur.getDate() + 1);
  }
  return max;
}

function getPriceForNight(date: Date, rule: PricingRule, personCount: number): number {
  const isWeekend = [5, 6].includes(getDay(date));

  let tier1to2: number, tier3: number, tier4: number;
  if (isWeekend) {
    const wkday3 = (rule as any).price3 > 0 ? (rule as any).price3 : rule.pricePerNight;
    const wkday4 = (rule as any).price4 > 0 ? (rule as any).price4 : wkday3;
    tier1to2 = rule.weekendPrice > 0 ? rule.weekendPrice : rule.pricePerNight;
    tier3 = (rule as any).weekendPrice3 > 0 ? (rule as any).weekendPrice3 : wkday3;
    tier4 = (rule as any).weekendPrice4 > 0 ? (rule as any).weekendPrice4 : wkday4;
  } else {
    tier1to2 = rule.pricePerNight;
    tier3 = (rule as any).price3 > 0 ? (rule as any).price3 : tier1to2;
    tier4 = (rule as any).price4 > 0 ? (rule as any).price4 : tier3;
  }

  if (personCount >= 4) return tier4;
  if (personCount >= 3) return tier3;
  return tier1to2;
}

function calcBaseTotal(checkIn: Date, checkOut: Date, rules: PricingRule[], personCount: number): number {
  let nightlyTotal = 0;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const rule = getApplicableRule(cur, rules);
    if (rule) nightlyTotal += getPriceForNight(cur, rule, personCount);
    cur.setDate(cur.getDate() + 1);
  }
  return nightlyTotal;
}

function getNightBreakdown(checkIn: Date, checkOut: Date, rules: PricingRule[], personCount: number): { count: number; rate: number }[] {
  const groups: { count: number; rate: number }[] = [];
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const rule = getApplicableRule(cur, rules);
    const rate = rule ? getPriceForNight(cur, rule, personCount) : 0;
    if (groups.length > 0 && groups[groups.length - 1].rate === rate) {
      groups[groups.length - 1].count++;
    } else {
      groups.push({ count: 1, rate });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return groups;
}

function isRangeOverlapping(from: Date, to: Date, bookedRanges: BookedRange[]): boolean {
  const f = startOfDay(from);
  const t = startOfDay(to);
  return bookedRanges.some((r) => f < startOfDay(r.to) && t > startOfDay(r.from));
}

function GuestCounter({
  label, sublabel, value, min = 0, atMax = false, onChange,
}: {
  label: string; sublabel: string; value: number;
  min?: number; atMax?: boolean; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg leading-none"
        >−</button>
        <span className="w-6 text-center font-medium text-stone-800 text-sm">{value}</span>
        <button type="button"
          onClick={() => { if (!atMax) onChange(value + 1); }}
          disabled={atMax}
          className="w-8 h-8 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg leading-none"
        >+</button>
      </div>
    </div>
  );
}

interface SelectedApartment {
  id:        string;
  name:      string;
  slug:      string;
  maxGuests: number;
}

interface Props {
  selectedApartments: SelectedApartment[];
  onBack: () => void;
  onNext: (data: Omit<BookingData, "apartments">) => void;
}

export default function BookingCalendar({ selectedApartments, onBack, onNext }: Props) {
  const store = useBookingStore();

  const storeCheckIn = store.checkIn ? new Date(store.checkIn) : null;
  const storeCheckOut = store.checkOut ? new Date(store.checkOut) : null;

  const [range, setRange] = useState<DateRange | undefined>(
    storeCheckIn && storeCheckOut && !isNaN(storeCheckIn.getTime())
      ? { from: storeCheckIn, to: storeCheckOut }
      : undefined
  );
  const storeTotal = (store.adults ?? 0) + (store.teens ?? 0) + (store.babies ?? 0) + (store.children2to6 ?? 0) + (store.children6to12 ?? 0);
  const validStore = storeTotal <= 4;

  const [adults, setAdults] = useState(validStore && store.adults > 0 ? store.adults : 2);
  const [teens, setTeens] = useState(validStore ? (store.teens ?? 0) : 0);
  const [babies, setBabies] = useState(validStore ? (store.babies ?? 0) : 0);
  const [children2to6, setChildren2to6] = useState(validStore ? (store.children2to6 ?? 0) : 0);
  const [children6to12, setChildren6to12] = useState(validStore ? (store.children6to12 ?? 0) : 0);
  const [error, setError] = useState<string | null>(null);
  const [showChildren, setShowChildren] = useState(
    (store.teens + store.babies + store.children2to6 + store.children6to12) > 0
  );
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [discount, setDiscount] = useState<{ name: string; discountPercent: number } | null>(null);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await fetch("/api/pricing");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setRules(data.data);
        }
      } catch (err) {
        console.error("Pricing betöltési hiba:", err);
      } finally {
        setLoadingRules(false);
      }
    };
    loadPricing();
  }, []);

  useEffect(() => {
    if (!range?.from || !range?.to) { setDiscount(null); return; }
    const ci = format(range.from, "yyyy-MM-dd");
    const co = format(range.to, "yyyy-MM-dd");
    fetch(`/api/discounts?checkIn=${ci}&checkOut=${co}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setDiscount(d.data); })
      .catch(() => { });
  }, [range]);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const ranges = [
            ...data.data.bookings,
            ...data.data.blocked,
          ].map((b: any) => ({
            from: new Date(b.checkIn),
            to: new Date(b.checkOut),
          }));
          setBookedRanges(ranges);
        }
      })
      .catch(console.error);
  }, []);

  const checkIn = range?.from ?? null;
  const checkOut = range?.to ?? null;
  const nights = checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  const weekendNights = checkIn && checkOut ? (() => {
    let count = 0;
    const cur = new Date(checkIn);
    while (cur < checkOut) { if ([5, 6].includes(getDay(cur))) count++; cur.setDate(cur.getDate() + 1); }
    return count;
  })() : 0;
  const weekdayNights = nights - weekendNights;

  const MAX_GUESTS = 4;
  const totalGuests = adults + teens + babies + children2to6 + children6to12;
  const paidGuests = adults + teens + babies + children2to6 + children6to12;
  const hasChildren = teens + babies + children2to6 + children6to12 > 0;
  const currentRule = checkIn ? getApplicableRule(checkIn, rules) : null;
  const minNights = checkIn && checkOut
    ? getEffectiveMinNights(checkIn, checkOut, rules)
    : (currentRule?.minNights ?? 2);

  const personCount = adults + teens;
  const effectiveWeekdayRate = currentRule ? (() => {
    const t2 = currentRule.pricePerNight;
    const t3 = (currentRule as any).price3 > 0 ? (currentRule as any).price3 : t2;
    const t4 = (currentRule as any).price4 > 0 ? (currentRule as any).price4 : t3;
    return personCount >= 4 ? t4 : personCount >= 3 ? t3 : t2;
  })() : 0;
  const effectiveWeekendRate = currentRule ? (() => {
    const wkday3 = (currentRule as any).price3 > 0 ? (currentRule as any).price3 : currentRule.pricePerNight;
    const wkday4 = (currentRule as any).price4 > 0 ? (currentRule as any).price4 : wkday3;
    const t2 = (currentRule as any).weekendPrice > 0 ? (currentRule as any).weekendPrice : currentRule.pricePerNight;
    const t3 = (currentRule as any).weekendPrice3 > 0 ? (currentRule as any).weekendPrice3 : wkday3;
    const t4 = (currentRule as any).weekendPrice4 > 0 ? (currentRule as any).weekendPrice4 : wkday4;
    return personCount >= 4 ? t4 : personCount >= 3 ? t3 : t2;
  })() : 0;

  const baseTotal = checkIn && checkOut && nights > 0
    ? calcBaseTotal(checkIn, checkOut, rules, personCount)
    : 0;
  const nightBreakdown = checkIn && checkOut && nights > 0
    ? getNightBreakdown(checkIn, checkOut, rules, personCount)
    : [];
  const child2to6Price = currentRule?.childPrice2to6 ?? 0;
  const child6to12Price = currentRule?.childPrice6to12 ?? 0;
  const childTotal2to6 = child2to6Price * children2to6 * nights;
  const childTotal6to12 = child6to12Price * children6to12 * nights;
  const touristTax = 450 * adults * nights;
  const accommodationTotal = baseTotal + childTotal2to6 + childTotal6to12;
  const discountAmount = discount ? Math.round(accommodationTotal * discount.discountPercent / 100) : 0;
  const total = accommodationTotal + touristTax - discountAmount;

  const handleSelect = (r: DateRange | undefined) => {
    setError(null);
    if (r?.from && r?.to) {
      if (isRangeOverlapping(r.from, r.to, bookedRanges)) {
        setError("Ez az időszak már foglalt! Kérjük válasszon másik dátumot.");
        setRange(undefined);
        return;
      }
    }
    setRange(r);
  };

  const handleNext = () => {
    setError(null);
    if (!checkIn || !checkOut) {
      setError("Kérjük válasszon érkezési és távozási dátumot!");
      return;
    }
    if (nights < minNights) {
      setError("Ebben az időszakban minimum " + minNights + " éjszakára lehet foglalni!");
      return;
    }
    if (adults < 1) {
      setError("Legalább 1 felnőtt (18+) szükséges!");
      return;
    }
    if (paidGuests > MAX_GUESTS) {
      setError(`Maximum ${MAX_GUESTS} fő foglalható!`);
      return;
    }
    if (isRangeOverlapping(checkIn, checkOut, bookedRanges)) {
      setError("Ez az időszak már foglalt! Kérjük válasszon másik dátumot.");
      return;
    }
    onNext({
      checkIn,
      checkOut,
      guests: totalGuests,
      adults,
      teens,
      babies,
      children2to6,
      children6to12,
      nights,
      weekdayNights,
      weekendNights,
      weekdayRate: effectiveWeekdayRate,
      weekendRate: effectiveWeekendRate,
      totalPrice: total,
      basePrice: baseTotal,
      childPrice2to6: child2to6Price,
      childPrice6to12: child6to12Price,
      guestSurcharge: 0,
      touristTax,
      discountPercent: discount?.discountPercent ?? 0,
      discountAmount,
      discountName: discount?.name ?? "",
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
            const latest = startOfDay(addDays(new Date(), 365));
            const advance = getApplicableRule(d, rules)?.minAdvanceDays ?? 2;
            const earliest = startOfDay(addDays(new Date(), advance));
            if (d < earliest || d > latest) return true;
            return bookedRanges.some((r) => d > startOfDay(r.from) && d < startOfDay(r.to));
          }}
          modifiers={{
            booked: (day) =>
              bookedRanges.some((r) => {
                const d = startOfDay(day);
                return d > startOfDay(r.from) && d < startOfDay(r.to);
              }),
            tooSoon: (day) => {
              const d = startOfDay(day);
              const advance = getApplicableRule(d, rules)?.minAdvanceDays ?? 2;
              const earliest = startOfDay(addDays(new Date(), advance));
              return d >= startOfDay(new Date()) && d < earliest;
            },
          }}
          modifiersStyles={{
            booked: {
              backgroundColor: "#f5e6d8",
              color: "#a86435",
              textDecoration: "line-through",
              cursor: "not-allowed",
              opacity: 0.7,
            },
            tooSoon: {
              backgroundColor: "#f5e6d8",
              color: "#a86435",
              textDecoration: "line-through",
              cursor: "not-allowed",
              opacity: 0.7,
            },
          }}
          styles={{ months: { gap: "1rem" } }}
        />
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-forest-900 inline-block" />
            Kiválasztva
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-stone-200 inline-block" />
            Szabad
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-terra-200 inline-block" />
            Foglalt
          </div>
        </div>
      </div>

      {/* Jobb panel */}
      <div className="flex flex-col gap-4">

        {/* Vendégek */}
        <div className="bg-white rounded-3xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-forest-700" />
            <h3 className="font-medium text-stone-800">Vendégek</h3>
          </div>

          <GuestCounter
            label="Felnőtt (18+ év)"
            sublabel="Felnőtt ár + IFA (450 Ft/éj)"
            value={adults}
            min={1}
            atMax={totalGuests >= MAX_GUESTS}
            onChange={setAdults}
          />

          <button
            type="button"
            onClick={() => setShowChildren((v) => !v)}
            className="w-full flex items-center justify-between py-3 text-sm text-forest-700 hover:text-forest-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Baby size={15} />
              <span>Fiatal / Gyerek hozzáadása</span>
              {hasChildren && (
                <span className="bg-forest-100 text-forest-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {teens + babies + children2to6 + children6to12} fő
                </span>
              )}
            </div>
            {showChildren ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-stone-100 pt-2 overflow-hidden"
            >
              <div className="bg-forest-50 rounded-xl p-3 mb-3 text-xs text-forest-700 space-y-0.5">
                <p className="font-semibold mb-1.5">Díjszabás:</p>
                <p>• 0–2 éves: <strong>ingyenes</strong></p>
                <p>• 2–6 éves: <strong>{child2to6Price > 0 ? formatCurrency(child2to6Price) : "–"}/éj</strong></p>
                <p>• 6–12 éves: <strong>{child6to12Price > 0 ? formatCurrency(child6to12Price) : "–"}/éj</strong></p>
                <p>• 12–18 éves: <strong>felnőtt ár, IFA nélkül</strong></p>
                <p>• IFA: <strong>450 Ft/felnőtt/éj</strong></p>
              </div>

              <GuestCounter
                label="Baba (0–2 év)"
                sublabel="Ingyenes – csak jelzés"
                value={babies}
                atMax={totalGuests >= MAX_GUESTS}
                onChange={setBabies}
              />
              <GuestCounter
                label="Kisgyerek (2–6 év)"
                sublabel={child2to6Price > 0 ? formatCurrency(child2to6Price) + "/éj" : "Ár nincs megadva"}
                value={children2to6}
                atMax={totalGuests >= MAX_GUESTS}
                onChange={setChildren2to6}
              />
              <GuestCounter
                label="Gyerek (6–12 év)"
                sublabel={child6to12Price > 0 ? formatCurrency(child6to12Price) + "/éj" : "Ár nincs megadva"}
                value={children6to12}
                atMax={totalGuests >= MAX_GUESTS}
                onChange={setChildren6to12}
              />
              <GuestCounter
                label="Fiatal (12–18 év)"
                sublabel="Felnőtt ár – IFA nélkül"
                value={teens}
                atMax={totalGuests >= MAX_GUESTS}
                onChange={setTeens}
              />
            </motion.div>
          )}

          <div className="mt-3 pt-3 border-t border-stone-100 space-y-1">
            <div className="flex justify-between text-xs text-stone-500">
              <span>Felnőtt (18+)</span>
              <span className="font-medium text-stone-700">{adults} fő</span>
            </div>
            {teens > 0 && (
              <div className="flex justify-between text-xs text-stone-500">
                <span>Fiatal (12–18)</span>
                <span className="font-medium text-stone-700">{teens} fő</span>
              </div>
            )}
            {babies > 0 && (
              <div className="flex justify-between text-xs text-stone-500">
                <span>Baba (0–2)</span>
                <span className="font-medium text-forest-600">{babies} fő – ingyenes</span>
              </div>
            )}
            {children2to6 > 0 && (
              <div className="flex justify-between text-xs text-stone-500">
                <span>Kisgyerek (2–6)</span>
                <span className="font-medium text-stone-700">{children2to6} fő</span>
              </div>
            )}
            {children6to12 > 0 && (
              <div className="flex justify-between text-xs text-stone-500">
                <span>Gyerek (6–12)</span>
                <span className="font-medium text-stone-700">{children6to12} fő</span>
              </div>
            )}
            <div className={`flex justify-between text-xs font-semibold pt-1.5 border-t border-stone-100 mt-1 ${totalGuests > MAX_GUESTS ? "text-red-600" : "text-stone-700"}`}>
              <span>Összesen</span>
              <span>{totalGuests} / {MAX_GUESTS} fő</span>
            </div>
            {totalGuests > MAX_GUESTS && (
              <p className="text-xs text-red-500 mt-1">Maximum {MAX_GUESTS} fő foglalható!</p>
            )}
          </div>
        </div>

        {/* Árösszesítő */}
        <div className="bg-white rounded-3xl shadow-card p-6 flex-1">
          <h3 className="font-medium text-stone-800 mb-4">Árösszesítő</h3>

          {loadingRules ? (
            <div className="flex items-center justify-center py-6 text-stone-400">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-sm">Betöltés...</span>
            </div>
          ) : nights > 0 && currentRule ? (
            <>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-stone-700 font-medium">Szállás</p>
                    {nightBreakdown.map((g, i) => (
                      <p key={i} className="text-xs text-stone-400 mt-0.5">
                        {g.count} éj × {formatCurrency(g.rate)}/éj
                      </p>
                    ))}
                  </div>
                  <span className="text-stone-800 font-medium">{formatCurrency(baseTotal)}</span>
                </div>

                {childTotal2to6 > 0 && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-stone-700 font-medium">Kisgyerek (2–6 év)</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {children2to6} fő × {formatCurrency(child2to6Price)}/éj × {nights} éj
                      </p>
                    </div>
                    <span className="text-stone-800 font-medium">{formatCurrency(childTotal2to6)}</span>
                  </div>
                )}

                {childTotal6to12 > 0 && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-stone-700 font-medium">Gyerek (6–12 év)</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {children6to12} fő × {formatCurrency(child6to12Price)}/éj × {nights} éj
                      </p>
                    </div>
                    <span className="text-stone-800 font-medium">{formatCurrency(childTotal6to12)}</span>
                  </div>
                )}

                {babies > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-stone-700 font-medium">Baba ({babies} fő)</p>
                    <span className="text-forest-600 font-medium">Ingyenes</span>
                  </div>
                )}

                {touristTax > 0 && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-stone-700 font-medium">IFA</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {adults} felnőtt × 450 Ft × {nights} éj
                      </p>
                    </div>
                    <span className="text-stone-800 font-medium">{formatCurrency(touristTax)}</span>
                  </div>
                )}

                {discountAmount > 0 && discount && (
                  <div className="flex justify-between items-start bg-green-50 -mx-1 px-1 py-1.5 rounded-lg">
                    <div>
                      <p className="text-green-700 font-medium">Kedvezmény – {discount.name}</p>
                    </div>
                    <span className="text-green-700 font-medium shrink-0 ml-2">−{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-stone-800">Összesen</p>
                  <p className="text-xs text-stone-400">{nights} éjszaka</p>
                </div>
                <span className="font-serif text-2xl text-forest-900">{formatCurrency(total)}</span>
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100"
          >
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-4 rounded-full border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Vissza
          </button>
          <button
            onClick={handleNext}
            disabled={totalGuests > MAX_GUESTS}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tovább az adatokhoz <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}