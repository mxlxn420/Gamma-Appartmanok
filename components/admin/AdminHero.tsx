"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageOff, Plus,
  Waves, Home, TreePine, Flame, Coffee, Utensils, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_OPTIONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "Waves",       label: "Hullámok (jacuzzi)",   icon: Waves       },
  { name: "Home",        label: "Ház",                  icon: Home        },
  { name: "TreePine",    label: "Fenyőfa (kert)",        icon: TreePine    },
  { name: "Flame",       label: "Láng (kandalló)",       icon: Flame       },
  { name: "Coffee",      label: "Kávé",                  icon: Coffee      },
  { name: "Utensils",    label: "Evőeszköz (konyha)",    icon: Utensils    },
  { name: "Wifi",        label: "Wi-Fi",                 icon: Wifi        },
  { name: "Star",        label: "Csillag",               icon: Star        },
  { name: "Heart",       label: "Szív",                  icon: Heart       },
  { name: "Sun",         label: "Nap",                   icon: Sun         },
  { name: "Bath",        label: "Fürdőkád",              icon: Bath        },
  { name: "Car",         label: "Autó (parkoló)",        icon: Car         },
  { name: "Wind",        label: "Szél (légkondicionáló)",icon: Wind        },
  { name: "Flower2",     label: "Virág",                 icon: Flower2     },
  { name: "ShieldCheck", label: "Védelem (biztonság)",   icon: ShieldCheck },
  { name: "Bed",         label: "Ágy",                   icon: Bed         },
  { name: "Mountain",    label: "Hegy (természet)",      icon: Mountain    },
  { name: "Sparkles",    label: "Csillogás (luxus)",     icon: Sparkles    },
  { name: "Music",       label: "Zene",                  icon: Music       },
  { name: "Bike",        label: "Kerékpár",              icon: Bike        },
];

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, icon }) => [name, icon])
);

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
  initial: HeroData;
}

