"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage    { src: string; alt: string; }
export interface GalleryCategory { id: string; label: string; desc: string; images: GalleryImage[]; }

export const DEFAULT_CATEGORIES: GalleryCategory[] = [
    {
        id: "haz",
        label: "Ház & Exterior",
        desc: "A vendégház kívülről",
        images: [
            { src: "/images/haz/Gamma Apartmanok és Jakuzzi kis.jpg", alt: "Gamma Apartmanok" },
            { src: "/images/haz/hero1.jpg", alt: "Gamma Apartmanok kívülről" },
            { src: "/images/haz/hero2.jpg", alt: "Vendégház oldalnézet" },
            { src: "/images/haz/IMG_8347 kicsi.jpg", alt: "Vendégház a kertből" },
            { src: "/images/haz/IMG_8519 kicsi.jpg", alt: "Vendégház a kert lenti részéből" },
            { src: "/images/haz/IMG_8528 kicsi.jpg", alt: "Vendégház a kert lenti részéből" },
            { src: "/images/haz/IMG_8532 kicsi.jpg", alt: "Vendégház a kert lenti részéből" },
            { src: "/images/haz/IMG_8533 kicsi.jpg", alt: "Vendégház a kert lenti részéből" },
            { src: "/images/haz/IMG_8537 kicsi.jpg", alt: "Vendégház a kert lenti részéből" },
            { src: "/images/haz/bejárat2.jpg", alt: "Bejárat" },
            { src: "/images/haz/Gamma Apartmanok.jpg", alt: "Milán kuckó a kaputól" },
        ],
    },
    {
        id: "kert",
        label: "Kert & Terasz",
        desc: "Hatalmas privát kert grillel és bográccsal",
        images: [
            { src: "/images/kert/kert.jpg", alt: "Privát kert" },
            { src: "/images/kert/kerti asztal.jpg", alt: "Kerti asztal" },
            { src: "/images/kert/grill.jpg", alt: "Grill" },
            { src: "/images/kert/grill2.jpg", alt: "Grill nyitva" },
            { src: "/images/kert/bogrács.jpg", alt: "Bogrács" },
            { src: "/images/kert/bográcsozó kertben.jpg", alt: "Bogrács balról" },
            { src: "/images/kert/IMG_8543 kicsi.jpg", alt: "Bogrács fentről" },
            { src: "/images/kert/Gamma Apartmanok naplemente.jpg", alt: "Bogrács naplementében" },
            { src: "/images/kert/erkely.jpg", alt: "Erkély" },
            { src: "/images/kert/IMG_8515 kicsi.jpg", alt: "Almafa" },
            { src: "/images/kert/Gamma Apartmanok kert kicsi.jpg", alt: "Kert lenti része" },
            { src: "/images/kert/sziklakert.jpg", alt: "Sziklakert" },
            { src: "/images/kert/IMG_8336 kicsi.jpg", alt: "" },
        ],
    },
    {
        id: "jacuzzi",
        label: "Jacuzzi",
        desc: "Privát jacuzzi korlátlan használattal",
        images: [
            { src: "/images/jacuzzi/jacuzzi.jpg", alt: "Jacuzzi este" },
            { src: "/images/jacuzzi/jakuzzi2.jpg", alt: "Jacuzzi" },
            { src: "/images/jacuzzi/jacuzzikivilag.jpg", alt: "Jacuzzi kivilágítva" },
            { src: "/images/jacuzzi/IMG_8385 kicsi.jpg", alt: "Jacuzzi télen" },
            { src: "/images/jacuzzi/IMG_8389 kicsi.jpg", alt: "Jacuzzi télen kivilágítva" },
            { src: "/images/jacuzzi/IMG_8393 kicsi.jpg", alt: "Jacuzzi télen kívülről" },
            { src: "/images/jacuzzi/IMG_8392 kicsi.jpg", alt: "Jacuzzi télen kivilágítva kívülről" },

        ],
    },
    {
        id: "belso",
        label: "Belső terek",
        desc: "Hangulatos, gondosan berendezett szobák",
        images: [
            { src: "/images/belso/haloszoba.jpg", alt: "Hálószoba" },
            { src: "/images/belso/hálószoba ágy.jpg", alt: "Hálószoba ágy" },
            { src: "/images/belso/nappali.jpg", alt: "Nappali kandalló" },
            { src: "/images/belso/konyha.jpg", alt: "Konyha" },
            { src: "/images/belso/fürdő.jpg", alt: "Fürdőszoba" },
            { src: "/images/belso/étkezős nappali.jpg", alt: "Étkezős nappali" },
            { src: "/images/belso/amerikai konyhás nappali.jpg", alt: "" },
            { src: "/images/belso/étkezős nappali2.jpg", alt: "" },
            { src: "/images/belso/étkezővel konyha.jpg", alt: "" },
            { src: "/images/belso/folyosó2.jpg", alt: "" },
            { src: "/images/belso/hálószoba ágy2.jpg", alt: "" },
            { src: "/images/belso/hálószoba átjáróval.jpg", alt: "" },
            { src: "/images/belso/hálószoba2.jpg", alt: "" },
            { src: "/images/belso/hálószoba3.jpg", alt: "" },
            { src: "/images/belso/IMG_8308 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8314 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8316 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8317 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8324 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8327 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8328 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8335 kicsi.jpg", alt: "" },
            { src: "/images/belso/IMG_8629 kicsi.jpg", alt: "" },
            { src: "/images/belso/külön wc.jpg", alt: "" },
            { src: "/images/belso/Milán kuckó étkező1.jpg", alt: "" },
            { src: "/images/belso/Milán kuckó fürdő kicsi.jpg", alt: "" },
            { src: "/images/belso/Milán kuckó háló.jpg", alt: "" },
            { src: "/images/belso/Milán kuckó háló3 kicsi.jpg", alt: "" },
            { src: "/images/belso/Milán kuckó konyha.jpg", alt: "" },
            { src: "/images/belso/Milán kuckó konyha-étkező.jpg", alt: "" },
            { src: "/images/belso/nappalikandalloval.jpg", alt: "" },
            { src: "/images/belso/Gamma Apartmanok kávé-tea kicsi.jpg", alt: "" },
        ],
    },
    {
        id: "kilatas",
        label: "Kilátás",
        desc: "Kilátás a kuckóból",
        images: [
            { src: "/images/kilatas/kilátás Bükkre.jpg", alt: "Kilátás a Bükkre" },
            { src: "/images/kilatas/erkélyről kilátás.jpg", alt: "Erkélyről kilátás" },
            { src: "/images/kilatas/IMG_8550 kicsi.jpg", alt: "Kilátás az ablakból" },
            { src: "/images/kilatas/IMG_8640 kicsi.jpg", alt: "Reggeli kávé az erkélyen" },
            { src: "/images/kilatas/kilátás Bükkre2.jpg", alt: "Kilátás a Bükkre" },
            { src: "/images/kilatas/kilátás Bükkre3.jpg", alt: "Kilátás a Bükkre" },
        ],
    },
    {
        id: "kornyek",
        label: "Környék",
        desc: "Miskolctapolca és a Bükk gyönyörű tájai",
        images: [
            { src: "/images/kornyek/csonakazas-es-vizibiciklizes-miskolctapolcan.jpg", alt: "Csónakázó tó fentről" },
            { src: "/images/kornyek/Miskolctapolcai csónakázó tó.jpg", alt: "Csónakázó tó" },
            { src: "/images/kornyek/csonakazas-es-vizibiciklizes-miskolctapolcan__1653396581221.jpg", alt: "Csónakázó tó a barlangfürdővel" },
            { src: "/images/kornyek/csonakazas-es-vizibiciklizes-miskolctapolcan__16533966190025.jpg", alt: "Bobpálya" },
            { src: "/images/kornyek/csónakázó tó adventi világítással 4.jpg", alt: "Csónakázó tó adventi világítással" },
            { src: "/images/kornyek/csónakázó tó adventi világítással.jpg", alt: "Csónakázó tó adventi világítással" },
            { src: "/images/kornyek/csónakázótó 6.jpeg", alt: "Csónakázó tó" },
            { src: "/images/kornyek/csónakázótó 11.jpeg", alt: "Csónakázó tó" },
            { src: "/images/kornyek/csónakázótó 19.jpeg", alt: "Csónakázó tó" },
            { src: "/images/kornyek/sétány 2.jpeg", alt: "Miskolctapolcai sétány" },
            { src: "/images/kornyek/Hámori tó.jpg", alt: "Hámori tó" },
            { src: "/images/kornyek/Zsófia kilátó.jpg", alt: "Zsófia kilátó" },
            { src: "/images/kornyek/Palotaszálló.jpg", alt: "Lillafüredi Palotaszálló" },
        ],
    },
];

