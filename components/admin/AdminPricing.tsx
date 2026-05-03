"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Star, Pencil, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { PricingRule } from "@/types";
import SeasonForm from "@/components/admin/SeasonForm";

interface PolicyOption {
  id:   string;
  name: string;
}

interface ApartmentOption {
  id:   string;
  name: string;
  slug: string;
}

interface Props {
  rules:      PricingRule[];
  policies:   PolicyOption[];
  apartments: ApartmentOption[];
}

interface EditableRule {
  id:              string;
  name:            string;
  pricePerNight:   number;
  price3:          number;
  price4:          number;
  weekendPrice:    number;
  weekendPrice3:   number;
  weekendPrice4:   number;
  childPrice2to6:  number;
  childPrice6to12: number;
  dateFrom:        Date | null;
  dateTo:          Date | null;
  minNights:       number;
  minAdvanceDays:  number;
  isActive:        boolean;
  featured:        boolean;
  policyId:        string | null;
}

export default function AdminPricing({ rules: initialRules, policies, apartments }: Props) {
  const [rules, setRules]         = useState<PricingRule[]>(initialRules);
  const [saving, setSaving]       = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [creating, setCreating]   = useState(false);
  const [datePanel, setDatePanel] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRule, setEditRule]   = useState<EditableRule | null>(null);
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  // null = globális, string = apartmentId
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Az aktív tab szabályai: globális tab = apartmentId null, apartman tab = adott apartmentId
  const tabRules = useMemo(() =>
    rules.filter((r) => (activeTab === null ? !(r as any).apartmentId : (r as any).apartmentId === activeTab)),
    [rules, activeTab]
  );
  const baseRule    = useMemo(() => tabRules.find((r) => !r.dateFrom && !r.dateTo), [tabRules]);
  const basePrice   = baseRule?.pricePerNight ?? 45_000;
  const seasonRules = useMemo(() =>
    tabRules
      .filter((r) => r.dateFrom || r.dateTo)
      .sort((a, b) => {
        const aDate = a.dateFrom ? new Date(a.dateFrom as string).getTime() : 0;
        const bDate = b.dateFrom ? new Date(b.dateFrom as string).getTime() : 0;
        return aDate - bDate;
      }),
    [tabRules]
  );

  const EMPTY_NEW = {
    name:            "",
    pricePerNight:   basePrice,
    price3:          0,
    price4:          0,
    weekendPrice:    0,
    weekendPrice3:   0,
    weekendPrice4:   0,
    childPrice2to6:  0,
    childPrice6to12: 0,
    dateFrom:        null as Date | null,
    dateTo:          null as Date | null,
    minNights:       2,
    minAdvanceDays:  2,
    isActive:        true,
    featured:        false,
    policyId:        null as string | null,
  };

  const [newRule, setNewRule] = useState(EMPTY_NEW);

  const existingRanges = useMemo(() => {
    return tabRules
      .filter((r) => r.dateFrom && r.dateTo && r.isActive && r.id !== editingId)
      .map((r) => ({
        from:     new Date(r.dateFrom as string),
        to:       new Date(r.dateTo  as string),
        name:     r.name,
        priority: r.priority ?? 0,
      }));
  }, [seasonRules, editingId]);

  const disabledDaysNew  = useMemo(() =>
    existingRanges
      .filter((r) => newRule.featured ? r.priority >= 10 : true)
      .map((r) => ({ from: r.from, to: r.to })),
    [existingRanges, newRule.featured]
  );
  const disabledDaysEdit = useMemo(() =>
    existingRanges
      .filter((r) => editRule?.featured ? r.priority >= 10 : true)
      .map((r) => ({ from: r.from, to: r.to })),
    [existingRanges, editRule?.featured]
  );

  function checkOverlap(from: Date | null, to: Date | null, featured: boolean): string | null {
    if (!from || !to || !featured) return null;
    for (const r of existingRanges) {
      if (r.priority >= 10 && from < r.to && to > r.from) return r.name;
    }
    return null;
  }

  const overlapNew  = checkOverlap(newRule.dateFrom,      newRule.dateTo,      newRule.featured);
  const overlapEdit = checkOverlap(editRule?.dateFrom ?? null, editRule?.dateTo ?? null, editRule?.featured ?? false);

  const handleChange = (id: string, field: keyof PricingRule, value: any) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };



  const openEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setEditRule({
      id:              rule.id,
      name:            rule.name,
      pricePerNight:   rule.pricePerNight,
      price3:          (rule as any).price3          ?? 0,
      price4:          (rule as any).price4          ?? 0,
      weekendPrice:    (rule as any).weekendPrice    ?? 0,
      weekendPrice3:   (rule as any).weekendPrice3   ?? 0,
      weekendPrice4:   (rule as any).weekendPrice4   ?? 0,
      childPrice2to6:  (rule as any).childPrice2to6  ?? 0,
      childPrice6to12: (rule as any).childPrice6to12 ?? 0,
      dateFrom:        rule.dateFrom ? new Date(rule.dateFrom as string) : null,
      dateTo:          rule.dateTo   ? new Date(rule.dateTo   as string) : null,
      minNights:       rule.minNights,
      minAdvanceDays:  (rule as any).minAdvanceDays ?? 2,
      isActive:        rule.isActive,
      featured:        rule.priority >= 10,
      policyId:        (rule as any).policyId ?? null,
    });
    setShowNew(false);
  };

  const closeEdit = () => { setEditingId(null); setEditRule(null); setDatePanel(null); };

  const saveEditRule = async () => {
    if (!editRule) return;
    setSaving(editRule.id);
    try {
      const res = await fetch(`/api/admin/pricing/${editRule.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:            editRule.name,
          pricePerNight:   editRule.pricePerNight,
          price3:          editRule.price3,
          price4:          editRule.price4,
          weekendPrice:    editRule.weekendPrice,
          weekendPrice3:   editRule.weekendPrice3,
          weekendPrice4:   editRule.weekendPrice4,
          childPrice2to6:  editRule.childPrice2to6,
          childPrice6to12: editRule.childPrice6to12,
          dateFrom:        editRule.dateFrom ? format(editRule.dateFrom, "yyyy-MM-dd") : null,
          dateTo:          editRule.dateTo   ? format(editRule.dateTo,   "yyyy-MM-dd") : null,
          minNights:       editRule.minNights,
          minAdvanceDays:  editRule.minAdvanceDays,
          isActive:        editRule.isActive,
          priority:        editRule.featured ? 10 : 5,
          policyId:        editRule.policyId ?? null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) =>
          prev.map((r) => r.id === editRule.id ? {
            ...r,
            name:            editRule.name,
            pricePerNight:   editRule.pricePerNight,
            price3:          editRule.price3,
            price4:          editRule.price4,
            weekendPrice:    editRule.weekendPrice,
            weekendPrice3:   editRule.weekendPrice3,
            weekendPrice4:   editRule.weekendPrice4,
            childPrice2to6:  editRule.childPrice2to6,
            childPrice6to12: editRule.childPrice6to12,
            dateFrom:        editRule.dateFrom ? format(editRule.dateFrom, "yyyy-MM-dd") : null,
            dateTo:          editRule.dateTo   ? format(editRule.dateTo,   "yyyy-MM-dd") : null,
            minNights:       editRule.minNights,
            isActive:        editRule.isActive,
            priority:        editRule.featured ? 10 : 5,
          } : r)
        );
        closeEdit();
      } else {
        alert("Mentési hiba: " + data.error);
      }
    } finally {
      setSaving(null);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Biztosan törli ezt a szezont?")) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setRules((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const createRule = async () => {
    if (!newRule.name || !newRule.pricePerNight) {
      alert("A név és az ár megadása kötelező!");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...newRule,
          priority:       newRule.featured ? 10 : 5,
          dateFrom:       newRule.dateFrom ? format(newRule.dateFrom, "yyyy-MM-dd") : null,
          dateTo:         newRule.dateTo   ? format(newRule.dateTo,   "yyyy-MM-dd") : null,
          minAdvanceDays: newRule.minAdvanceDays,
          policyId:       newRule.policyId ?? null,
          apartmentId:    activeTab ?? null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) => [...prev, data.data]);
        setNewRule(EMPTY_NEW);
        setShowNew(false);
        setDatePanel(null);
      } else {
        alert("Mentési hiba: " + data.error);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Apartman fülek */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab(null); setShowNew(false); setEditingId(null); setEditRule(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === null
              ? "bg-forest-600 text-white shadow-sm"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          Globális (alap)
        </button>
        {apartments.map((apt) => (
          <button
            key={apt.id}
            onClick={() => { setActiveTab(apt.id); setShowNew(false); setEditingId(null); setEditRule(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === apt.id
                ? "bg-forest-600 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {apt.name}
          </button>
        ))}
      </div>

      {activeTab !== null && (
        <p className="text-xs text-stone-400 -mt-1">
          Az itt megadott szabályok felülírják a globális árakat ehhez az apartmanhoz.
          Ha nincs apartman-specifikus szabály, a globális ár érvényes.
        </p>
      )}

      {/* Szezonok fejléc */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-stone-500">{seasonRules.length} szezon</p>
        <button
          onClick={() => { setNewRule(EMPTY_NEW); setShowNew(true); setEditingId(null); setEditRule(null); }}
          className="btn-primary py-2.5 px-5 text-xs"
        >
          <Plus size={14} /> Új szezon
        </button>
      </div>

      {/* Új szezon form */}
      <AnimatePresence>
        {showNew && (
          <SeasonForm
            rule={newRule}
            setRule={setNewRule}
            onSave={createRule}
            onCancel={() => { setShowNew(false); setDatePanel(null); }}
            isSaving={creating}
            isNew={true}
            disabledDays={disabledDaysNew}
            overlapError={overlapNew}
            panelPrefix="new"
            basePrice={basePrice}
            existingRanges={existingRanges}
            datePanel={datePanel}
            setDatePanel={setDatePanel}
            policies={policies}
          />
        )}
      </AnimatePresence>

      {/* Panel bezárás */}
      {datePanel && (
        <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setDatePanel(null)} />
      )}

      {/* Meglévő szezonok */}
      {seasonRules.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-stone-400 text-sm">
          Még nincs szezon. Az alap ár érvényes minden napra.
        </div>
      ) : (
        seasonRules.map((rule) => (
          <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AnimatePresence mode="wait">
              {editingId === rule.id && editRule ? (
                <SeasonForm
                  key="edit-form"
                  rule={editRule}
                  setRule={(r) => setEditRule(r as EditableRule)}
                  onSave={saveEditRule}
                  onCancel={closeEdit}
                  isSaving={saving === rule.id}
                  isNew={false}
                  disabledDays={disabledDaysEdit}
                  overlapError={overlapEdit}
                  panelPrefix={rule.id}
                  basePrice={basePrice}
                  existingRanges={existingRanges}
                  datePanel={datePanel}
                  setDatePanel={setDatePanel}
                  policies={policies}
                />
              ) : (
                <motion.div
                  key="card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-card p-6"
                >
                  {/* Fejléc – kattintható */}
                  <button
                    type="button"
                    onClick={() => setOpenCards((prev) => {
                      const next = new Set(prev);
                      next.has(rule.id) ? next.delete(rule.id) : next.add(rule.id);
                      return next;
                    })}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {rule.priority >= 10 && <Star size={13} className="text-terra-400 fill-terra-400" />}
                          <h3 className="font-medium text-stone-800">{rule.name}</h3>
                          {!rule.isActive && (
                            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Inaktív</span>
                          )}
                          {rule.priority >= 10 && (
                            <span className="text-xs bg-terra-100 text-terra-600 px-2 py-0.5 rounded-full">Kiemelt</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400">
                          {rule.dateFrom && rule.dateTo
                            ? `${new Date(rule.dateFrom as string).toLocaleDateString("hu-HU")} – ${new Date(rule.dateTo as string).toLocaleDateString("hu-HU")}`
                            : "Dátum nélkül"
                          }
                          {" · "}Min. {rule.minNights} éj
                          {(rule as any).policyId && policies.find((p) => p.id === (rule as any).policyId) && (
                            <span className="ml-2 bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full text-[10px]">
                              {policies.find((p) => p.id === (rule as any).policyId)!.name}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="sm:text-right">
                          <span className="font-serif text-xl text-forest-900">
                            {formatCurrency(rule.pricePerNight)}
                          </span>
                          <span className="text-xs text-stone-400">/éj</span>
                          {(rule as any).weekendPrice > 0 && (
                            <p className="text-xs text-terra-400 mt-0.5">
                              Hétvége: {formatCurrency((rule as any).weekendPrice)}/éj
                            </p>
                          )}
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-stone-400 transition-transform duration-200 ${openCards.has(rule.id) ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Lenyitható részletek */}
                  <AnimatePresence>
                    {openCards.has(rule.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-stone-100 mt-4 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div><p className="text-xs text-stone-400 mb-0.5">1–2 fő/éj</p><p className="font-medium text-stone-700">{formatCurrency(rule.pricePerNight)}</p></div>
                          {(rule as any).price3 > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">3 fő/éj</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).price3)}</p></div>
                          )}
                          {(rule as any).price4 > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">4 fő/éj</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).price4)}</p></div>
                          )}
                          {(rule as any).weekendPrice > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">Hétvége 1–2 fő</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).weekendPrice)}</p></div>
                          )}
                          {(rule as any).weekendPrice3 > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">Hétvége 3 fő</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).weekendPrice3)}</p></div>
                          )}
                          {(rule as any).weekendPrice4 > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">Hétvége 4 fő</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).weekendPrice4)}</p></div>
                          )}
                          {(rule as any).childPrice2to6 > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">Gyermek 2–6 év</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).childPrice2to6)}/éj</p></div>
                          )}
                          {(rule as any).childPrice6to12 > 0 && (
                            <div><p className="text-xs text-stone-400 mb-0.5">Gyermek 6–12 év</p><p className="font-medium text-stone-700">{formatCurrency((rule as any).childPrice6to12)}/éj</p></div>
                          )}
                          <div><p className="text-xs text-stone-400 mb-0.5">Min. éjszaka</p><p className="font-medium text-stone-700">{rule.minNights} éj</p></div>
                          <div><p className="text-xs text-stone-400 mb-0.5">Min. előfoglalás</p><p className="font-medium text-stone-700">{(rule as any).minAdvanceDays ?? 2} nap</p></div>
                          {(rule as any).policyId && policies.find((p) => p.id === (rule as any).policyId) && (
                            <div><p className="text-xs text-stone-400 mb-0.5">Szabály</p><p className="font-medium text-stone-700">{policies.find((p) => p.id === (rule as any).policyId)!.name}</p></div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(rule); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-50 text-forest-700 hover:bg-forest-100 text-xs font-medium transition-colors"
                          >
                            <Pencil size={12} /> Szerkesztés
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                            disabled={deleting === rule.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium transition-colors"
                          >
                            <Trash2 size={12} /> Törlés
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  );
}