function SlideUploader({
  slide,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  slide:     Slide;
  index:     number;
  onChange:  (key: keyof Slide, val: string) => void;
  onRemove:  () => void;
  canRemove: boolean;
}) {
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/admin/upload?bucket=hero", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onChange("src", json.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Feltöltési hiba");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-4 items-start p-4 bg-stone-50 rounded-xl">

      {/* Előnézet */}
      <div className="flex-shrink-0 w-28 h-20 rounded-xl border-2 border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center">
        {slide.src ? (
          <Image src={slide.src} alt={slide.alt || ""} width={112} height={80} className="w-full h-full object-cover" unoptimized />
        ) : (
          <ImageOff size={20} className="text-stone-300" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{index + 1}. kép</p>
          {canRemove && (
            <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors" title="Slot törlése">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Feltöltő gomb */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-white transition-colors disabled:opacity-60 w-full justify-center"
        >
          <Upload size={14} />
          {uploading ? "Feltöltés..." : "Kép feltöltése"}
        </button>

        {slide.src && (
          <button
            type="button"
            onClick={() => onChange("src", "")}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={11} />
            Kép eltávolítása
          </button>
        )}

        <p className="text-xs text-stone-400">JPG, PNG vagy WebP, max. 20 MB</p>
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        {/* Alt szöveg */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Alt szöveg
          </label>
          <input
            value={slide.alt}
            onChange={(e) => onChange("alt", e.target.value)}
            placeholder="pl. Gamma 1 – nappali"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        {/* Felirat */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">
            Felirat (jobb alsó sarok)
          </label>
          <input
            value={slide.label ?? ""}
            onChange={(e) => onChange("label", e.target.value)}
            placeholder="pl. Gamma 1"
            maxLength={40}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

    </div>
  );
}

export default function AdminHero({ initial }: Props) {
  const [form, setForm]     = useState<HeroData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const set = (key: keyof HeroData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setSlide = (i: number, key: keyof Slide, val: string) =>
    setForm((f) => {
      const sl = [...f.slides];
      sl[i] = { ...sl[i], [key]: val };
      return { ...f, slides: sl };
    });

  const setHighlight = (i: number, key: keyof Highlight, val: string) =>
    setForm((f) => {
      const hl = [...f.highlights];
      hl[i] = { ...hl[i], [key]: val };
      return { ...f, highlights: hl };
    });

  const addHighlight = () =>
    setForm((f) => ({ ...f, highlights: [...f.highlights, { icon: "Star", label: "" }] }));

  const removeHighlight = (i: number) =>
    setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/hero", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Mentési hiba");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Hiba történt mentés közben.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Slideshow képek */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-stone-700">Slideshow képek ({form.slides.length})</h2>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, slides: [...f.slides, { src: "", alt: "", label: "" }] }))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs hover:bg-stone-50 transition-colors"
          >
            <Plus size={13} /> Új slot
          </button>
        </div>

        {form.slides.map((slide, i) => (
          <SlideUploader
            key={i}
            slide={slide}
            index={i}
            onChange={(key, val) => setSlide(i, key, val)}
            onRemove={() => setForm((f) => ({ ...f, slides: f.slides.filter((_, idx) => idx !== i) }))}
            canRemove={form.slides.length > 1}
          />
        ))}
      </div>

      {/* Szövegek */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <h2 className="font-medium text-stone-700">Szövegek</h2>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Alcím (kis szöveg cím felett)
          </label>
          <input
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Főcím – szöveg a kiemelés előtt
          </label>
          <input
            value={form.titleBefore}
            onChange={(e) => set("titleBefore", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Főcím – kiemelt szó (dőlt, terrakotta szín)
          </label>
          <input
            value={form.titleEmphasis}
            onChange={(e) => set("titleEmphasis", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Főcím – szöveg a kiemelés után
          </label>
          <input
            value={form.titleAfter}
            onChange={(e) => set("titleAfter", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div className="bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-500">
          <span className="font-medium text-stone-700">Előnézet: </span>
          {form.titleBefore}
          <em className="text-terra-500 not-italic font-medium">{form.titleEmphasis}</em>
          {" "}{form.titleAfter}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Leírás
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 resize-none"
          />
        </div>
      </div>

      {/* Kiemelt jellemzők */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-stone-700">Kiemelt jellemzők</h2>
          <button
            onClick={addHighlight}
            className="text-xs font-medium text-forest-600 hover:text-forest-700 border border-forest-200 hover:border-forest-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Hozzáadás
          </button>
        </div>

        {form.highlights.length === 0 && (
          <p className="text-sm text-stone-400 italic">Nincsenek kiemelt jellemzők.</p>
        )}

        {form.highlights.map((hl, i) => {
          const IconComp = ICON_MAP[hl.icon] ?? Star;
          return (
            <div key={i} className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-start gap-3">
                {/* Törlés gomb – jobb felső sarok */}
                <div className="flex-1 flex flex-col sm:flex-row gap-3">

                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">Ikon</label>
                    <div className="relative">
                      <select
                        value={hl.icon}
                        onChange={(e) => setHighlight(i, "icon", e.target.value)}
                        className="appearance-none border border-stone-200 rounded-lg pl-8 pr-6 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30 cursor-pointer w-full sm:w-auto"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.name} value={opt.name}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-stone-500">
                        <IconComp size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">Szöveg</label>
                    <input
                      value={hl.label}
                      onChange={(e) => setHighlight(i, "label", e.target.value)}
                      placeholder="pl. Privát jacuzzi"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                    />
                  </div>

                </div>

                <button
                  onClick={() => removeHighlight(i)}
                  className="mt-5 flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center text-base leading-none"
                  title="Törlés"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mentés */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? "Mentés…" : "Mentés"}
        </button>
        {saved && <span className="text-sm text-green-600">Sikeresen mentve!</span>}
      </div>

    </div>
  );
}
