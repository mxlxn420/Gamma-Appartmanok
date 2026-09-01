"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ShoppingBag, Waves, Landmark, IceCream, ExternalLink, Phone, MapPin, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = { Utensils, ShoppingBag, Waves, Landmark, IceCream };

export interface NeighborhoodItem {
  name:    string;
  note?:   string | null;
  address?: string | null;
  url?:    string | null;
  phone?:  string | null;
  desc?:   string | null;
}

export interface NeighborhoodCategory {
  id:    string;
  label: string;
  icon:  string;
  items: NeighborhoodItem[];
}

export default function NeighborhoodTabs({ categories }: { categories: NeighborhoodCategory[] }) {
  const [activeTab, setActiveTab] = useState<string>(categories[0].id);

  const active = categories.find((c) => c.id === activeTab)!;

  return (
    <>
      {/* Tab gombok */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map(({ id, label, icon }) => {
          const Icon = ICON_MAP[icon] ?? Utensils;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? "bg-forest-600 text-white shadow-md"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tartalom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {active.items.map((item, i) => (
            <div
              key={i}
              className="bg-stone-50 rounded-2xl p-4 border border-stone-100 hover:border-forest-200 hover:shadow-card transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm leading-snug">{item.name}</p>
                  {item.note && (
                    <span className="inline-flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full mt-1">
                      <Clock size={10} />
                      {item.note}
                    </span>
                  )}
                  {item.desc && (
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{item.desc}</p>
                  )}
                  {item.address && (
                    <p className="flex items-center gap-1 text-xs text-stone-400 mt-1.5">
                      <MapPin size={10} className="shrink-0" />
                      {item.address}
                    </p>
                  )}
                  {item.phone && (
                    <a
                      href={`tel:${item.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-forest-700 mt-1 transition-colors"
                    >
                      <Phone size={10} className="shrink-0" />
                      {item.phone}
                    </a>
                  )}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-8 h-8 rounded-xl bg-terra-400 flex items-center justify-center hover:bg-terra-500 transition-colors"
                    aria-label={`${item.name} webhely`}
                  >
                    <ExternalLink size={13} className="text-cream" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
