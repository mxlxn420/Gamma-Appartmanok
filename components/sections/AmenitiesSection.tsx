"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
  Waves, Home, TreePine, Flame, Coffee, Utensils, UtensilsCrossed, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike, MapPin, Users, Tv, Wine, Baby, Shirt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Waves, Home, TreePine, Flame, Coffee, Utensils, UtensilsCrossed, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike, MapPin, Users, Tv, Wine, Baby, Shirt,
};

interface Item { icon: string; label: string; desc: string; }

interface AmenitiesData {
  subtitle:    string;
  heading:     string;
  description: string;
  items:       Item[];
}

export default function AmenitiesSection({ data }: { data: AmenitiesData }) {
  return (
    <section id="felszereltseg" className="section-py bg-[#f5f0e8] overflow-hidden">
      <div className="container-custom">

        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-terra-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">
            <span className="h-px w-8 bg-terra-400/60" />
            {data.subtitle}
            <span className="h-px w-8 bg-terra-400/60" />
          </div>
          <h2 className="font-serif text-display-lg font-light text-forest-900 mb-4">
            {data.heading}
          </h2>
          <p className="text-forest-700 max-w-xl mx-auto leading-relaxed">
            {data.description}
          </p>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4">
          {data.items.map(({ icon, label, desc }, i) => {
            const Icon = ICON_MAP[icon] ?? Star;
            return (
              <motion.div
                key={label + i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] bg-white border border-forest-200 rounded-2xl p-5 hover:bg-forest-50 hover:border-forest-300 transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-terra-400/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-terra-400" />
                </div>
                <p className="text-forest-900 font-medium text-sm mb-1">{label}</p>
                <p className="text-forest-600 text-xs">{desc}</p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
