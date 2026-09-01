"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map(({ q, a }, i) => (
        <AnimatedSection key={i} delay={i * 0.06}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <button
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-medium text-stone-800 text-sm leading-relaxed">{q}</span>
              <span className="shrink-0 w-7 h-7 rounded-full bg-forest-900/8 flex items-center justify-center">
                {open === i ? <Minus size={14} className="text-forest-700" /> : <Plus size={14} className="text-forest-700" />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="px-6 pb-5 text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-4">
                    {a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
