"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface Props {
  apartments: { id: string; name: string }[];
}

const STATUS_OPTIONS = [
  { value: "PENDING",   label: "Előlegre vár" },
  { value: "CONFIRMED", label: "Jóváhagyva"   },
  { value: "PAID",      label: "Fizetve"      },
  { value: "CANCELLED", label: "Elutasítva"   },
  { value: "BLOCKED",   label: "Zárva"        },
];

const SORT_OPTIONS = [
  { value: "checkIn:asc",   label: "Érkezés – legkorábbi elöl" },
  { value: "checkIn:desc",  label: "Érkezés – legkésőbbi elöl" },
  { value: "checkOut:asc",  label: "Távozás – legkorábbi elöl" },
  { value: "checkOut:desc", label: "Távozás – legkésőbbi elöl" },
];

const FILTER_KEYS = ["apt", "status", "inFrom", "inTo", "outFrom", "outTo", "past"] as const;

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-base md:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-forest-400 appearance-none";
const labelCls = "text-xs text-stone-400 mb-1 block";

export default function AdminBookingsFilters({ apartments }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const get = (key: string) => searchParams.get(key) ?? "";

  const update = (changes: Record<string, string | null>) => {
    const qs = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) qs.set(k, v);
      else qs.delete(k);
    }
    qs.delete("page");
    const s = qs.toString();
    startTransition(() => {
      router.push(`/admin/foglalasok${s ? `?${s}` : ""}`, { scroll: false });
    });
  };

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;
  const showPast    = get("past") === "1";
  const sortValue   = `${get("sort") || "checkIn"}:${get("dir") || "asc"}`;

  const clearAll = () => {
    const changes: Record<string, null> = {};
    for (const k of FILTER_KEYS) changes[k] = null;
    update(changes);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-card mb-6 transition-opacity ${isPending ? "opacity-70" : ""}`}>
      {/* Mobil fejléc – összecsukható */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-700"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} />
          Szűrés és rendezés
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-forest-600 text-white text-xs">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`${open ? "block" : "hidden"} md:block px-4 pb-4 md:p-5 border-t border-stone-100 md:border-t-0`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 md:pt-0">
          {/* Apartman */}
          <div>
            <label className={labelCls}>Apartman</label>
            <select value={get("apt")} onChange={(e) => update({ apt: e.target.value || null })} className={inputCls}>
              <option value="">Összes apartman</option>
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Státusz */}
          <div>
            <label className={labelCls}>Státusz</label>
            <select value={get("status")} onChange={(e) => update({ status: e.target.value || null })} className={inputCls}>
              <option value="">Összes státusz</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Érkezés */}
          <div>
            <label className={labelCls}>Érkezés</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" aria-label="Érkezés ettől" value={get("inFrom")} max={get("inTo") || undefined}
                onChange={(e) => update({ inFrom: e.target.value || null })} className={inputCls} />
              <input type="date" aria-label="Érkezés eddig" value={get("inTo")} min={get("inFrom") || undefined}
                onChange={(e) => update({ inTo: e.target.value || null })} className={inputCls} />
            </div>
          </div>

          {/* Távozás */}
          <div>
            <label className={labelCls}>Távozás</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" aria-label="Távozás ettől" value={get("outFrom")} max={get("outTo") || undefined}
                onChange={(e) => update({ outFrom: e.target.value || null })} className={inputCls} />
              <input type="date" aria-label="Távozás eddig" value={get("outTo")} min={get("outFrom") || undefined}
                onChange={(e) => update({ outTo: e.target.value || null })} className={inputCls} />
            </div>
          </div>

          {/* Rendezés – csak mobilon, asztalin a táblázat fejlécén kattintható */}
          <div className="md:hidden">
            <label className={labelCls}>Rendezés</label>
            <select
              value={sortValue}
              onChange={(e) => {
                const [sort, dir] = e.target.value.split(":");
                update({ sort, dir });
              }}
              className={inputCls}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div
            role="checkbox"
            aria-checked={showPast}
            tabIndex={0}
            onClick={() => update({ past: showPast ? null : "1" })}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                update({ past: showPast ? null : "1" });
              }
            }}
            className="flex items-center gap-2 cursor-pointer select-none text-sm text-stone-600"
          >
            <span
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                showPast ? "bg-forest-600 border-forest-600 text-white" : "bg-white border-stone-300"
              }`}
            >
              {showPast && <Check size={13} strokeWidth={3} />}
            </span>
            Korábbi (lezajlott) foglalások is
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium transition-colors"
            >
              <X size={12} />
              Szűrők törlése
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
