"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useState } from "react";
import {
  MapPin, Users, Waves, Home, TreePine, Flame, Coffee, Utensils, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike, ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  MapPin, Users, Waves, Home, TreePine, Flame, Coffee, Utensils, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike,
};

interface ImageField { src: string; alt: string; }
interface Value      { icon: string; title: string; text: string; }

interface AboutData {
  heading1:     string;
  heading2:     string;
  description1: string;
  description2: string;
  mainImage:    ImageField;
  floatImage:   ImageField;
  values:       Value[];
  nearby:       string[];
}

export default function AboutSection({ data }: { data: AboutData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="rolunk" className="section-py bg-cream overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Képek */}
          <AnimatedSection direction="left" className="relative lg:sticky lg:top-24">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-luxury bg-forest-100">
              {data.mainImage.src && (
                <Image
                  src={data.mainImage.src}
                  alt={data.mainImage.alt}
                  fill sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            {/* Lebegő kép */}
            {data.floatImage.src && (
              <motion.div
                className="absolute -bottom-8 -right-4 w-44 h-52 rounded-2xl overflow-hidden shadow-luxury border-4 border-cream"
                initial={{ opacity: 0, scale: 0.8, rotate: 3 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Image
                  src={data.floatImage.src}
                  alt={data.floatImage.alt}
                  fill sizes="176px"
                  className="object-cover"
                />
              </motion.div>
            )}
            {/* Értékelés badge */}
            <motion.div
              className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-card px-5 py-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-terra-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs font-medium text-stone-700"><strong>5.0 / 5.0</strong> – Kiváló</p>
              <p className="text-[10px] text-stone-400">Google értékelés</p>
            </motion.div>
          </AnimatedSection>

          {/* Szöveg */}
          <AnimatedSection direction="right" delay={0.15} className="lg:pl-4">
            <div className="section-badge">Rólunk</div>
            <h2 className="font-serif text-display-lg font-light text-forest-900 mb-6">
              {data.heading1}<br />
              <em className="italic">{data.heading2}</em>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">{data.description1}</p>
            <motion.div
              initial={false}
              animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <p className="text-stone-600 leading-relaxed mb-4">{data.description2}</p>
            </motion.div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:text-forest-900 transition-colors mb-8"
            >
              {expanded ? "Kevesebb" : "Bővebben"}
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown size={15} />
              </motion.span>
            </button>

            {/* Értékek */}
            <div className="space-y-5 mb-10">
              {data.values.map(({ icon, title, text }, i) => {
                const Icon = ICON_MAP[icon] ?? Star;
                return (
                  <motion.div
                    key={title + i}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-forest-900/8 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-forest-700" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800 mb-0.5">{title}</p>
                      <p className="text-sm text-stone-500 leading-relaxed">{text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Közeli látnivalók – csak mobilon itt */}
            {data.nearby.length > 0 && (
              <div className="lg:hidden bg-forest-900/5 rounded-2xl p-5">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-forest-700 mb-3">
                  Közeli látnivalók
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {data.nearby.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-terra-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AnimatedSection>

        </div>

        {/* Közeli látnivalók – desktopon középre */}
        {data.nearby.length > 0 && (
          <AnimatedSection className="hidden lg:block mt-16">
            <div className="bg-forest-900/5 rounded-2xl p-6 max-w-2xl mx-auto text-center">
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-forest-700 mb-4">
                Közeli látnivalók
              </p>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                {data.nearby.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-terra-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

      </div>
    </section>
  );
}
