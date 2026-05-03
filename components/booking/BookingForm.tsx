"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, User, Mail, Phone, MessageSquare, MapPin,
  Moon, CalendarCheck, Check, ImageOff, Plus, Minus, CreditCard, Banknote, Building2,
} from "lucide-react";
import { formatDateHu, formatCurrency } from "@/lib/utils";
import type { BookingData, SelectedService } from "./BookingPage";

interface ExtraService {
  id: string;
  name: string;
  description: string;
  pricingType: "PER_NIGHT" | "PER_BOOKING";
  price: number | null;
  imageUrl: string | null;
}

interface Props {
  bookingData: BookingData;
  onBack: () => void;
  onSuccess: (bookingId: string, finalTotal: number) => void;
}

export default function BookingForm({ bookingData, onBack, onSuccess }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "", paymentMethod: "transfer", szepType: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ExtraService[]>([]);
  const [selected, setSelected] = useState<SelectedService[]>([]);

  useEffect(() => {
    fetch("/api/extra-services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data); })
      .catch(() => { });
  }, []);

  const calcTotal = (svc: { price: number | null; pricingType: string }, quantity: number, nights: number) => {
    if (svc.price == null) return 0;
    return svc.pricingType === "PER_NIGHT"
      ? svc.price * quantity * nights
      : svc.price * quantity;
  };

  const toggleService = (svc: ExtraService) => {
    const already = selected.find((s) => s.id === svc.id);
    if (already) {
      setSelected((prev) => prev.filter((s) => s.id !== svc.id));
    } else {
      const nights = svc.pricingType === "PER_NIGHT" ? bookingData.nights : 1;
      const quantity = 1;
      setSelected((prev) => [...prev, {
        id: svc.id,
        name: svc.name,
        pricingType: svc.pricingType,
        price: svc.price,
        quantity,
        nights,
        total: calcTotal(svc, quantity, nights),
      }]);
    }
  };

  const updateSelected = (id: string, patch: { quantity?: number; nights?: number }) => {
    setSelected((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const quantity = patch.quantity ?? s.quantity;
      const nights = patch.nights ?? s.nights;
      return { ...s, quantity, nights, total: calcTotal(s, quantity, nights) };
    }));
  };

  const extrasTotal = selected.reduce((sum, s) => sum + s.total, 0);
  const grandTotal = bookingData.totalPrice + extrasTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.name,
          guestEmail: form.email,
          guestPhone: form.phone,
          guestAddress: form.address,
          numberOfGuests: bookingData.guests,
          numberOfAdults: bookingData.adults,
          numberOfTeens: bookingData.teens,
          numberOfBabies: bookingData.babies,
          numberOfChildren2to6: bookingData.children2to6,
          numberOfChildren6to12: bookingData.children6to12,
          notes: form.notes || null,
          paymentMethod: form.paymentMethod === "szep" && form.szepType
            ? `szep-${form.szepType}`
            : form.paymentMethod,
          checkIn: format(bookingData.checkIn, "yyyy-MM-dd"),
          checkOut: format(bookingData.checkOut, "yyyy-MM-dd"),
          basePrice: bookingData.basePrice,
          childPrice2to6: bookingData.childPrice2to6,
          childPrice6to12: bookingData.childPrice6to12,
          guestSurcharge: 0,
          cleaningFee: 0,
          touristTax: bookingData.touristTax,
          totalPrice: grandTotal,
          discountPercent: bookingData.discountPercent,
          discountAmount: bookingData.discountAmount,
          extraServices: selected,
          extraServicesTotal: extrasTotal,
          apartmentGuests: bookingData.apartmentGuests.map(a => ({
            id:            a.id,
            adults:        a.adults,
            teens:         a.teens,
            babies:        a.babies,
            children2to6:  a.children2to6,
            children6to12: a.children6to12,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Ismeretlen hiba");
      onSuccess(data.data.id, grandTotal);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt. Kérjük próbálja újra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

        {/* Személyes adatok */}
        <div className="bg-white rounded-3xl shadow-card p-8 space-y-5">
          <h2 className="font-serif text-xl text-forest-900">Adja meg adatait</h2>

          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
              <User size={12} className="inline mr-1" />Teljes név *
            </label>
            <input
              className="input-base"
              placeholder="Kovács Anna"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
                <Mail size={12} className="inline mr-1" />E-mail *
              </label>
              <input
                className="input-base"
                type="email"
                placeholder="email@example.com"
                required
                maxLength={200}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
                <Phone size={12} className="inline mr-1" />Telefon *
              </label>
              <input
                className="input-base"
                placeholder="+36 30 123 4567"
                required
                maxLength={30}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
              <MapPin size={12} className="inline mr-1" />Lakcím *
            </label>
            <input
              className="input-base"
              placeholder="1234 Budapest, Példa utca 1."
              required
              maxLength={200}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
              <MessageSquare size={12} className="inline mr-1" />Megjegyzés
            </label>
            <textarea
              className="input-base resize-none"
              rows={4}
              placeholder="Pl. késői érkezés, különleges kérés, babakiságy igény..."
              maxLength={1000}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Fizetési mód */}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-3">
              <CreditCard size={12} className="inline mr-1" />Fizetési mód *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "transfer", label: "Átutalás", Icon: Building2 },
                { value: "szep", label: "SZÉP kártya", Icon: CreditCard },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: value, szepType: value === "szep" ? (form.szepType || "otp") : "" })}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all text-sm font-medium ${form.paymentMethod === value
                    ? "border-forest-600 bg-forest-50 text-forest-800"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                >
                  <Icon size={20} className={form.paymentMethod === value ? "text-forest-600" : "text-stone-400"} />
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">Ez az előleg fizetési módjára vonatkozik. A maradék összeg fizetése a helyszínen készpénzzel/átutalással/OTP Szép kártyával/KH Szép kártyával/MBH Szép kártyával lehetséges.</p>

            {/* SZÉP kártya bank választó */}
            {form.paymentMethod === "szep" && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { value: "otp", label: "OTP" },
                  { value: "mbh", label: "MBH" },
                  { value: "kh", label: "K&H" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, szepType: value })}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all ${form.szepType === value
                      ? "border-forest-600 bg-forest-50 text-forest-800"
                      : "border-stone-200 text-stone-500 hover:border-stone-300"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Extra szolgáltatások */}
        {services.length > 0 && (
          <div className="bg-white rounded-3xl shadow-card p-8">
            <h2 className="font-serif text-xl text-forest-900 mb-1">Extra szolgáltatások</h2>
            <p className="text-sm text-stone-400 mb-6">Opcionális kiegészítők a tartózkodáshoz</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => {
                const sel = selected.find((s) => s.id === svc.id);
                const isSelected = !!sel;

                return (
                  <div
                    key={svc.id}
                    className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 ${isSelected
                      ? "border-forest-500 shadow-md"
                      : "border-stone-200"
                      }`}
                  >
                    {/* Kép — kattintható toggle */}
                    <button
                      type="button"
                      onClick={() => toggleService(svc)}
                      className="w-full text-left"
                    >
                      {svc.imageUrl ? (
                        <div className="relative h-32 w-full">
                          <Image src={svc.imageUrl} alt={svc.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      ) : (
                        <div className="h-20 w-full bg-stone-100 flex items-center justify-center">
                          <ImageOff size={20} className="text-stone-300" />
                        </div>
                      )}
                    </button>

                    {/* Pipa */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center shadow-md pointer-events-none">
                        <Check size={13} className="text-white" />
                      </div>
                    )}

                    {/* Tartalom */}
                    <div className="p-4">
                      <button type="button" onClick={() => toggleService(svc)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-stone-800 text-sm leading-tight">{svc.name}</p>
                          <span className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${svc.pricingType === "PER_NIGHT"
                            ? "bg-forest-50 text-forest-700"
                            : "bg-terra-50 text-terra-700"
                            }`}>
                            {svc.pricingType === "PER_NIGHT" ? <Moon size={9} /> : <CalendarCheck size={9} />}
                            {svc.pricingType === "PER_NIGHT" ? "/éj" : "/fog."}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{svc.description}</p>
                        <p className="text-sm font-semibold text-forest-700 mt-2.5">
                          {svc.price != null ? formatCurrency(svc.price) : "Ár érdeklődésre"}
                          {svc.price != null && (
                            <span className="text-xs font-normal text-stone-400 ml-1">
                              {svc.pricingType === "PER_NIGHT" ? "/éj/db" : "/db"}
                            </span>
                          )}
                        </p>
                      </button>

                      {/* Léptető — csak PER_NIGHT és kiválasztva */}
                      {isSelected && sel && svc.pricingType === "PER_NIGHT" && (
                        <div className="mt-3 pt-3 border-t border-stone-100 space-y-2" onClick={(e) => e.stopPropagation()}>

                          {/* Darabszám */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-500">Darabszám</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateSelected(svc.id, { quantity: Math.max(1, sel.quantity - 1) })}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-stone-800">{sel.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateSelected(svc.id, { quantity: sel.quantity + 1 })}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Éjszakák száma */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-500">Éjszakák száma</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateSelected(svc.id, { nights: Math.max(1, sel.nights - 1) })}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-stone-800">{sel.nights}</span>
                              <button
                                type="button"
                                onClick={() => updateSelected(svc.id, { nights: Math.min(bookingData.nights, sel.nights + 1) })}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Részösszeg */}
                          {svc.price != null && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs text-stone-400">
                                {formatCurrency(svc.price)} × {sel.quantity} db × {sel.nights} éj
                              </span>
                              <span className="text-sm font-bold text-forest-700">{formatCurrency(sel.total)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobil összefoglaló – csak mobilon látszik */}
        <div className="lg:hidden bg-forest-900 rounded-3xl shadow-card p-5 text-cream space-y-2.5 text-sm">
          <h3 className="font-serif text-lg text-cream mb-3">Foglalás összefoglalója</h3>
          <div className="flex justify-between">
            <span className="text-cream/60">Érkezés</span>
            <span>{formatDateHu(bookingData.checkIn)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/60">Távozás</span>
            <span>{formatDateHu(bookingData.checkOut)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/60">Éjszakák</span>
            <span>{bookingData.nights} éj</span>
          </div>
          {bookingData.weekdayNights > 0 && (
            <div className="flex justify-between">
              <span className="text-cream/60">{bookingData.weekendNights > 0 ? "Szállás – hétköznap" : "Szállás"}</span>
              <span>{formatCurrency(bookingData.weekdayNights * bookingData.weekdayRate)}</span>
            </div>
          )}
          {bookingData.weekendNights > 0 && (
            <div className="flex justify-between">
              <span className="text-cream/60">{bookingData.weekdayNights > 0 ? "Szállás – hétvége" : "Szállás"}</span>
              <span>{formatCurrency(bookingData.weekendNights * bookingData.weekendRate)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-cream/60">IFA</span>
            <span>{formatCurrency(bookingData.touristTax)}</span>
          </div>
          {bookingData.discountAmount > 0 && (
            <div className="flex justify-between text-green-300">
              <span>Kedvezmény ({bookingData.discountPercent}%)</span>
              <span>−{formatCurrency(bookingData.discountAmount)}</span>
            </div>
          )}
          {selected.length > 0 && selected.map((s) => (
            <div key={s.id} className="flex justify-between">
              <span className="text-cream/60">{s.name}</span>
              <span>{formatCurrency(s.total)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="font-medium">Végösszeg</span>
            <span className="font-serif text-xl">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* ÁSZF + Beküldés */}
        <div className="bg-white rounded-3xl shadow-card p-8 space-y-5">
          <div className="flex items-start gap-3">
            <input type="checkbox" id="aszf" required className="mt-1 accent-forest-900" />
            <label htmlFor="aszf" className="text-sm text-stone-500 leading-relaxed">
              Elfogadom az{" "}
              <a href="/aszf" target="_blank" className="text-forest-700 underline hover:text-forest-900">
                Általános Szerződési Feltételeket
              </a>{" "}
              és az{" "}
              <a href="/adatvedelem" target="_blank" className="text-forest-700 underline hover:text-forest-900">
                Adatvédelmi tájékoztatót
              </a>.
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={onBack} className="btn-secondary flex items-center justify-center gap-2">
              <ArrowLeft size={15} /> Vissza
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Küldés...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Foglalás elküldése <ArrowRight size={15} />
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Összefoglaló – csak desktopon */}
      <div className="hidden lg:block bg-forest-900 rounded-3xl shadow-card p-6 text-cream h-fit sticky top-8">
        <h3 className="font-serif text-xl mb-6 text-cream">Foglalás összefoglalója</h3>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-cream/60">Érkezés</span>
            <span>{formatDateHu(bookingData.checkIn)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/60">Távozás</span>
            <span>{formatDateHu(bookingData.checkOut)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/60">Éjszakák</span>
            <span>{bookingData.nights} éj</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/60">Vendégek</span>
            <span className="text-right text-sm">
              {bookingData.adults} felnőtt (18+)
              {bookingData.teens > 0 && `, ${bookingData.teens} fiatal (12–18)`}
              {bookingData.children6to12 > 0 && `, ${bookingData.children6to12} gyerek (6–12)`}
              {bookingData.children2to6 > 0 && `, ${bookingData.children2to6} kisgyerek (2–6)`}
              {bookingData.babies > 0 && `, ${bookingData.babies} baba`}
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2.5 text-sm mb-6">
          {/* Szállás – hétköznap */}
          {bookingData.weekdayNights > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cream/80">
                  {bookingData.weekendNights > 0 ? "Szállás – hétköznap" : `Szállás (${bookingData.nights} éj)`}
                </p>
                <p className="text-xs text-cream/40 mt-0.5">
                  {bookingData.weekdayNights} éj × {formatCurrency(bookingData.weekdayRate)}/éj
                </p>
              </div>
              <span className="shrink-0 ml-3">{formatCurrency(bookingData.weekdayNights * bookingData.weekdayRate)}</span>
            </div>
          )}

          {/* Szállás – hétvége */}
          {bookingData.weekendNights > 0 && bookingData.weekendRate !== bookingData.weekdayRate && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cream/80">
                  {bookingData.weekdayNights > 0 ? "Szállás – hétvége" : `Szállás (${bookingData.nights} éj)`}
                </p>
                <p className="text-xs text-cream/40 mt-0.5">
                  {bookingData.weekendNights} éj × {formatCurrency(bookingData.weekendRate)}/éj
                </p>
              </div>
              <span className="shrink-0 ml-3">{formatCurrency(bookingData.weekendNights * bookingData.weekendRate)}</span>
            </div>
          )}

          {/* Szállás – egységes hétvégi ár */}
          {bookingData.weekendNights > 0 && bookingData.weekendRate === bookingData.weekdayRate && bookingData.weekdayNights === 0 && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cream/80">Szállás ({bookingData.nights} éj)</p>
                <p className="text-xs text-cream/40 mt-0.5">
                  {bookingData.nights} éj × {formatCurrency(bookingData.weekdayRate)}/éj
                </p>
              </div>
              <span className="shrink-0 ml-3">{formatCurrency(bookingData.basePrice)}</span>
            </div>
          )}

          {/* Kisgyerek 2–6 */}
          {bookingData.children2to6 > 0 && bookingData.childPrice2to6 > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cream/80">Kisgyerek (2–6 év)</p>
                <p className="text-xs text-cream/40 mt-0.5">
                  {bookingData.children2to6} fő × {bookingData.nights} éj × {formatCurrency(bookingData.childPrice2to6)}/éj
                </p>
              </div>
              <span className="shrink-0 ml-3">{formatCurrency(bookingData.childPrice2to6 * bookingData.children2to6 * bookingData.nights)}</span>
            </div>
          )}

          {/* Gyerek 6–12 */}
          {bookingData.children6to12 > 0 && bookingData.childPrice6to12 > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cream/80">Gyerek (6–12 év)</p>
                <p className="text-xs text-cream/40 mt-0.5">
                  {bookingData.children6to12} fő × {bookingData.nights} éj × {formatCurrency(bookingData.childPrice6to12)}/éj
                </p>
              </div>
              <span className="shrink-0 ml-3">{formatCurrency(bookingData.childPrice6to12 * bookingData.children6to12 * bookingData.nights)}</span>
            </div>
          )}

          {/* IFA */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cream/80">IFA</p>
              <p className="text-xs text-cream/40 mt-0.5">
                {bookingData.adults} felnőtt × {bookingData.nights} éj × 450 Ft/éj
              </p>
            </div>
            <span className="shrink-0 ml-3">{formatCurrency(bookingData.touristTax)}</span>
          </div>

          {/* Extra vendég pótdíj */}
          {bookingData.guestSurcharge > 0 && (
            <div className="flex justify-between">
              <span className="text-cream/80">Extra vendég pótdíj</span>
              <span>{formatCurrency(bookingData.guestSurcharge)}</span>
            </div>
          )}

          {/* Kedvezmény */}
          {bookingData.discountAmount > 0 && (
            <div className="flex justify-between items-start bg-green-900/30 -mx-1 px-2 py-1.5 rounded-lg">
              <div>
                <p className="text-green-300 font-medium">Kedvezmény – {bookingData.discountName}</p>
                <p className="text-xs text-green-400/70 mt-0.5">{bookingData.discountPercent}%</p>
              </div>
              <span className="text-green-300 font-medium shrink-0 ml-2">−{formatCurrency(bookingData.discountAmount)}</span>
            </div>
          )}

          {/* Kiválasztott extra szolgáltatások */}
          {selected.length > 0 && (
            <>
              <div className="border-t border-white/10 pt-2.5 mt-1">
                <p className="text-xs text-cream/40 uppercase tracking-wider mb-2">Extra szolgáltatások</p>
              </div>
              {selected.map((s) => (
                <div key={s.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-cream/80">{s.name}</p>
                    {s.price != null && (
                      <p className="text-xs text-cream/40 mt-0.5">
                        {s.pricingType === "PER_NIGHT"
                          ? `${formatCurrency(s.price)} × ${s.quantity} db × ${s.nights} éj`
                          : `${formatCurrency(s.price)} × ${s.quantity} db`}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 ml-3">
                    {s.price != null ? formatCurrency(s.total) : "—"}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-cream/80 font-medium">Végösszeg</span>
          <span className="font-serif text-2xl text-cream">
            {formatCurrency(grandTotal)}
          </span>
        </div>

        <p className="text-xs text-cream/40 mt-4 leading-relaxed">
          A foglalás elküldése után e-mailben visszaigazolást küldünk.
          Fizetés helyszínen vagy előre utalással.
        </p>
      </div>

    </div>
  );
}
