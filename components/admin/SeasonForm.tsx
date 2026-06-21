"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Save, Plus, X, Calendar, Star } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format }    from "date-fns";
import { hu }        from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import "react-day-picker/dist/style.css";

interface SeasonFormRule {
  name:            string;
  pricePerNight:   number;
  price3:          number;
  price4:          number;
  price5:          number;
  price6:          number;
  weekendPrice:    number;
  weekendPrice3:   number;
  weekendPrice4:   number;
  weekendPrice5:   number;
  weekendPrice6:   number;
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

interface PolicyOption {
  id:   string;
  name: string;
}

interface Props {
  rule:          SeasonFormRule;
  setRule:       (r: SeasonFormRule) => void;
  onSave:        () => void;
  onCancel:      () => void;
  isSaving:      boolean;
  isNew:         boolean;
  disabledDays:  any[];
  overlapError:  string | null;
  panelPrefix:   string;
  basePrice:     number;
  existingRanges: { from: Date; to: Date; name: string; priority: number }[];
  datePanel:     string | null;
  setDatePanel:  (p: string | null) => void;
  policies:      PolicyOption[];
  maxGuests:     number;
}

export default function SeasonForm({
  rule, setRule, onSave, onCancel,
  isSaving, isNew, disabledDays, overlapError,
  panelPrefix, basePrice, existingRanges,
  datePanel, setDatePanel, policies, maxGuests,
}: Props) {
  const formatBtn = (d: Date | null) =>
    d ? format(d, "yyyy. MMMM d.", { locale: hu }) : "Kattints a kiválasztáshoz";

  const displayRanges = rule.featured
    ? existingRanges.filter((r) => r.priority >= 10)
    : existingRanges;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-forest-900 rounded-2xl p-6 text-cream"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg text-cream">
          {isNew ? "Új szezon" : `Szerkesztés: ${rule.name}`}
        </h3>
        <button onClick={onCancel}>
          <X size={18} className="text-cream/60 hover:text-cream" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Név */}
        <div className="md:col-span-2">
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            Szezon neve *
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream placeholder:text-cream/40 text-sm focus:outline-none focus:border-white/50"
            placeholder="pl. Nyári főszezon, Karácsonyi időszak..."
            value={rule.name}
            onChange={(e) => setRule({ ...rule, name: e.target.value })}
          />
        </div>

