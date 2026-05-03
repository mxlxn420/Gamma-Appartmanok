"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageOff, Save, Loader2 } from "lucide-react";

interface Apartment {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  maxGuests:   number;
  coverImage:  string | null;
  isActive:    boolean;
}

interface ApartmentFormState {
  name:        string;
  description: string;
  maxGuests:   number;
  coverImage:  string;
}

function ApartmentCard({ apt }: { apt: Apartment }) {
  const [form, setForm]         = useState<ApartmentFormState>({
    name:        apt.name,
    description: apt.description ?? "",
    maxGuests:   apt.maxGuests,
    coverImage:  apt.coverImage ?? "",
  });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/upload?bucket=apartments", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setForm((f) => ({ ...f, coverImage: json.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Feltöltési hiba");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/apartments", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: apt.id, ...form }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Mentési hiba");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
          <span className="text-forest-700 font-serif text-lg font-light">{apt.slug.slice(-1)}</span>
        </div>
        <h2 className="font-medium text-stone-800 text-lg">{apt.name}</h2>
      </div>

      {/* Borítókép */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Borítókép</label>
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-32 h-24 rounded-xl border-2 border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center">
            {form.coverImage ? (
              <Image src={form.coverImage} alt={form.name} width={128} height={96} className="w-full h-full object-cover" unoptimized />
            ) : (
              <ImageOff size={20} className="text-stone-300" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors disabled:opacity-60 w-full justify-center"
            >
              <Upload size={14} />
              {uploading ? "Feltöltés..." : "Kép feltöltése"}
            </button>
            {form.coverImage && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={11} /> Kép eltávolítása
              </button>
            )}
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            <p className="text-xs text-stone-400">JPG, PNG vagy WebP, max. 20 MB</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* Leírás */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Leírás</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          placeholder="Rövid leírás az apartmanról..."
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30 resize-none"
        />
      </div>

      {/* Max vendég */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Max. vendégszám</label>
        <input
          type="number"
          min={1}
          max={20}
          value={form.maxGuests}
          onChange={(e) => setForm((f) => ({ ...f, maxGuests: Number(e.target.value) }))}
          className="w-24 border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </div>

      {/* Mentés */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-cream text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {saved ? "Mentve!" : saving ? "Mentés..." : "Mentés"}
      </button>
    </div>
  );
}

export default function AdminApartments({ apartments }: { apartments: Apartment[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {apartments.map((apt) => (
        <ApartmentCard key={apt.id} apt={apt} />
      ))}
    </div>
  );
}
