"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageOff,
  MapPin, Users, Waves, Home, TreePine, Flame, Coffee, Utensils, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike, Plus, Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_OPTIONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "MapPin",      label: "Helyszín (térkép)",      icon: MapPin      },
  { name: "Users",       label: "Emberek (vendégek)",      icon: Users       },
  { name: "Waves",       label: "Hullámok (jacuzzi)",      icon: Waves       },
  { name: "Home",        label: "Ház",                     icon: Home        },
  { name: "TreePine",    label: "Fenyőfa (kert)",           icon: TreePine    },
  { name: "Flame",       label: "Láng (kandalló)",          icon: Flame       },
  { name: "Coffee",      label: "Kávé",                     icon: Coffee      },
  { name: "Utensils",    label: "Evőeszköz (konyha)",       icon: Utensils    },
  { name: "Wifi",        label: "Wi-Fi",                    icon: Wifi        },
  { name: "Star",        label: "Csillag",                  icon: Star        },
  { name: "Heart",       label: "Szív",                     icon: Heart       },
  { name: "Sun",         label: "Nap",                      icon: Sun         },
  { name: "Bath",        label: "Fürdőkád",                 icon: Bath        },
  { name: "Car",         label: "Autó (parkoló)",           icon: Car         },
  { name: "Wind",        label: "Szél (légkondicionáló)",   icon: Wind        },
  { name: "Flower2",     label: "Virág",                    icon: Flower2     },
  { name: "ShieldCheck", label: "Védelem (biztonság)",      icon: ShieldCheck },
  { name: "Bed",         label: "Ágy",                      icon: Bed         },
  { name: "Mountain",    label: "Hegy (természet)",         icon: Mountain    },
  { name: "Sparkles",    label: "Csillogás (luxus)",        icon: Sparkles    },
  { name: "Music",       label: "Zene",                     icon: Music       },
  { name: "Bike",        label: "Kerékpár",                 icon: Bike        },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, icon }) => [name, icon])
);

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

