"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Save, Trash2, Plus, Pencil, X, Moon, CalendarCheck, Upload, ImageOff } from "lucide-react";

type PricingType = "PER_NIGHT" | "PER_BOOKING";

interface ExtraService {
  id:          string;
  name:        string;
  description: string;
  pricingType: PricingType;
  price:       number | null;
  imageUrl:    string | null;
  isActive:    boolean;
}

type FormData = Omit<ExtraService, "id" | "isActive">;

interface Props {
  services: ExtraService[];
}

const EMPTY: FormData = {
  name:        "",
  description: "",
  pricingType: "PER_BOOKING",
  price:       null,
  imageUrl:    null,
};

const PRICING_LABEL: Record<PricingType, string> = {
  PER_NIGHT:   "/ éjszaka",
  PER_BOOKING: "/ foglalás",
};

export default function AdminExtraServices({ services: initial }: Props) {
  const [services, setServices]   = useState<ExtraService[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData]   = useState<FormData>(EMPTY);
  const [showNew, setShowNew]     = useState(false);
  const [newData, setNewData]     = useState<FormData>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const startEdit = (s: ExtraService) => {
    setEditingId(s.id);
    setEditData({
      name:        s.name,
      description: s.description,
      pricingType: s.pricingType,
      price:       s.price,
      imageUrl:    s.imageUrl,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true); setError(null);
    try {
      const res  = await fetch(`/api/admin/extra-services/${editingId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(editData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setServices((prev) => prev.map((s) => s.id === editingId ? { ...s, ...editData } : s));
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt");
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a szolgáltatást?")) return;
    try {
      const res  = await fetch(`/api/admin/extra-services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt");
    }
  };

  const createService = async () => {
    if (!newData.name.trim())        { setError("A név kötelező!"); return; }
    if (!newData.description.trim()) { setError("A leírás kötelező!"); return; }
    setSaving(true); setError(null);
    try {
      const res  = await fetch("/api/admin/extra-services", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setServices((prev) => [...prev, data.data]);
      setNewData(EMPTY);
      setShowNew(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">

      {services.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
          {editingId === s.id ? (
            <div className="p-5">
              <ServiceForm
                data={editData}
                setData={setEditData}
                onSave={saveEdit}
                onCancel={() => setEditingId(null)}
                saving={saving}
                label="Mentés"
              />
            </div>
          ) : (
            <div className="flex gap-4">
              {/* Kép */}
              {s.imageUrl ? (
                <div className="relative w-28 shrink-0">
                  <Image
                    src={s.imageUrl}
                    alt={s.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 shrink-0 bg-stone-100 flex items-center justify-center">
                  <ImageOff size={20} className="text-stone-300" />
                </div>
              )}

              {/* Tartalom */}
              <div className="flex-1 min-w-0 py-4 pr-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-stone-800">{s.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.pricingType === "PER_NIGHT"
                          ? "bg-forest-50 text-forest-700"
                          : "bg-terra-50 text-terra-700"
                      }`}>
                        {s.pricingType === "PER_NIGHT" ? <Moon size={10} /> : <CalendarCheck size={10} />}
                        {PRICING_LABEL[s.pricingType]}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 mt-1 leading-relaxed">{s.description}</p>
                    {s.price != null && (
                      <p className="text-sm font-semibold text-forest-700 mt-2">
                        {s.price.toLocaleString("hu-HU")} Ft {PRICING_LABEL[s.pricingType]}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(s)}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                    >
                      <Pencil size={13} className="text-stone-500" />
                    </button>
                    <button
                      onClick={() => deleteService(s.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-stone-800">Új szolgáltatás</p>
            <button onClick={() => { setShowNew(false); setNewData(EMPTY); }}>
              <X size={16} className="text-stone-400" />
            </button>
          </div>
          <ServiceForm
            data={newData}
            setData={setNewData}
            onSave={createService}
            onCancel={() => { setShowNew(false); setNewData(EMPTY); }}
            saving={saving}
            label="Létrehozás"
          />
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-forest-400 hover:text-forest-600 transition-colors w-full justify-center text-sm"
        >
          <Plus size={15} />
          Új szolgáltatás hozzáadása
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function ServiceForm({
  data, setData, onSave, onCancel, saving, label,
}: {
  data:     FormData;
  setData:  (d: FormData) => void;
  onSave:   () => void;
  onCancel: () => void;
  saving:   boolean;
  label:    string;
}) {
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true); setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: form });
      let json: { success: boolean; url?: string; error?: string };
      try { json = await res.json(); } catch { throw new Error(`Szerver hiba (${res.status}): a fájl túl nagy, vagy hiányzó konfig.`); }
      if (!json.success) throw new Error(json.error);
      setData({ ...data, imageUrl: json.url! });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Feltöltési hiba");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">

      {/* Kép feltöltés */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">
          Kép
        </label>
        <div className="flex items-start gap-3">
          {/* Preview */}
          <div className="w-24 h-20 rounded-xl border-2 border-stone-200 overflow-hidden shrink-0 bg-stone-50 flex items-center justify-center">
            {data.imageUrl ? (
              <Image src={data.imageUrl} alt="preview" width={96} height={80} className="w-full h-full object-cover" />
            ) : (
              <ImageOff size={20} className="text-stone-300" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors disabled:opacity-60 w-full justify-center"
            >
              <Upload size={14} />
              {uploading ? "Feltöltés..." : "Kép kiválasztása"}
            </button>
            {data.imageUrl && (
              <button
                type="button"
                onClick={() => setData({ ...data, imageUrl: null })}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={11} />
                Kép eltávolítása
              </button>
            )}
            <p className="text-xs text-stone-400">JPG, PNG vagy WebP, max. 20 MB</p>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Név */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
          Szolgáltatás neve
        </label>
        <input
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-forest-400"
          placeholder="pl. Reggeli, Transzfer, Fürdőruha kölcsönzés..."
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </div>

      {/* Leírás */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
          Leírás
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-forest-400 resize-none"
          placeholder="Rövid leírás a vendégek számára..."
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>

      {/* Ár + típus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
            Ár (Ft)
          </label>
          <input
            type="number"
            min={0}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-forest-400"
            placeholder="pl. 5000"
            value={data.price ?? ""}
            onChange={(e) => setData({ ...data, price: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
            Árazás típusa
          </label>
          <div className="flex gap-2 h-[42px]">
            <button
              type="button"
              onClick={() => setData({ ...data, pricingType: "PER_NIGHT" })}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-medium transition-colors ${
                data.pricingType === "PER_NIGHT"
                  ? "border-forest-500 bg-forest-50 text-forest-800"
                  : "border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              <Moon size={12} />
              / éjszaka
            </button>
            <button
              type="button"
              onClick={() => setData({ ...data, pricingType: "PER_BOOKING" })}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-medium transition-colors ${
                data.pricingType === "PER_BOOKING"
                  ? "border-terra-500 bg-terra-50 text-terra-800"
                  : "border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              <CalendarCheck size={12} />
              / foglalás
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-colors"
        >
          Mégse
        </button>
        <button
          onClick={onSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-cream text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
        >
          <Save size={13} />
          {saving ? "Mentés..." : label}
        </button>
      </div>
    </div>
  );
}
