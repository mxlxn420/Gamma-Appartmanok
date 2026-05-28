"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, Save, X, Tag, CalendarDays, Calendar, Zap } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface Discount {
  id:              string;
  name:            string;
  discountPercent: number;
  stayFrom:        string;
  stayTo:          string;
  bookingFrom:     string | null;
  bookingTo:       string | null;
  isActive:        boolean;
  isLastMinute:    boolean;
  lastMinuteDays:  number;
}

interface Props {
  discounts: Discount[];
}

const EMPTY = {
  name:            "",
  discountPercent: 10,
  stayFrom:        "",
  stayTo:          "",
  bookingFrom:     "",
  bookingTo:       "",
  isActive:        true,
  isLastMinute:    false,
  lastMinuteDays:  7,
};

type FormState = typeof EMPTY;

export default function AdminDiscounts({ discounts: initial }: Props) {
  const [discounts, setDiscounts] = useState<Discount[]>(initial);
  const [showNew, setShowNew]     = useState(false);
  const [newForm, setNewForm]     = useState<FormState>(EMPTY);
  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<any | null>(null);
  const [saving, setSaving]       = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const formatDate = (iso: string | null) =>
    iso ? format(parseISO(iso), "yyyy. MM. dd.") : null;

  const openEdit = (d: Discount) => {
    setEditingId(d.id);
    setEditForm({
      ...d,
      stayFrom:      d.stayFrom.slice(0, 10),
      stayTo:        d.stayTo.slice(0, 10),
      bookingFrom:   d.bookingFrom ? d.bookingFrom.slice(0, 10) : "",
      bookingTo:     d.bookingTo   ? d.bookingTo.slice(0, 10)   : "",
      isLastMinute:  d.isLastMinute  ?? false,
      lastMinuteDays: d.lastMinuteDays ?? 7,
    });
    setShowNew(false);
  };

  const closeEdit = () => { setEditingId(null); setEditForm(null); };

  const createDiscount = async () => {
    if (!newForm.name || !newForm.discountPercent || (!newForm.isLastMinute && (!newForm.stayFrom || !newForm.stayTo))) {
      alert("A név, a kedvezmény mértéke és a szállás időszaka kötelező!");
      return;
    }
    setCreating(true);
    try {
      const res  = await fetch("/api/admin/discounts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...newForm,
          bookingFrom: newForm.bookingFrom || null,
          bookingTo:   newForm.bookingTo   || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscounts((prev) => [...prev, data.data]);
        setNewForm(EMPTY);
        setShowNew(false);
      } else {
        alert("Hiba: " + data.error);
      }
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async () => {
    if (!editForm) return;
    setSaving(editForm.id);
    try {
      const res  = await fetch(`/api/admin/discounts/${editForm.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...editForm,
          bookingFrom: editForm.bookingFrom || null,
          bookingTo:   editForm.bookingTo   || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscounts((prev) => prev.map((d) => d.id === editForm.id ? data.data : d));
        closeEdit();
      } else {
        alert("Hiba: " + data.error);
      }
    } finally {
      setSaving(null);
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm("Biztosan törli ezt a kedvezményt?")) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">
        <p className="text-sm text-stone-500">{discounts.length} kedvezmény</p>
        <button
          onClick={() => { setNewForm(EMPTY); setShowNew(true); closeEdit(); }}
          className="btn-primary py-2.5 px-5 text-xs"
        >
          <Plus size={14} /> Új kedvezmény
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-2xl shadow-card p-6 border-2 border-forest-100"
          >
            <h3 className="font-medium text-stone-800 mb-4">Új kedvezmény</h3>
            <DiscountFormFields form={newForm} setForm={setNewForm} />
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-stone-100">
              <button onClick={() => setShowNew(false)} className="btn-ghost py-2 px-4 text-xs">
                <X size={13} /> Mégse
              </button>
              <button onClick={createDiscount} disabled={creating} className="btn-primary py-2 px-5 text-xs">
                <Save size={13} /> {creating ? "Mentés..." : "Mentés"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {discounts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-stone-400 text-sm">
          Még nincs kedvezmény beállítva.
        </div>
      ) : (
        discounts.map((d) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AnimatePresence mode="wait">
              {editingId === d.id && editForm ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-card p-6 border-2 border-forest-100"
                >
                  <h3 className="font-medium text-stone-800 mb-4">Szerkesztés</h3>
                  <DiscountFormFields form={editForm} setForm={setEditForm} />
                  <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-stone-100">
                    <button onClick={closeEdit} className="btn-ghost py-2 px-4 text-xs">
                      <X size={13} /> Mégse
                    </button>
                    <button onClick={saveEdit} disabled={saving === d.id} className="btn-primary py-2 px-5 text-xs">
                      <Save size={13} /> {saving === d.id ? "Mentés..." : "Mentés"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-card p-5"
                >
                  {/* Fejléc: név + százalék + gombok */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-terra-50 flex items-center justify-center shrink-0">
                        <Tag size={15} className="text-terra-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-stone-800 truncate">{d.name}</h3>
                          {d.isLastMinute && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <Zap size={10} /> Last minute
                            </span>
                          )}
                          {!d.isActive && (
                            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full shrink-0">Inaktív</span>
                          )}
                        </div>
                        <span className="font-serif text-lg text-terra-600">{d.discountPercent}% kedvezmény</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(d)}
                        className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 hover:bg-forest-100 flex items-center justify-center transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteDiscount(d.id)}
                        disabled={deleting === d.id}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Dátumok */}
                  <div className="space-y-0.5 pl-12">
                    {d.isLastMinute ? (
                      <p className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Zap size={11} className="shrink-0" />
                        Bejelentkezés az elkövetkező <strong>{d.lastMinuteDays} napon</strong> belül
                      </p>
                    ) : (
                      <p className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
                        <CalendarDays size={11} className="text-forest-500 shrink-0" />
                        <span className="text-stone-400 shrink-0">Szállás:</span>
                        <span className="whitespace-nowrap">{formatDate(d.stayFrom)} – {formatDate(d.stayTo)}</span>
                      </p>
                    )}
                    {!d.isLastMinute && (d.bookingFrom || d.bookingTo) && (
                      <p className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
                        <Calendar size={11} className="text-terra-400 shrink-0" />
                        <span className="text-stone-400 shrink-0">Foglalási ablak:</span>
                        <span className="whitespace-nowrap">
                          {d.bookingFrom ? formatDate(d.bookingFrom) : "—"}
                          {" – "}
                          {d.bookingTo ? formatDate(d.bookingTo) : "—"}
                        </span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ─── Date picker gomb + popup ────────────────────────────────
function DatePickerField({
  label,
  value,
  onChange,
  fromDate,
}: {
  label:     string;
  value:     string;
  onChange:  (v: string) => void;
  fromDate?: Date;
}) {
  const [open, setOpen] = useState(false);

  const selected = value ? parseISO(value) : undefined;
  const display  = selected
    ? format(selected, "yyyy. MMMM d.", { locale: hu })
    : "Kattints a kiválasztáshoz";

  return (
    <div className="relative">
      <label className="text-xs text-stone-400 uppercase tracking-wider block mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-left flex items-center gap-2 transition-colors ${
          selected
            ? "border-forest-300 bg-forest-50 text-forest-800"
            : "border-stone-200 bg-white text-stone-400 hover:border-stone-300"
        }`}
      >
        <Calendar size={14} className="shrink-0 opacity-60" />
        {display}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* háttér overlay a bezáráshoz */}
            <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-stone-200 p-4"
              style={{ zIndex: 9999, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(d) => {
                  onChange(d ? format(d, "yyyy-MM-dd") : "");
                  setOpen(false);
                }}
                fromDate={fromDate}
                locale={hu}
                modifiersStyles={{
                  selected: { backgroundColor: "#2347a8", color: "#f5f0e8", borderRadius: "8px" },
                  today:    { color: "#c17f4e", fontWeight: "700" },
                }}
              />
              {selected && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="w-full text-center text-xs text-stone-400 hover:text-red-500 mt-2 pt-2 border-t border-stone-100 transition-colors"
                >
                  Törlés
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Form mezők ──────────────────────────────────────────────
function DiscountFormFields({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const stayFromDate = form.stayFrom ? parseISO(form.stayFrom) : undefined;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-stone-400 uppercase tracking-wider block mb-1">Név</label>
          <input
            type="text"
            className="input-base"
            placeholder="pl. Last minute akció"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-stone-400 uppercase tracking-wider block mb-1">Kedvezmény (%)</label>
          <input
            type="number"
            className="input-base"
            min={1}
            max={100}
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-end pb-1 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-forest-700"
            />
            <span className="text-sm text-stone-600">Aktív</span>
          </label>
        </div>
      </div>

      {/* Last minute toggle */}
      <div className={`rounded-xl border-2 p-4 transition-colors ${form.isLastMinute ? "border-amber-200 bg-amber-50" : "border-stone-100 bg-stone-50"}`}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isLastMinute ?? false}
            onChange={(e) => setForm({ ...form, isLastMinute: e.target.checked })}
            className="w-4 h-4 accent-amber-600"
          />
          <div>
            <span className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" /> Last minute kedvezmény
            </span>
            <p className="text-xs text-stone-400 mt-0.5">Automatikusan érvényes ha a bejelentkezés az elkövetkező N napon belül van</p>
          </div>
        </label>
        {form.isLastMinute && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-stone-500 whitespace-nowrap">Napok száma:</label>
            <input
              type="number"
              className="input-base w-24"
              min={1}
              max={90}
              value={form.lastMinuteDays ?? 7}
              onChange={(e) => setForm({ ...form, lastMinuteDays: Number(e.target.value) })}
            />
            <span className="text-xs text-stone-400">nap</span>
          </div>
        )}
      </div>

      {/* Szállás időszak — csak ha nem last minute */}
      {!form.isLastMinute && (
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CalendarDays size={12} className="text-forest-500" />
            Szállás időszaka <span className="text-red-400">*</span>
          </p>
          <p className="text-xs text-stone-400 mb-3">Milyen dátumra szóló foglalásokra érvényes a kedvezmény?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePickerField
              label="Ettől"
              value={form.stayFrom}
              onChange={(v) => setForm({ ...form, stayFrom: v, stayTo: "" })}
            />
            <DatePickerField
              label="Eddig"
              value={form.stayTo}
              onChange={(v) => setForm({ ...form, stayTo: v })}
              fromDate={stayFromDate}
            />
          </div>
        </div>
      )}

      {/* Foglalási ablak — csak ha nem last minute */}
      {!form.isLastMinute && (
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Calendar size={12} className="text-terra-400" />
            Foglalási ablak <span className="text-stone-300">(opcionális)</span>
          </p>
          <p className="text-xs text-stone-400 mb-3">
            Ha meg van adva, csak ebben az időszakban foglalva érvényes a kedvezmény.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePickerField
              label="Foglalás ettől"
              value={form.bookingFrom ?? ""}
              onChange={(v) => setForm({ ...form, bookingFrom: v })}
            />
            <DatePickerField
              label="Foglalás eddig"
              value={form.bookingTo ?? ""}
              onChange={(v) => setForm({ ...form, bookingTo: v })}
              fromDate={form.bookingFrom ? parseISO(form.bookingFrom) : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