function ImageUploader({
  label,
  image,
  bucket,
  onChange,
}: {
  label:    string;
  image:    ImageField;
  bucket:   string;
  onChange: (img: ImageField) => void;
}) {
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch(`/api/admin/upload?bucket=${bucket}`, { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onChange({ ...image, src: json.url });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Feltöltési hiba");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-4 items-start p-4 bg-stone-50 rounded-xl">
      <div className="flex-shrink-0 w-28 h-20 rounded-xl border-2 border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center">
        {image.src ? (
          <Image src={image.src} alt={image.alt || ""} width={112} height={80} className="w-full h-full object-cover" unoptimized />
        ) : (
          <ImageOff size={20} className="text-stone-300" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-white transition-colors disabled:opacity-60 w-full justify-center"
        >
          <Upload size={14} />
          {uploading ? "Feltöltés..." : "Kép feltöltése"}
        </button>

        {image.src && (
          <button
            type="button"
            onClick={() => onChange({ ...image, src: "" })}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={11} />
            Kép eltávolítása
          </button>
        )}

        <p className="text-xs text-stone-400">JPG, PNG vagy WebP, max. 20 MB</p>
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Alt szöveg</label>
          <input
            value={image.alt}
            onChange={(e) => onChange({ ...image, alt: e.target.value })}
            placeholder="pl. Gamma Apartmanok – vendégház kívülről"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export default function AdminAbout({ initial }: { initial: AboutData }) {
  const [form, setForm]     = useState<AboutData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const set = (key: keyof AboutData, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setImage = (key: "mainImage" | "floatImage", img: ImageField) =>
    setForm((f) => ({ ...f, [key]: img }));

  const setValue = (i: number, key: keyof Value, val: string) =>
    setForm((f) => {
      const v = [...f.values];
      v[i] = { ...v[i], [key]: val };
      return { ...f, values: v };
    });

  const addValue = () =>
    setForm((f) => ({ ...f, values: [...f.values, { icon: "Star", title: "", text: "" }] }));

  const removeValue = (i: number) =>
    setForm((f) => ({ ...f, values: f.values.filter((_, idx) => idx !== i) }));

  const setNearby = (i: number, val: string) =>
    setForm((f) => {
      const n = [...f.nearby];
      n[i] = val;
      return { ...f, nearby: n };
    });

  const addNearby = () =>
    setForm((f) => ({ ...f, nearby: [...f.nearby, ""] }));

  const removeNearby = (i: number) =>
    setForm((f) => ({ ...f, nearby: f.nearby.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/about", {
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

      {/* Képek */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-medium text-stone-700">Képek</h2>
        <ImageUploader
          label="Fő kép (bal oldal nagy kép)"
          image={form.mainImage}
          bucket="about"
          onChange={(img) => setImage("mainImage", img)}
        />
        <ImageUploader
          label="Lebegő kis kép (sarok)"
          image={form.floatImage}
          bucket="about"
          onChange={(img) => setImage("floatImage", img)}
        />
      </div>

      {/* Szövegek */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <h2 className="font-medium text-stone-700">Szövegek</h2>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Cím – első sor
          </label>
          <input
            value={form.heading1}
            onChange={(e) => set("heading1", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Cím – második sor (dőlt)
          </label>
          <input
            value={form.heading2}
            onChange={(e) => set("heading2", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div className="bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-500">
          <span className="font-medium text-stone-700">Előnézet: </span>
          {form.heading1} <em className="italic">{form.heading2}</em>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Leírás – 1. bekezdés
          </label>
          <textarea
            value={form.description1}
            onChange={(e) => set("description1", e.target.value)}
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
            Leírás – 2. bekezdés
          </label>
          <textarea
            value={form.description2}
            onChange={(e) => set("description2", e.target.value)}
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 resize-none"
          />
        </div>
      </div>

      {/* Értékek (value kártyák) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-stone-700">Értékek / jellemzők</h2>
          <button
            onClick={addValue}
            className="flex items-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-forest-200 hover:border-forest-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Hozzáadás
          </button>
        </div>

        {form.values.length === 0 && (
          <p className="text-sm text-stone-400 italic">Nincsenek jellemzők.</p>
        )}

        {form.values.map((v, i) => {
          const IconComp = ICON_MAP[v.icon] ?? Star;
          return (
            <div key={i} className="p-4 bg-stone-50 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                {/* Ikon */}
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Ikon</label>
                  <div className="relative">
                    <select
                      value={v.icon}
                      onChange={(e) => setValue(i, "icon", e.target.value)}
                      className="appearance-none border border-stone-200 rounded-lg pl-8 pr-6 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30 cursor-pointer"
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

                {/* Cím */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Cím</label>
                  <input
                    value={v.title}
                    onChange={(e) => setValue(i, "title", e.target.value)}
                    placeholder="pl. Zsákutcai csend"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                  />
                </div>

                <button
                  onClick={() => removeValue(i)}
                  className="mt-5 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                  title="Törlés"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Szöveg */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Leírás szöveg</label>
                <textarea
                  value={v.text}
                  onChange={(e) => setValue(i, "text", e.target.value)}
                  rows={2}
                  placeholder="pl. Miskolctapolca csendes sarkában, zsákutcában..."
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30 resize-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Közeli látnivalók */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-stone-700">Közeli látnivalók</h2>
          <button
            onClick={addNearby}
            className="flex items-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-forest-200 hover:border-forest-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Hozzáadás
          </button>
        </div>

        {form.nearby.length === 0 && (
          <p className="text-sm text-stone-400 italic">Nincsenek látnivalók.</p>
        )}

        {form.nearby.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => setNearby(i, e.target.value)}
              placeholder="pl. Ellipsum, Barlangfürdő – 1 km"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
            />
            <button
              onClick={() => removeNearby(i)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Törlés"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
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
