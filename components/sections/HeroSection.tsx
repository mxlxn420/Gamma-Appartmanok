"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ICON_MAP } from "@/lib/heroIconMap";

interface Highlight {
  icon:  string;
  label: string;
}

interface Slide {
  src:    string;
  alt:    string;
  label?: string;
}

interface HeroData {
  subtitle:      string;
  titleBefore:   string;
  titleEmphasis: string;
  titleAfter:    string;
  description:   string;
  highlights:    Highlight[];
  slides:        Slide[];
}

interface Props {
  data: HeroData;
}

export default function HeroSection({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const slides = data.slides.filter((s) => s.src).length > 0
    ? data.slides.filter((s) => s.src)
    : [{ src: "", alt: "" }];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section id="hero" ref={ref} className="relative h-screen min-h-[640px] overflow-hidden" style={{ touchAction: "pan-y" }}>

      {/* Slideshow */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {slides[current]?.src && (
            <Image
              src={slides[current].src}
              alt={slides[current].alt}
              fill
              priority={current === 0}
              quality={85}
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Slide felirat */}
      {slides[current]?.label?.trim() && (
        <div className="absolute bottom-16 right-4 sm:right-6 z-20 px-5 py-2.5 rounded-xl bg-transparent text-white text-2xl sm:text-4xl font-serif font-light tracking-wide" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>
          {slides[current].label}
        </div>
      )}

      {/* Tartalom */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-start lg:justify-center"
        style={{ y: textY, opacity }}
      >
        <div className="container-custom pt-24 pb-4 lg:pt-20 lg:pb-8">
          {/* text-shadow az egész szövegblokkra öröklődik */}
          <div className="max-w-3xl [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-2.5 mb-6"
            >
              <span className="h-px w-8 bg-white/50" />
              <span className="text-white text-xs font-medium tracking-[0.25em] uppercase">
                {data.subtitle}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="font-serif text-display-xl font-light text-white mb-6"
            >
              {data.titleBefore}
              <em className="italic text-white">{data.titleEmphasis}</em>
              <br />{data.titleAfter}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-white/90 text-base font-light leading-relaxed mb-8 max-w-xl"
            >
              {data.description}
            </motion.p>

            {data.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                {data.highlights.map(({ icon, label }) => {
                  const Icon = ICON_MAP[icon];
                  return (
                    <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
                      {Icon && <Icon size={13} className="text-white" />}
                      {label}
                    </div>
                  );
                })}
              </motion.div>
            )}

          </div>
        </div>

      </motion.div>

      {/* Slideshow pontok + Görgessen – EGYÜTT ALUL */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">

        {/* Pontok */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-500 rounded-full ${i === current
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`${i + 1}. kép`}
            />
          ))}
        </div>

        {/* Görgessen */}
        <div className="flex flex-col items-center gap-1 text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
          <span className="text-[10px] tracking-[0.25em] uppercase">Görgessen</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={18} />
          </motion.div>
        </div>

      </div>

    </section>
  );
}