        {/* Kiemelt */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                rule.featured
                  ? "bg-terra-400 border-terra-400"
                  : "bg-white/10 border-white/30 group-hover:border-white/50"
              }`}
              onClick={() => setRule({ ...rule, featured: !rule.featured })}
            >
              {rule.featured && <Star size={11} className="text-white fill-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-cream flex items-center gap-1.5">
                <Star size={13} className="text-terra-300" />
                Kiemelt időszak
              </p>
              <p className="text-xs text-cream/50">
                Pl. karácsony, húsvét – felülírja az átfedő szezonokat
              </p>
            </div>
          </label>
        </div>

        {/* Dátumtól */}
        <div className="relative">
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            <Calendar size={11} className="inline mr-1" />Kezdő dátum
          </label>
          <button
            type="button"
            onClick={() => setDatePanel(datePanel === `${panelPrefix}-from` ? null : `${panelPrefix}-from`)}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-left transition-all ${
              rule.dateFrom
                ? "bg-white/15 border-white/50 text-cream"
                : "bg-white/10 border-white/20 text-cream/50"
            }`}
          >
            <Calendar size={13} className="inline mr-2 opacity-60" />
            {formatBtn(rule.dateFrom)}
          </button>

          <AnimatePresence>
            {datePanel === `${panelPrefix}-from` && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-stone-200 p-4"
                style={{ zIndex: 9999, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                  Szezon kezdete
                </p>
                {displayRanges.length > 0 && (
                  <p className="text-xs text-terra-500 mb-2">
                    {rule.featured ? "🔒 Áthúzott napok már kiemelt időszakhoz tartoznak" : "🔒 Áthúzott napok már más szezonhoz tartoznak"}
                  </p>
                )}
                <DayPicker
                  mode="single"
                  selected={rule.dateFrom ?? undefined}
                  defaultMonth={rule.dateFrom ?? new Date()}
                  onSelect={(d) => {
                    setRule({ ...rule, dateFrom: d ?? null, dateTo: null });
                    setDatePanel(null);
                  }}
                  disabled={disabledDays}
                  locale={hu}
                  modifiers={{ existing: displayRanges.map((r) => ({ from: r.from, to: r.to })) }}
                  modifiersStyles={{
                    selected: { backgroundColor: "#5c5038", color: "#f5f0e8", borderRadius: "8px" },
                    today:    { color: "#c17f4e", fontWeight: "700" },
                    existing: { backgroundColor: "#f5e6d8", color: "#a86435", textDecoration: "line-through" },
                    disabled: { opacity: 0.3, cursor: "not-allowed" },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dátumig */}
        <div className="relative">
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            <Calendar size={11} className="inline mr-1" />Záró dátum
          </label>
          <button
            type="button"
            onClick={() => setDatePanel(datePanel === `${panelPrefix}-to` ? null : `${panelPrefix}-to`)}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-left transition-all ${
              rule.dateTo
                ? "bg-white/15 border-white/50 text-cream"
                : "bg-white/10 border-white/20 text-cream/50"
            }`}
          >
            <Calendar size={13} className="inline mr-2 opacity-60" />
            {formatBtn(rule.dateTo)}
          </button>

          <AnimatePresence>
            {datePanel === `${panelPrefix}-to` && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-stone-200 p-4"
                style={{ zIndex: 9999, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                  Szezon vége
                </p>
                {displayRanges.length > 0 && (
                  <p className="text-xs text-terra-500 mb-2">
                    {rule.featured ? "🔒 Áthúzott napok már kiemelt időszakhoz tartoznak" : "🔒 Áthúzott napok már más szezonhoz tartoznak"}
                  </p>
                )}
                <DayPicker
                  mode="single"
                  selected={rule.dateTo ?? undefined}
                  defaultMonth={rule.dateTo ?? rule.dateFrom ?? new Date()}
                  onSelect={(d) => {
                    setRule({ ...rule, dateTo: d ?? null });
                    setDatePanel(null);
                  }}
                  fromDate={rule.dateFrom ?? undefined}
                  disabled={disabledDays}
                  locale={hu}
                  modifiers={{ existing: displayRanges.map((r) => ({ from: r.from, to: r.to })) }}
                  modifiersStyles={{
                    selected: { backgroundColor: "#5c5038", color: "#f5f0e8", borderRadius: "8px" },
                    today:    { color: "#c17f4e", fontWeight: "700" },
                    existing: { backgroundColor: "#f5e6d8", color: "#a86435", textDecoration: "line-through" },
                    disabled: { opacity: 0.3, cursor: "not-allowed" },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Árinfó */}
        <div className="md:col-span-2 bg-white/5 rounded-xl p-3 text-xs text-cream/60 flex items-center gap-2">
          <Star size={12} className={rule.featured ? "text-terra-300" : "text-cream/30"} />
          {rule.featured
            ? "Kiemelt – felülírja az átfedő szezonokat"
            : "Normál – felülírja az alap árat, de kiemelt felülírhatja"
          }
        </div>

        {/* Árak szekció fejléc */}
        <div className="md:col-span-2">
          <p className="text-xs text-cream/60 uppercase tracking-wider mb-1 pt-2 border-t border-white/10">
            Hétköznapi árak (Ft/éj)
          </p>
        </div>

        {/* Hétköznapi 1-2 fő */}
        <div>
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            1–2 fő *
          </label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
            value={rule.pricePerNight || ""}
            onChange={(e) => setRule({ ...rule, pricePerNight: Number(e.target.value) })}
          />
          <p className="text-xs text-cream/40 mt-1">Alap ár: {formatCurrency(basePrice)}</p>
        </div>

        {/* Hétköznapi 3 fő */}
        {maxGuests >= 3 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              3 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 1–2 fő ár"
              value={rule.price3 || ""}
              onChange={(e) => setRule({ ...rule, price3: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétköznapi 4 fő */}
        {maxGuests >= 4 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              4 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 3 fő ár"
              value={rule.price4 || ""}
              onChange={(e) => setRule({ ...rule, price4: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétköznapi 5 fő */}
        {maxGuests >= 5 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              5 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 4 fő ár"
              value={rule.price5 || ""}
              onChange={(e) => setRule({ ...rule, price5: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétköznapi 6 fő */}
        {maxGuests >= 6 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              6 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 5 fő ár"
              value={rule.price6 || ""}
              onChange={(e) => setRule({ ...rule, price6: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétvégi árak fejléc */}
        <div className="md:col-span-2">
          <p className="text-xs text-cream/60 uppercase tracking-wider mb-1 pt-2 border-t border-white/10">
            {"H\u00E9tv\u00E9gi \u00E1rak (P\u2013Szo, Ft/\u00E9j)"}
          </p>
        </div>

        {/* Hétvégi 1-2 fő */}
        <div>
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            1–2 fő
          </label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
            placeholder="Ha üres = hétköznapi"
            value={rule.weekendPrice || ""}
            onChange={(e) => setRule({ ...rule, weekendPrice: Number(e.target.value) })}
          />
        </div>

        {/* Hétvégi 3 fő */}
        {maxGuests >= 3 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              3 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 3 fő hétköznapi"
              value={rule.weekendPrice3 || ""}
              onChange={(e) => setRule({ ...rule, weekendPrice3: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétvégi 4 fő */}
        {maxGuests >= 4 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              4 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 4 fő hétköznapi"
              value={rule.weekendPrice4 || ""}
              onChange={(e) => setRule({ ...rule, weekendPrice4: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétvégi 5 fő */}
        {maxGuests >= 5 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              5 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 5 fő hétköznapi"
              value={rule.weekendPrice5 || ""}
              onChange={(e) => setRule({ ...rule, weekendPrice5: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Hétvégi 6 fő */}
        {maxGuests >= 6 && (
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              6 fő
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              placeholder="Ha üres = 6 fő hétköznapi"
              value={rule.weekendPrice6 || ""}
              onChange={(e) => setRule({ ...rule, weekendPrice6: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Min éjszaka */}
        <div>
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            Minimum éjszaka
          </label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
            value={rule.minNights}
            onChange={(e) => setRule({ ...rule, minNights: Number(e.target.value) })}
          />
        </div>

        {/* Min előfoglalás */}
        <div>
          <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
            Min. előfoglalás (nap)
          </label>
          <input
            type="number"
            min={0}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
            value={rule.minAdvanceDays}
            onChange={(e) => setRule({ ...rule, minAdvanceDays: Math.max(0, Number(e.target.value)) })}
          />
          <p className="text-xs text-cream/40 mt-1">
            {rule.minAdvanceDays === 0 ? "Azonnal foglalható" : `Legalább ${rule.minAdvanceDays} nappal előre`}
          </p>
        </div>


        {/* Előleg / lemondási szabály */}
        {policies.length > 0 && (
          <div className="md:col-span-2">
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              Előleg és lemondási szabály
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream text-sm focus:outline-none focus:border-white/50"
              value={rule.policyId ?? ""}
              onChange={(e) => setRule({ ...rule, policyId: e.target.value || null })}
            >
              <option value="" className="text-stone-800">— Nincs megadva —</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id} className="text-stone-800">{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Aktív (csak szerkesztésnél) */}
        {!isNew && (
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-cream/70 cursor-pointer">
              <input
                type="checkbox"
                checked={rule.isActive}
                onChange={(e) => setRule({ ...rule, isActive: e.target.checked })}
                className="accent-forest-500"
              />
              Aktív
            </label>
          </div>
        )}

        {/* Átfedés hiba */}
        {overlapError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 flex items-start gap-2 bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-xl"
          >
            <span className="shrink-0">⚠️</span>
            <span>
              Ez az időszak átfedi a(z) <strong>"{overlapError}"</strong> szezont!
              Jelöld be a <strong>Kiemelt</strong> opciót ha felül szeretnéd írni.
            </span>
          </motion.div>
        )}

      </div>

      {/* Gombok */}
      <div className="flex gap-3 pt-2 border-t border-white/10">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-full border border-white/30 text-cream text-sm hover:bg-white/10 transition-colors"
        >
          Mégse
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !!overlapError}
          className="btn-accent flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {isSaving ? "Mentés..." : isNew ? "Szezon hozzáadása" : "Változások mentése"}
        </button>
      </div>
    </motion.div>
  );
}