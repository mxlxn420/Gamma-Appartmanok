"use client";

import { useEffect, useState } from "react";
import { motion }              from "framer-motion";
import { Check, Home }         from "lucide-react";

interface Apartment {
  id:          string;
  name:        string;
  slug:        string;
  maxGuests:   number;
  description: string | null;
}

interface Props {
  onNext: (selected: Apartment[]) => void;
}

export default function ApartmentSelector({ onNext }: Props) {
  const [apartments, setApartments]   = useState<Apartment[]>([]);
  const [selected, setSelected]       = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/apartments")
      .then((r) => r.json())
      .then((data) => { setApartments(data); setLoading(false); });
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    const selectedApartments = apartments.filter((a) => selected.includes(a.id));
    onNext(selectedApartments);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-forest-900/20 border-t-forest-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-stone-500 text-sm">Válassza ki melyik apartmant szeretné foglalni</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {apartments.map((apt, i) => {
          const isSelected = selected.includes(apt.id);
          return (
            <motion.button
              key={apt.id}
              type="button"
              onClick={() => toggle(apt.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-forest-700 bg-forest-50 shadow-card"
                  : "border-stone-200 bg-white hover:border-forest-300 hover:shadow-card"
              }`}
            >
              {/* Pipa */}
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSelected ? "bg-forest-900" : "bg-stone-100"
              }`}>
                {isSelected && <Check size={13} className="text-white" strokeWidth={3} />}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-forest-900" : "bg-stone-100"
                }`}>
                  <Home size={18} className={isSelected ? "text-white" : "text-stone-500"} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-light text-forest-900">{apt.name}</h3>
                  <p className="text-xs text-stone-400">Max. {apt.maxGuests} fő</p>
                </div>
              </div>

              {apt.description && (
                <p className="text-sm text-stone-500 leading-relaxed">{apt.description}</p>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={selected.length === 0}
          className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Tovább – Dátum kiválasztása
          {selected.length > 0 && (
            <span className="ml-1 text-cream/70">
              ({selected.length} apartman)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
