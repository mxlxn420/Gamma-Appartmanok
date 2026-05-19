"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageOff, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { GalleryCategory, GalleryImage } from "@/components/sections/GaleriaPage";
import type { FeaturedImage }                 from "@/components/sections/GallerySection";

interface GalleryData {
  featured:   FeaturedImage[];
  categories: GalleryCategory[];
}

// ─── Újrahasználható kép-feltöltő slot ───────────────────────────────────────

function ImageSlot({
  image,
  bucket,
  onChangeSrc,
  onChangeAlt,
  onRemove,
}: {
  image:       { src: string; alt: string };
  bucket:      string;
  onChangeSrc: (src: string) => void;
  onChangeAlt: (alt: string) => void;
  onRemove:    () => void;
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
      let json: { success: boolean; url?: string; error?: string };
      try { json = await res.json(); } catch { throw new Error(`Szerver hiba (${res.status}): a fájl túl nagy, vagy hiányzó konfig.`); }
      if (!json.success) throw new Error(json.error);
      onChangeSrc(json.url!);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Felt\u00F6lt\u00E9si hiba");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-3 items-start p-3 bg-stone-50 rounded-xl">
      {/* Előnézet */}
      <div className="flex-shrink-0 w-20 h-16 rounded-lg border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        {image.src ? (
          <Image src={image.src} alt={image.alt || ""} width={80} height={64} className="w-full h-full object-cover" unoptimized />
        ) : (
          <ImageOff size={16} className="text-stone-300" />
        )}
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs hover:bg-white transition-colors disabled:opacity-60"
        >
          <Upload size={11} />
          {uploading ? "Felt\u00F6lt\u00E9s..." : "Kép cseréje"}
        </button>
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        <input
          value={image.alt}
          onChange={(e) => onChangeAlt(e.target.value)}
          placeholder="Alt szöveg..."
          className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </div>

      <button onClick={onRemove} className="mt-0.5 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors" title="Eltávolítás">
        <X size={14} />
      </button>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Kép hozzáadása gomb ─────────────────────────────────────────────────────

