"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";

export interface FeaturedImage { src: string; alt: string; }

const DEFAULT_FEATURED: FeaturedImage[] = [
  { src: "/images/haz/IMG_8537 kicsi.jpg",  alt: "Kuck\u00F3 k\u00FCls\u0151" },
  { src: "/images/jacuzzi/jacuzzi.jpg",      alt: "Jacuzzi"                   },
  { src: "/images/belso/nappali.jpg",        alt: "Nappali"                   },
  { src: "/images/belso/haloszoba.jpg",      alt: "H\u00E1l\u00F3szoba"       },
  { src: "/images/belso/konyha.jpg",         alt: "Konyha"                    },
  { src: "/images/belso/f\u00FCrd\u0151.jpg", alt: "F\u00FCrd\u0151"          },
];

export default function GallerySection({ featured = DEFAULT_FEATURED }: { featured?: FeaturedImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + featured.length) % featured.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % featured.length : null));

  return (
    <section id="galeria" className="section-py bg-cream">
      <div className="container-custom">

        <AnimatedSection className="text-center mb-14">
          <div className="section-badge">{"Gal\u00E9ria"}</div>
          <h2 className="font-serif text-display-lg font-light text-forest-900">
            {"Tekintsen be az apartmanokba"}
          </h2>
        </AnimatedSection>

        {/* Masonry rács – első kép mindig nagy */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px]">
          {featured.map(({ src, alt }, i) => (
            <motion.div
              key={i}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              onClick={() => setLightbox(i)}
            >
              <Image src={src} alt={alt} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-cream text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-widest uppercase">
                  {"Megn\u00E9zem"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/galeria" className="btn-secondary">
            {"\u00D6sszes k\u00E9p megtekint\u00E9se \u2192"}
          </Link>
        </div>

      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={28} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); prev(); }}>
            <ChevronLeft size={40} />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); next(); }}>
            <ChevronRight size={40} />
          </button>
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src={featured[lightbox].src} alt={featured[lightbox].alt} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightbox + 1} / {featured.length}
          </p>
        </motion.div>
      )}
    </section>
  );
}
