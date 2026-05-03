"use client";

import { useState } from "react";
import { motion }   from "framer-motion";
import { Plus, Minus, Users } from "lucide-react";
import type { ApartmentGuests } from "./BookingPage";

interface Props {
  apartments: { id: string; name: string; slug: string; maxGuests: number; coverImage: string | null }[];
  onBack:     () => void;
  onNext:     (guests: ApartmentGuests[]) => void;
}

function Counter({
  label, sublabel, value, min = 0, atMax, onChange,
}: {
  label:     string;
  sublabel?: string;
  value:     number;
  min?:      number;
  atMax:     boolean;
  onChange:  (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <div>
        <p className="text-sm text-stone-700 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={13} />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-stone-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function GuestSelector({ apartments, onBack, onNext }: Props) {
  const [guestData, setGuestData] = useState<ApartmentGuests[]>(
    apartments.map((apt) => ({
      id:           apt.id,
      name:         apt.name,
      slug:         apt.slug,
      maxGuests:    apt.maxGuests,
      coverImage:   apt.coverImage,
      adults:       2,
      teens:        0,
      babies:       0,
      children2to6: 0,
      children6to12: 0,
    }))
  );

  const setField = (aptId: string, field: keyof ApartmentGuests, value: number) => {
    setGuestData((prev) => prev.map((g) => g.id === aptId ? { ...g, [field]: value } : g));
  };

  const totalGuests = (g: ApartmentGuests) =>
    g.adults + g.teens + g.babies + g.children2to6 + g.children6to12;

  const handleNext = () => {
    for (const g of guestData) {
      if (g.adults < 1) { alert(`${g.name}: legalább 1 felnőtt szükséges!`); return; }
      if (totalGuests(g) > g.maxGuests) { alert(`${g.name}: maximum ${g.maxGuests} fő!`); return; }
    }
    onNext(guestData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <p className="text-stone-500 text-sm">Adja meg hány vendég lesz apartmanoként</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {guestData.map((g, i) => {
          const total  = totalGuests(g);
          const atMax  = total >= g.maxGuests;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-stone-200 p-5 space-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center">
                    <Users size={15} className="text-forest-700" />
                  </div>
                  <h3 className="font-medium text-stone-800">{g.name}</h3>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${atMax ? "bg-terra-100 text-terra-600" : "bg-forest-100 text-forest-700"}`}>
                  {total} / {g.maxGuests} fő
                </span>
              </div>

              <Counter
                label="Felnőtt (18+ év)"
                sublabel="Felnőtt ár + IFA"
                value={g.adults}
                min={1}
                atMax={atMax}
                onChange={(v) => setField(g.id, "adults", v)}
              />
              <Counter
                label="Fiatal (12–18 év)"
                sublabel="Felnőtt ár, IFA nélkül"
                value={g.teens}
                atMax={atMax}
                onChange={(v) => setField(g.id, "teens", v)}
              />
              <Counter
                label="Gyerek (6–12 év)"
                value={g.children6to12}
                atMax={atMax}
                onChange={(v) => setField(g.id, "children6to12", v)}
              />
              <Counter
                label="Kisgyerek (2–6 év)"
                value={g.children2to6}
                atMax={atMax}
                onChange={(v) => setField(g.id, "children2to6", v)}
              />
              <Counter
                label="Baba (0–2 év)"
                sublabel="Ingyenes"
                value={g.babies}
                atMax={atMax}
                onChange={(v) => setField(g.id, "babies", v)}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-4 rounded-full border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          Vissza
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary flex-1 justify-center"
        >
          Tovább – Dátum kiválasztása
        </button>
      </div>
    </div>
  );
}