function AddImageButton({ bucket, onAdd }: { bucket: string; onAdd: (img: GalleryImage) => void }) {
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors]     = useState<string[]>([]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setErrors([]);
    setProgress({ done: 0, total: files.length });
    const errs: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const fd = new FormData();
        fd.append('file', files[i]);
        const res  = await fetch(`/api/admin/upload?bucket=${bucket}`, { method: 'POST', body: fd });
        let json: { success: boolean; url?: string; error?: string };
        try { json = await res.json(); } catch { throw new Error(`Szerver hiba (${res.status}): a fájl túl nagy, vagy hiányzó konfig.`); }
        if (!json.success) throw new Error(json.error);
        onAdd({ src: json.url!, alt: '' });
      } catch (err: unknown) {
        errs.push(`${files[i].name}: ${err instanceof Error ? err.message : 'Feltöltési hiba'}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setErrors(errs);
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploading = progress !== null;

  return (
    <div>
      <button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs hover:border-forest-400 hover:text-forest-600 transition-colors disabled:opacity-60 w-full justify-center'
      >
        <Plus size={13} />
        {uploading ? `Feltöltés... (${progress!.done}/${progress!.total})` : 'Képek hozzáadása'}
      </button>
      {errors.map((e, i) => <p key={i} className='text-xs text-red-500 mt-1'>{e}</p>)}
      <input ref={fileInputRef} type='file' accept='image/jpeg,image/png,image/webp' multiple className='hidden' onChange={handleFiles} />
    </div>
  );
}
// ─── Fő komponens ─────────────────────────────────────────────────────────────

export default function AdminGallery({ initial }: { initial: GalleryData }) {
  const [form, setForm]               = useState<GalleryData>(initial);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [activeTab, setActiveTab]     = useState<"featured" | "categories">("featured");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // ── Featured helpers ──────────────────────────────────────────────────────

  const setFeaturedSrc = (i: number, src: string) =>
    setForm((f) => { const a = [...f.featured]; a[i] = { ...a[i], src }; return { ...f, featured: a }; });

  const setFeaturedAlt = (i: number, alt: string) =>
    setForm((f) => { const a = [...f.featured]; a[i] = { ...a[i], alt }; return { ...f, featured: a }; });

  const removeFeatured = (i: number) =>
    setForm((f) => ({ ...f, featured: f.featured.filter((_, idx) => idx !== i) }));

  // ── Category helpers ──────────────────────────────────────────────────────

  const setCatField = (i: number, key: keyof Pick<GalleryCategory, "label" | "desc" | "id">, val: string) =>
    setForm((f) => { const c = [...f.categories]; c[i] = { ...c[i], [key]: val }; return { ...f, categories: c }; });

  const addCategory = () => {
    const id = `cat-${Date.now()}`;
    setForm((f) => ({ ...f, categories: [...f.categories, { id, label: "", desc: "", images: [] }] }));
    setExpandedCat(id);
  };

  const removeCategory = (i: number) =>
    setForm((f) => ({ ...f, categories: f.categories.filter((_, idx) => idx !== i) }));

  const addImageToCategory = (catIdx: number, img: GalleryImage) =>
    setForm((f) => {
      const cats = [...f.categories];
      cats[catIdx] = { ...cats[catIdx], images: [...cats[catIdx].images, img] };
      return { ...f, categories: cats };
    });

  const setCatImageAlt = (catIdx: number, imgIdx: number, alt: string) =>
    setForm((f) => {
      const cats = [...f.categories];
      const imgs = [...cats[catIdx].images];
      imgs[imgIdx] = { ...imgs[imgIdx], alt };
      cats[catIdx] = { ...cats[catIdx], images: imgs };
      return { ...f, categories: cats };
    });

  const removeCatImage = (catIdx: number, imgIdx: number) =>
    setForm((f) => {
      const cats = [...f.categories];
      cats[catIdx] = { ...cats[catIdx], images: cats[catIdx].images.filter((_, idx) => idx !== imgIdx) };
      return { ...f, categories: cats };
    });

  // ── Mentés ────────────────────────────────────────────────────────────────

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/gallery", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ment\u00E9si hiba");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Hiba t\u00F6rt\u00E9nt ment\u00E9s k\u00F6zben.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Tabok */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {(["featured", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab === "featured" ? "Kiemelt képek (főoldal)" : "Kategóriák (teljes galéria)"}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Kiemelt képek ── */}
      {activeTab === "featured" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-medium text-stone-700">Kiemelt képek</h2>
              <p className="text-xs text-stone-400 mt-0.5">A főoldal galériájában megjelenő képek. Az <strong>első kép mindig nagyobb</strong> (2×2 rács).</p>
            </div>
            <span className="text-xs text-stone-400">{form.featured.length} kép</span>
          </div>

          <div className="space-y-2">
            {form.featured.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                {i === 0 && (
                  <span className="flex-shrink-0 text-[10px] font-medium text-terra-500 bg-terra-50 border border-terra-200 px-1.5 py-0.5 rounded-md">Nagy</span>
                )}
                <div className={`flex-1 ${i === 0 ? "" : "ml-[42px]"}`}>
                  <ImageSlot
                    image={img}
                    bucket="gallery"
                    onChangeSrc={(src) => setFeaturedSrc(i, src)}
                    onChangeAlt={(alt) => setFeaturedAlt(i, alt)}
                    onRemove={() => removeFeatured(i)}
                  />
                </div>
              </div>
            ))}
          </div>

          <AddImageButton
            bucket="gallery"
            onAdd={(img) => setForm((f) => ({ ...f, featured: [...f.featured, img] }))}
          />
        </div>
      )}

      {/* ── Tab 2: Kategóriák ── */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">{form.categories.length} kategória</p>
            <button
              onClick={addCategory}
              className="flex items-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-forest-200 hover:border-forest-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={12} />
              Kategória hozzáadása
            </button>
          </div>

          {form.categories.map((cat, catIdx) => {
            const isOpen = expandedCat === cat.id;
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">

                {/* Fejléc */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                >
                  <GripVertical size={14} className="text-stone-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-700 text-sm truncate">{cat.label || <span className="text-stone-400 italic">Névtelen kategória</span>}</p>
                    <p className="text-xs text-stone-400">{cat.images.length} kép</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeCategory(catIdx); }}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      title="Kategória törlése"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isOpen ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
                  </div>
                </div>

                {/* Tartalom */}
                {isOpen && (
                  <div className="border-t border-stone-100 p-4 space-y-4">

                    {/* Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">Kategória neve</label>
                        <input
                          value={cat.label}
                          onChange={(e) => setCatField(catIdx, "label", e.target.value)}
                          placeholder="pl. Kert & Terasz"
                          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">URL azonosító (slug)</label>
                        <input
                          value={cat.id}
                          onChange={(e) => setCatField(catIdx, "id", e.target.value)}
                          placeholder="pl. kert"
                          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Leírás</label>
                      <input
                        value={cat.desc}
                        onChange={(e) => setCatField(catIdx, "desc", e.target.value)}
                        placeholder="pl. Hatalmas privát kert grillel és bográccsal"
                        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                      />
                    </div>

                    {/* Képek */}
                    <div className="space-y-2">
                      {cat.images.map((img, imgIdx) => (
                        <ImageSlot
                          key={imgIdx}
                          image={img}
                          bucket="gallery"
                          onChangeSrc={(src) => {
                            const cats = [...form.categories];
                            const imgs = [...cats[catIdx].images];
                            imgs[imgIdx] = { ...imgs[imgIdx], src };
                            cats[catIdx] = { ...cats[catIdx], images: imgs };
                            setForm((f) => ({ ...f, categories: cats }));
                          }}
                          onChangeAlt={(alt) => setCatImageAlt(catIdx, imgIdx, alt)}
                          onRemove={() => removeCatImage(catIdx, imgIdx)}
                        />
                      ))}
                    </div>

                    <AddImageButton
                      bucket="gallery"
                      onAdd={(img) => addImageToCategory(catIdx, img)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mentés */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? "Ment\u00E9s\u2026" : "Ment\u00E9s"}
        </button>
        {saved && <span className="text-sm text-green-600">Sikeresen mentve!</span>}
      </div>

    </div>
  );
}