export default function GaleriaPage({ categories = DEFAULT_CATEGORIES }: { categories?: GalleryCategory[] }) {
    const ALL_IMAGES = categories.flatMap((cat) =>
        cat.images.map((img) => ({ ...img, category: cat.label }))
    );

    const [lightbox, setLightbox] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const touchStartX = useRef<number | null>(null);
    const [navFixed, setNavFixed] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setNavFixed(!entry.isIntersecting),
            { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const prev = () => setLightbox((i) => i !== null ? (i - 1 + ALL_IMAGES.length) % ALL_IMAGES.length : null);
    const next = () => setLightbox((i) => i !== null ? (i + 1) % ALL_IMAGES.length : null);

    // Lightbox megnyitása – globális index alapján
    const openLightbox = (catId: string, imgIndex: number) => {
        const catStartIndex = categories
            .slice(0, categories.findIndex((c) => c.id === catId))
            .reduce((acc, cat) => acc + cat.images.length, 0);
        setLightbox(catStartIndex + imgIndex);
    };

    return (
        <div className="min-h-screen bg-cream pt-28 pb-20">
            <div className="container-custom">

                {/* Fejléc */}
                <div className="text-center mb-12">
                    <div className="section-badge">Galéria</div>
                    <h1 className="font-serif text-display-lg font-light text-forest-900">
                        Tekintsen be az apartmanokba
                    </h1>
                    <p className="text-stone-500 mt-3">
                        {ALL_IMAGES.length} kép a szállásról és környékéről
                    </p>
                </div>

                {/* Sentinel – megfigyeljük mikor tűnik el a nézőmezőből */}
                <div ref={sentinelRef} className="h-0" />

                {/* Fixed nav – csak amikor a sentinel eltűnt (iOS sticky fix) */}
                {navFixed && (
                    <div className="fixed top-20 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12">
                        <div className="max-w-[1280px] mx-auto">
                            <div className="flex overflow-x-auto scrollbar-none items-center gap-2 bg-cream/95 backdrop-blur-md py-3 px-4 rounded-2xl shadow-card border border-stone-100">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={"shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 " + (
                                        activeCategory === null
                                            ? "bg-forest-600 text-white shadow-luxury"
                                            : "bg-white text-stone-600 hover:bg-forest-50 shadow-card"
                                    )}
                                >
                                    Összes
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setTimeout(() => {
                                                document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }, 50);
                                        }}
                                        className={"shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 " + (
                                            activeCategory === cat.id
                                                ? "bg-forest-600 text-white shadow-luxury"
                                                : "bg-white text-stone-600 hover:bg-forest-50 shadow-card"
                                        )}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Kategória navigáció (inline) */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-16 py-4 rounded-2xl">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={"px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 " + (
                            activeCategory === null
                                ? "bg-forest-600 text-white shadow-luxury"
                                : "bg-white text-stone-600 hover:bg-forest-50 shadow-card"
                        )}
                    >
                        Összes
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={"px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 " + (
                                activeCategory === cat.id
                                    ? "bg-forest-600 text-white shadow-luxury"
                                    : "bg-white text-stone-600 hover:bg-forest-50 shadow-card"
                            )}
                        >
                            {cat.label}
                            <span className="ml-1.5 text-xs opacity-60">{cat.images.length}</span>
                        </button>
                    ))}
                </div>

                {/* Kategóriák szekciónként */}
                <div className="space-y-20">
                    {categories.map((cat) => (
                        <section key={cat.id} id={cat.id} style={{ scrollMarginTop: "140px" }}>

                            {/* Szekció fejléc */}
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <h2 className="font-serif text-display-md font-light text-forest-900">
                                        {cat.label}
                                    </h2>
                                    <p className="text-stone-500 text-sm mt-1">{cat.desc}</p>
                                </div>
                                <span className="text-stone-300 font-serif text-4xl font-light">
                                    {cat.images.length}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-forest-900/20 via-terra-400/20 to-transparent mb-8" />

                            {/* Képrács – egyforma rács */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cat.images.map((img, i) => (
                                    <motion.div
                                        key={img.src}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.1 }}
                                        transition={{ delay: i * 0.08, duration: 0.5 }}
                                        className="cursor-pointer group relative overflow-hidden rounded-2xl aspect-[4/3]"
                                        onClick={() => openLightbox(cat.id, i)}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/40 transition-all duration-300 flex items-end p-4">
                                            <span className="text-cream text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                                {img.alt}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                        </section>
                    ))}
                </div>

            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox !== null && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/97 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                        onTouchEnd={(e) => {
                            if (touchStartX.current === null) return;
                            const diff = touchStartX.current - e.changedTouches[0].clientX;
                            if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
                            touchStartX.current = null;
                        }}
                    >
                        {/* Kategória label */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase">
                            {ALL_IMAGES[lightbox].category}
                        </div>

                        {/* Bezárás */}
                        <button
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                            onClick={() => setLightbox(null)}
                        >
                            <X size={20} />
                        </button>

                        {/* Előző */}
                        <button
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Következő */}
                        <button
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                            onClick={(e) => { e.stopPropagation(); next(); }}
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Kép */}
                        <motion.div
                            key={lightbox}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-5xl w-full mx-12 sm:mx-20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={ALL_IMAGES[lightbox].src}
                                alt={ALL_IMAGES[lightbox].alt}
                                width={1400}
                                height={900}
                                className="w-full h-auto max-h-[85vh] object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/60">
                                <p className="text-white/70 text-sm">{ALL_IMAGES[lightbox].alt}</p>
                                <p className="text-white/40 text-xs">{lightbox + 1} / {ALL_IMAGES.length}</p>
                            </div>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}