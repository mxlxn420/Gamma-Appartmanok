"use client";

import { useState, useEffect, useCallback } from "react";
import { format, differenceInCalendarDays, getDay } from "date-fns";
import { formatDateHu, formatCurrency, getApplicablePricingRule, getAdminNightBreakdown, getRuleForNight, getNightRateFromRule, CLEANING_FEE, TOURIST_TAX } from "@/lib/utils";
import { Check, X, CreditCard, ChevronRight, Pencil, Trash2, RefreshCw, Plus, Minus, Moon, CalendarCheck, Mail } from "lucide-react";
import type { Booking, BookingStatus, PricingRule } from "@/types";

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  PENDING:   { label: "Előlegre vár", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Jóváhagyva",   color: "bg-blue-100 text-blue-700"    },
  PAID:      { label: "Fizetve",      color: "bg-green-100 text-green-700"   },
  CANCELLED: { label: "Elutasítva",   color: "bg-red-100 text-red-700"       },
  BLOCKED:   { label: "Zárva",         color: "bg-stone-100 text-stone-600"   },
};

const ALL_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED"];

interface EditForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  checkIn: string;
  checkOut: string;
  numberOfAdults: number;
  numberOfTeens: number;
  numberOfBabies: number;
  numberOfChildren2to6: number;
  numberOfChildren6to12: number;
  notes: string;
  basePrice: number;
  childPrice2to6: number;
  childPrice6to12: number;
  cleaningFee: number;
  touristTax: number;
  guestSurcharge: number;
  totalPrice: number;
  depositAmount: number;
  discountPercent: number;
  discountAmount: number;
  status: BookingStatus;
}

interface Props {
  bookings: Booking[];
}

function toDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

// Tier-alapú flat rate: adults + children(2-17) + max(0, babies-1) = personCount
// touristTax = csak felnőttek (18+), 450 Ft/fő/éj
function calcPriceBreakdown(
  checkIn: Date,
  checkOut: Date,
  adults: number,
  children: number,
  babies: number,
  rules: PricingRule[]
): Pick<EditForm, "basePrice" | "childPrice2to6" | "childPrice6to12" | "guestSurcharge" | "cleaningFee" | "touristTax" | "totalPrice" | "depositAmount"> | null {
  const nights = differenceInCalendarDays(checkOut, checkIn);
  if (nights <= 0) return null;
  const personCount = adults + children + Math.max(0, babies - 1);

  let basePrice = 0;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const nightRule = getRuleForNight(cur, rules);
    if (nightRule) basePrice += getNightRateFromRule(nightRule, cur, personCount);
    cur.setDate(cur.getDate() + 1);
  }

  const rule = getApplicablePricingRule(checkIn, checkOut, rules);
  if (!rule && basePrice === 0) return null;

  const touristTax   = adults * TOURIST_TAX * nights;
  const cleaningFee  = CLEANING_FEE;
  const totalPrice   = basePrice + cleaningFee + touristTax;
  const depositPercent = rule?.depositPercent ?? 30;
  const depositAmount  = Math.round((totalPrice - touristTax) * depositPercent / 100);

  return { basePrice, childPrice2to6: 0, childPrice6to12: 0, guestSurcharge: 0, cleaningFee, touristTax, totalPrice, depositAmount };
}

export default function AdminBookingsList({ bookings }: Props) {
  type ExtraSvc = NonNullable<Booking["extraServices"]>[number];

  const [list, setList]               = useState<Booking[]>(bookings);
  const [loading, setLoading]         = useState<string | null>(null);
  const [selected, setSelected]       = useState<Booking | null>(null);
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState<EditForm | null>(null);
  interface AvailableService {
    id: string; name: string; description: string;
    pricingType: "PER_NIGHT" | "PER_BOOKING";
    price: number | null;
  }

  interface EditApartment {
    apartmentId:   string;
    name:          string;
    numberOfAdults: number;
    numberOfTeens:  number;
    numberOfBabies: number;
  }

  const [editApartments, setEditApartments] = useState<EditApartment[]>([]);
  const [editExtras, setEditExtras]         = useState<ExtraSvc[]>([]);
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [showAddPanel, setShowAddPanel]     = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [cancelModal, setCancelModal]       = useState(false);
  const [cancelNote, setCancelNote]         = useState("");
  const [sendCancelEmail, setSendCancelEmail] = useState(true);
  const [depositModal, setDepositModal]     = useState<string | null>(null);
  const [depositForm, setDepositForm]       = useState({ paidAt: new Date().toISOString().slice(0, 10), paidAmount: "", paidMethod: "transfer" });
  const [saveError, setSaveError]           = useState<string | null>(null);
  const [rules, setRules]                   = useState<PricingRule[]>([]);

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRules(d.data); });
    fetch("/api/extra-services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAvailableServices(d.data); });
  }, []);

  const openModal = (booking: Booking) => {
    setSelected(booking);
    setEditing(false);
    setConfirmDelete(false);
    setSaveError(null);
  };

  const closeModal = () => {
    setSelected(null);
    setEditing(false);
    setConfirmDelete(false);
    setSaveError(null);
  };

  const startEdit = (booking: Booking) => {
    const initial: EditForm = {
      guestName:             booking.guestName,
      guestEmail:            booking.guestEmail,
      guestPhone:            booking.guestPhone,
      guestAddress:          booking.guestAddress ?? "",
      checkIn:               toDateInput(booking.checkIn),
      checkOut:              toDateInput(booking.checkOut),
      numberOfAdults:        booking.numberOfAdults,
      numberOfTeens:         booking.numberOfTeens,
      numberOfBabies:        booking.numberOfBabies,
      numberOfChildren2to6:  booking.numberOfChildren2to6,
      numberOfChildren6to12: booking.numberOfChildren6to12,
      notes:                 booking.notes ?? "",
      basePrice:             booking.basePrice,
      childPrice2to6:        booking.childPrice2to6,
      childPrice6to12:       booking.childPrice6to12,
      cleaningFee:           booking.cleaningFee,
      touristTax:            booking.touristTax,
      guestSurcharge:        booking.guestSurcharge,
      totalPrice:            booking.totalPrice,
      depositAmount:         booking.depositAmount ?? 0,
      discountPercent:       booking.discountPercent ?? 0,
      discountAmount:        booking.discountAmount  ?? 0,
      status:                booking.status as BookingStatus,
    };
    setEditForm(initial);
    setEditExtras((booking.extraServices ?? []) as ExtraSvc[]);
    setEditApartments(
      (booking.apartments ?? []).map(a => ({
        apartmentId:    a.apartmentId,
        name:           a.apartment.name,
        numberOfAdults: a.numberOfAdults,
        numberOfTeens:  a.numberOfTeens,
        numberOfBabies: a.numberOfBabies,
      }))
    );
    setShowAddPanel(false);
    setEditing(true);
    setSaveError(null);
  };

  const recalc = useCallback((form: EditForm, apts?: EditApartment[]) => {
    if (!form.checkIn || !form.checkOut || !rules.length) return form;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    if (co <= ci) return form;
    const usedApts = apts ?? editApartments;
    const nights = differenceInCalendarDays(co, ci);

    let basePrice = 0;
    let touristTax = 0;
    let totalAdults = 0;
    let totalChildren = 0;
    let totalBabies = 0;

    if (usedApts.length > 0) {
      // Per-apartman számítás – minden apartman a saját vendégszáma alapján
      for (const apt of usedApts) {
        const pc = apt.numberOfAdults + apt.numberOfTeens + Math.max(0, apt.numberOfBabies - 1);
        const aptRules = rules.filter(r => r.apartmentId === apt.apartmentId || !r.apartmentId);
        const bd = getAdminNightBreakdown(ci, co, aptRules, pc);
        basePrice  += bd.reduce((s, g) => s + g.count * g.rate, 0);
        touristTax += apt.numberOfAdults * TOURIST_TAX * nights;
        totalAdults   += apt.numberOfAdults;
        totalChildren += apt.numberOfTeens;
        totalBabies   += apt.numberOfBabies;
      }
    } else {
      totalAdults   = form.numberOfAdults;
      totalChildren = form.numberOfTeens;
      totalBabies   = form.numberOfBabies;
      const breakdown = calcPriceBreakdown(ci, co, totalAdults, totalChildren, totalBabies, rules);
      if (!breakdown) return form;
      basePrice  = breakdown.basePrice;
      touristTax = breakdown.touristTax;
    }

    const cleaningFee    = CLEANING_FEE;
    const extrasTotal    = editExtras.reduce((sum, s) => sum + (s.total ?? 0), 0);
    const discountPercent = form.discountPercent ?? 0;
    const discountBase   = basePrice + cleaningFee;
    const discountAmount = Math.round(discountBase * discountPercent / 100);
    const totalPrice     = basePrice + cleaningFee + touristTax + extrasTotal - discountAmount;
    const depositRule    = rules.find((r) => r.dateFrom && r.dateTo && new Date(r.dateFrom) <= ci && ci <= new Date(r.dateTo)) ?? rules.find((r) => !r.dateFrom);
    const depositPercent = depositRule?.depositPercent ?? 30;
    const depositAmount  = Math.round((totalPrice - touristTax) * depositPercent / 100);
    return {
      ...form,
      basePrice, childPrice2to6: 0, childPrice6to12: 0, guestSurcharge: 0,
      cleaningFee, touristTax, totalPrice, discountAmount, depositAmount,
      numberOfAdults: totalAdults,
      numberOfTeens:  totalChildren,
      numberOfBabies: totalBabies,
    };
  }, [rules, editExtras, editApartments]);

  const setField = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      if (["checkIn", "checkOut", "discountPercent", "numberOfAdults", "numberOfTeens", "numberOfBabies"].includes(key)) {
        return recalc(next);
      }
      return next;
    });
  };

  const handleRecalcManual = () => {
    if (!editForm) return;
    setEditForm(recalc(editForm));
  };

  // ─── Státusz módosítás (olvasó nézetből) ────────────────────
  const updateStatus = async (id: string, status: BookingStatus, adminNote?: string, sendEmail?: boolean) => {
    setLoading(id);
    try {
      const res  = await fetch(`/api/bookings/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, ...(adminNote ? { adminNote } : {}), ...(sendEmail !== undefined ? { sendEmail } : {}) }),
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
        setSelected((prev) => prev ? { ...prev, status } : prev);
      }
    } finally {
      setLoading(null);
    }
  };

  // ─── Előleg befizetve ────────────────────────────────────────
  const markDepositPaid = async (id: string) => {
    setLoading(id);
    setSaveError(null);
    try {
      const res  = await fetch(`/api/admin/bookings/${id}/deposit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          paidAt:     depositForm.paidAt,
          paidAmount: depositForm.paidAmount !== "" ? Number(depositForm.paidAmount) : null,
          paidMethod: depositForm.paidMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.data;
        setList((prev) => prev.map((b) => b.id === id ? { ...b, ...updated } : b));
        setSelected((prev) => prev ? { ...prev, ...updated } : prev);
        setDepositModal(null);
      } else {
        setSaveError(data.error ?? "Ismeretlen hiba");
      }
    } catch {
      setSaveError("Hálózati hiba");
    } finally {
      setLoading(null);
    }
  };

  // ─── Mentés ──────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editForm || !selected) return;
    setLoading(selected.id);
    setSaveError(null);
    try {
      const extrasTotal = editExtras.reduce((sum, s) => sum + (s.total ?? 0), 0);
      const res  = await fetch(`/api/bookings/${selected.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...editForm,
          totalPrice: editForm.totalPrice,
          extraServices: editExtras,
          extraServicesTotal: extrasTotal,
          apartmentGuests: editApartments.map(a => ({
            id:       a.apartmentId,
            adults:   a.numberOfAdults,
            teens:    a.numberOfTeens,
            babies:   a.numberOfBabies,
            children2to6:  0,
            children6to12: 0,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setSaveError(data.error ?? "Mentési hiba");
        return;
      }
      const mergedApartments = editApartments.length > 0
        ? editApartments.map(a => ({
            apartmentId: a.apartmentId,
            apartment:   selected.apartments?.find(x => x.apartmentId === a.apartmentId)?.apartment ?? { id: a.apartmentId, name: a.name, slug: "" },
            numberOfAdults:        a.numberOfAdults,
            numberOfTeens:         a.numberOfTeens,
            numberOfBabies:        a.numberOfBabies,
            numberOfChildren2to6:  0,
            numberOfChildren6to12: 0,
          }))
        : selected.apartments ?? [];
      const updated: Booking = { ...data.data, apartments: mergedApartments };
      setList((prev) => prev.map((b) => b.id === selected.id ? updated : b));
      setSelected(updated);
      setEditing(false);
    } finally {
      setLoading(null);
    }
  };

  // ─── Törlés ──────────────────────────────────────────────────
  const deleteBooking = async () => {
    if (!selected) return;
    setLoading(selected.id);
    try {
      const res  = await fetch(`/api/bookings/${selected.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: cancelNote || undefined, sendEmail: sendCancelEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.filter((b) => b.id !== selected.id));
        setCancelNote("");
        closeModal();
      }
    } finally {
      setLoading(null);
    }
  };

  if (!list.length) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-12 text-center text-stone-400">
        Még nincsenek foglalások.
      </div>
    );
  }

  return (
    <>
      {/* ─── Mobil kártya lista ───────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {list.map((booking) => {
          const statusCfg = STATUS_CONFIG[booking.status as BookingStatus];
          return (
            <div
              key={booking.id}
              onClick={() => openModal(booking)}
              className="bg-white rounded-2xl shadow-card p-4 cursor-pointer active:bg-stone-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-stone-800 truncate">{booking.guestName}</p>
                  <p className="text-xs text-stone-400 font-mono">{booking.id}</p>
                </div>
                <span className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{formatDateHu(booking.checkIn)} – {formatDateHu(booking.checkOut)}</span>
                <span className="font-semibold text-stone-800">{formatCurrency(booking.totalPrice)}</span>
              </div>
              {booking.apartments && booking.apartments.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {booking.apartments.map(a => (
                    <span key={a.apartmentId} className="inline-flex px-2 py-0.5 rounded-full text-xs bg-forest-100 text-forest-700 font-medium">
                      {a.apartment.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Asztali táblázat ─────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {["Azonosító", "Vendég", "Érkezés", "Távozás", "Fő", "Összeg", "Státusz", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.status as BookingStatus];
                return (
                  <tr
                    key={booking.id}
                    onClick={() => openModal(booking)}
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-stone-400">{booking.id.slice(-8)}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-800">{booking.guestName}</p>
                      <p className="text-xs text-stone-400">{booking.guestEmail}</p>
                      {booking.apartments && booking.apartments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.apartments.map(a => (
                            <span key={a.apartmentId} className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] bg-forest-100 text-forest-700 font-medium">
                              {a.apartment.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-stone-600">{formatDateHu(booking.checkIn)}</td>
                    <td className="px-5 py-4 text-stone-600">{formatDateHu(booking.checkOut)}</td>
                    <td className="px-5 py-4 text-stone-600 text-center">{booking.numberOfGuests}</td>
                    <td className="px-5 py-4 font-medium text-stone-800">{formatCurrency(booking.totalPrice)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {booking.depositAmount > 0 && !booking.depositPaidAt && booking.status !== "CANCELLED" && (
                          <>
                            <button
                              onClick={() => { setDepositForm({ paidAt: new Date().toISOString().slice(0, 10), paidAmount: String(booking.totalPrice), paidMethod: "transfer" }); setDepositModal(booking.id); }}
                              disabled={loading === booking.id}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-60"
                              title="Előleg befizetve – visszaigazoló küldése"
                            >
                              <CreditCard size={12} />
                              Előleg
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (loading === booking.id) return;
                                setLoading(booking.id);
                                try {
                                  const res = await fetch(`/api/admin/bookings/${booking.id}/remind`, { method: "POST" });
                                  const data = await res.json();
                                  if (!data.success) throw new Error(data.error);
                                  alert("Fizetési emlékeztető elküldve!");
                                } catch (e: any) {
                                  alert("Hiba: " + (e?.message ?? "Ismeretlen hiba"));
                                } finally {
                                  setLoading(null);
                                }
                              }}
                              disabled={loading === booking.id}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors disabled:opacity-60"
                              title="Fizetési emlékeztető küldése"
                            >
                              <Mail size={12} />
                              Emlékeztető
                            </button>
                          </>
                        )}
                        {booking.depositPaidAt && (
                          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                            <Check size={12} />
                            Előleg ✓
                          </span>
                        )}
                        <button
                          onClick={() => openModal(booking)}
                          className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal ────────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-luxury w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fejléc */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div>
                <p className="font-mono text-xs text-stone-400">{selected.id}</p>
                <h2 className="font-serif text-xl text-stone-800 mt-0.5">
                  {editing ? "Foglalás szerkesztése" : selected.guestName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status as BookingStatus].color}`}>
                    {STATUS_CONFIG[selected.status as BookingStatus].label}
                  </span>
                )}
                {!editing && (
                  <button
                    onClick={() => startEdit(selected)}
                    className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                    title="Szerkesztés"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {editing && editForm ? (
                /* ─── Szerkesztő form ──────────────────────── */
                <>
                  {/* Vendégadatok */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Vendégadatok</h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.guestName}
                        onChange={(e) => setField("guestName", e.target.value)}
                        placeholder="Teljes név"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                      />
                      <input
                        type="email"
                        value={editForm.guestEmail}
                        onChange={(e) => setField("guestEmail", e.target.value)}
                        placeholder="E-mail"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                      />
                      <input
                        type="tel"
                        value={editForm.guestPhone}
                        onChange={(e) => setField("guestPhone", e.target.value)}
                        placeholder="Telefon"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                      />
                      <input
                        type="text"
                        value={editForm.guestAddress}
                        onChange={(e) => setField("guestAddress", e.target.value)}
                        placeholder="Lakcím"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                      />
                    </div>
                  </section>

                  {/* Tartózkodás */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Tartózkodás</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-stone-400 mb-1 block">Érkezés</label>
                        <input
                          type="date"
                          value={editForm.checkIn}
                          onChange={(e) => setField("checkIn", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400 mb-1 block">Távozás</label>
                        <input
                          type="date"
                          value={editForm.checkOut}
                          onChange={(e) => setField("checkOut", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 appearance-none"
                        />
                      </div>
                    </div>
                    {editForm.checkIn && editForm.checkOut && new Date(editForm.checkOut) > new Date(editForm.checkIn) && (
                      <p className="text-xs text-stone-400 mt-1.5 pl-1">
                        {differenceInCalendarDays(new Date(editForm.checkOut), new Date(editForm.checkIn))} éjszaka
                      </p>
                    )}
                  </section>

                  {/* Vendégek */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Vendégek</h3>
                    {editApartments.length > 0 ? (
                      <div className="space-y-3">
                        {editApartments.map((apt, idx) => (
                          <div key={apt.apartmentId} className="bg-stone-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-forest-700 mb-2">{apt.name}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {([
                                ["Felnőtt (18+)", "numberOfAdults"],
                                ["Gyerek (2–17)", "numberOfTeens"],
                                ["Baba (0–2)",    "numberOfBabies"],
                              ] as [string, keyof EditApartment][]).map(([label, key]) => (
                                <div key={String(key)}>
                                  <label className="text-xs text-stone-400 mb-1 block">{label}</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={apt[key] as number}
                                    onChange={(e) => {
                                      const next = editApartments.map((a, i) =>
                                        i === idx ? { ...a, [key]: Number(e.target.value) } : a
                                      );
                                      setEditApartments(next);
                                      setEditForm((prev) => prev ? recalc(prev, next) : prev);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-stone-400">Gyerek = felnőtt ár, IFA nélkül · Baba: 1 db ingyenes, többi felnőtt ár</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            ["Felnőtt (18+)", "numberOfAdults"],
                            ["Gyerek (2–17)", "numberOfTeens"],
                            ["Baba (0–2)",    "numberOfBabies"],
                          ] as [string, keyof EditForm][]).map(([label, key]) => (
                            <div key={String(key)}>
                              <label className="text-xs text-stone-400 mb-1 block">{label}</label>
                              <input
                                type="number"
                                min={0}
                                value={editForm[key] as number}
                                onChange={(e) => setField(key, Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-stone-400 mt-2">Gyerek = felnőtt ár, IFA nélkül · Baba: 1 db ingyenes, többi felnőtt ár</p>
                      </>
                    )}
                  </section>

                  {/* Megjegyzés */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Megjegyzés</h3>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      rows={3}
                      placeholder="Vendég megjegyzése..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
                    />
                  </section>

                  {/* Ár */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider">Árösszesítő</h3>
                      <button
                        type="button"
                        onClick={handleRecalcManual}
                        className="flex items-center gap-1 text-xs text-forest-600 hover:text-forest-800 transition-colors"
                        title="Újraszámolás az árakon alapulva"
                      >
                        <RefreshCw size={11} />
                        Újraszámol
                      </button>
                    </div>
                    {(() => {
                      const ci = editForm.checkIn ? new Date(editForm.checkIn) : null;
                      const co = editForm.checkOut ? new Date(editForm.checkOut) : null;
                      const editNights = ci && co ? Math.max(0, differenceInCalendarDays(co, ci)) : 0;

                      // Hétvégi / hétköznapi éjek
                      let weekendNights = 0;
                      if (ci && co) {
                        const cur = new Date(ci);
                        while (cur < co) { if ([5, 6].includes(getDay(cur))) weekendNights++; cur.setDate(cur.getDate() + 1); }
                      }
                      const weekdayNights = editNights - weekendNights;

                      return (
                        <div className="space-y-2 text-sm">

                          {/* Szállás – per-apartman */}
                          {editApartments.length > 0 ? editApartments.map((apt) => {
                            const pc = apt.numberOfAdults + apt.numberOfTeens + Math.max(0, apt.numberOfBabies - 1);
                            const aptRules = rules.filter(r => r.apartmentId === apt.apartmentId || !r.apartmentId);
                            const bd = ci && co ? getAdminNightBreakdown(ci, co, aptRules, pc) : [];
                            const aptBase = bd.reduce((s, g) => s + g.count * g.rate, 0);
                            const aptTax  = apt.numberOfAdults * editNights * TOURIST_TAX;
                            return (
                              <div key={apt.apartmentId} className="border border-stone-100 rounded-xl overflow-hidden">
                                <div className="bg-stone-50 px-3 py-2 text-xs font-semibold text-forest-700">{apt.name} ({pc} fő)</div>
                                <div className="px-3 py-2 space-y-1">
                                  <div className="flex justify-between text-stone-600">
                                    <div>
                                      <span>Szállás</span>
                                      {bd.map((g, i) => <p key={i} className="text-xs text-stone-400">{g.count} éj × {formatCurrency(g.rate)}/éj</p>)}
                                    </div>
                                    <span>{formatCurrency(aptBase)}</span>
                                  </div>
                                  <div className="flex justify-between text-stone-500 text-xs">
                                    <span>IFA ({apt.numberOfAdults} felnőtt × {editNights} éj × {TOURIST_TAX} Ft)</span>
                                    <span>{formatCurrency(aptTax)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }) : (() => {
                            const pc = editForm.numberOfAdults + editForm.numberOfTeens + Math.max(0, editForm.numberOfBabies - 1);
                            const bd = ci && co ? getAdminNightBreakdown(ci, co, rules, pc) : [];
                            return bd.map((g, i) => (
                              <div key={i} className="flex justify-between items-start text-stone-600">
                                <div>
                                  <span>Szállás</span>
                                  <p className="text-xs text-stone-400">{g.count} éj × {formatCurrency(g.rate)}/éj</p>
                                </div>
                                <span className="shrink-0 ml-2">{formatCurrency(g.count * g.rate)}</span>
                              </div>
                            ));
                          })()}

                          {/* IFA – csak ha nincs per-apartman bontás */}
                          {editApartments.length === 0 && editForm.touristTax > 0 && (
                            <div className="flex justify-between items-start text-stone-600">
                              <div>
                                <span>IFA</span>
                                <p className="text-xs text-stone-400">{editForm.numberOfAdults} felnőtt × {editNights} éj × {TOURIST_TAX} Ft/éj</p>
                              </div>
                              <span className="shrink-0 ml-2">{formatCurrency(editForm.touristTax)}</span>
                            </div>
                          )}

                          {/* Pótdíj */}
                          {editForm.guestSurcharge > 0 && (
                            <div className="flex justify-between text-stone-600">
                              <span>Extra vendég pótdíj</span>
                              <span>{formatCurrency(editForm.guestSurcharge)}</span>
                            </div>
                          )}

                          {/* Takarítás */}
                          {editForm.cleaningFee > 0 && (
                            <div className="flex justify-between text-stone-600">
                              <span>Takarítási díj</span>
                              <span>{formatCurrency(editForm.cleaningFee)}</span>
                            </div>
                          )}

                          {/* Extra szolgáltatások – szerkeszthető */}
                          {editExtras.length > 0 && (
                            <div className="border-t border-stone-100 pt-2 mt-1 space-y-2">
                              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Extra szolgáltatások</p>
                              {editExtras.map((svc, i) => (
                                <div key={i} className="bg-stone-50 rounded-xl px-3 py-2.5 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                        svc.pricingType === "PER_NIGHT" ? "bg-forest-50 text-forest-700" : "bg-terra-50 text-terra-700"
                                      }`}>
                                        {svc.pricingType === "PER_NIGHT" ? <Moon size={9} /> : <CalendarCheck size={9} />}
                                        {svc.pricingType === "PER_NIGHT" ? "/éj" : "/fog."}
                                      </span>
                                      <p className="text-sm font-medium text-stone-700 truncate">{svc.name}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditExtras((prev) => prev.filter((_, idx) => idx !== i))}
                                      className="shrink-0 w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                                    >
                                      <Trash2 size={11} className="text-red-500" />
                                    </button>
                                  </div>

                                  {/* PER_NIGHT: léptető */}
                                  {svc.pricingType === "PER_NIGHT" && (
                                    <div className="space-y-1.5">
                                      {/* Darabszám */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-stone-400">Darabszám</span>
                                        <div className="flex items-center gap-1.5">
                                          <button type="button" onClick={() => setEditExtras((prev) => prev.map((s, idx) => {
                                            if (idx !== i) return s;
                                            const q = Math.max(1, s.quantity - 1);
                                            return { ...s, quantity: q, total: s.price != null ? s.price * q * s.nights : 0 };
                                          }))} className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors">
                                            <Minus size={10} />
                                          </button>
                                          <span className="w-5 text-center text-sm font-semibold text-stone-800">{svc.quantity}</span>
                                          <button type="button" onClick={() => setEditExtras((prev) => prev.map((s, idx) => {
                                            if (idx !== i) return s;
                                            const q = s.quantity + 1;
                                            return { ...s, quantity: q, total: s.price != null ? s.price * q * s.nights : 0 };
                                          }))} className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors">
                                            <Plus size={10} />
                                          </button>
                                        </div>
                                      </div>
                                      {/* Éjszakák */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-stone-400">Éjszakák</span>
                                        <div className="flex items-center gap-1.5">
                                          <button type="button" onClick={() => setEditExtras((prev) => prev.map((s, idx) => {
                                            if (idx !== i) return s;
                                            const n = Math.max(1, s.nights - 1);
                                            return { ...s, nights: n, total: s.price != null ? s.price * s.quantity * n : 0 };
                                          }))} className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors">
                                            <Minus size={10} />
                                          </button>
                                          <span className="w-5 text-center text-sm font-semibold text-stone-800">{svc.nights}</span>
                                          <button type="button" onClick={() => setEditExtras((prev) => prev.map((s, idx) => {
                                            if (idx !== i) return s;
                                            const n = s.nights + 1;
                                            return { ...s, nights: n, total: s.price != null ? s.price * s.quantity * n : 0 };
                                          }))} className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors">
                                            <Plus size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Részösszeg */}
                                  {svc.price != null && (
                                    <div className="flex justify-between items-center pt-0.5">
                                      <span className="text-xs text-stone-400">
                                        {svc.pricingType === "PER_NIGHT"
                                          ? `${formatCurrency(svc.price)} × ${svc.quantity} db × ${svc.nights} éj`
                                          : `${formatCurrency(svc.price)}/foglalás`}
                                      </span>
                                      <span className="text-sm font-bold text-forest-700">{formatCurrency(svc.total)}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Extra hozzáadása gomb */}
                          {(() => {
                            const editNights = editForm.checkIn && editForm.checkOut
                              ? Math.max(1, differenceInCalendarDays(new Date(editForm.checkOut), new Date(editForm.checkIn)))
                              : 1;
                            const notYetAdded = availableServices.filter(
                              (svc) => !editExtras.find((e) => e.id === svc.id)
                            );
                            if (notYetAdded.length === 0) return null;
                            return (
                              <div className={editExtras.length > 0 ? "pt-1" : "border-t border-stone-100 pt-2 mt-1"}>
                                {!showAddPanel ? (
                                  <button
                                    type="button"
                                    onClick={() => setShowAddPanel(true)}
                                    className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-800 transition-colors"
                                  >
                                    <Plus size={13} />
                                    Extra szolgáltatás hozzáadása
                                  </button>
                                ) : (
                                  <div className="bg-stone-50 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-xs font-medium text-stone-500">Válassz szolgáltatást</p>
                                      <button type="button" onClick={() => setShowAddPanel(false)}>
                                        <X size={13} className="text-stone-400" />
                                      </button>
                                    </div>
                                    {notYetAdded.map((svc) => (
                                      <button
                                        key={svc.id}
                                        type="button"
                                        onClick={() => {
                                          const nights   = svc.pricingType === "PER_NIGHT" ? editNights : 1;
                                          const quantity = 1;
                                          const total    = svc.price != null
                                            ? svc.pricingType === "PER_NIGHT"
                                              ? svc.price * quantity * nights
                                              : svc.price * quantity
                                            : 0;
                                          setEditExtras((prev) => [...prev, {
                                            id: svc.id, name: svc.name,
                                            pricingType: svc.pricingType,
                                            price: svc.price,
                                            quantity, nights, total,
                                          }]);
                                          setShowAddPanel(false);
                                        }}
                                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-forest-400 text-left transition-colors"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                              svc.pricingType === "PER_NIGHT" ? "bg-forest-50 text-forest-700" : "bg-terra-50 text-terra-700"
                                            }`}>
                                              {svc.pricingType === "PER_NIGHT" ? <Moon size={9} /> : <CalendarCheck size={9} />}
                                              {svc.pricingType === "PER_NIGHT" ? "/éj" : "/fog."}
                                            </span>
                                            <span className="text-sm font-medium text-stone-700 truncate">{svc.name}</span>
                                          </div>
                                        </div>
                                        <span className="shrink-0 text-sm text-forest-700 font-semibold">
                                          {svc.price != null ? formatCurrency(svc.price) : "—"}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Végső ár + előleg */}
                          {(() => {
                            const depositBase = editForm.totalPrice - editForm.touristTax;
                            return (
                              <div className="border-t border-stone-100 pt-3 mt-1 space-y-2">
                                <div>
                                  <label className="text-xs text-green-700 font-medium mb-1.5 block">Kedvezmény (%)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={editForm.discountPercent}
                                      onChange={(e) => setField("discountPercent", Number(e.target.value))}
                                      className="flex-1 px-3 py-2 rounded-xl border border-green-200 bg-green-50 text-sm font-semibold text-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                    <span className="text-sm text-stone-400">%</span>
                                  </div>
                                  {editForm.discountPercent > 0 && (
                                    <p className="text-xs text-green-600 mt-1">− {formatCurrency(editForm.discountAmount)} a szállásdíjból</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs text-stone-400 mb-1.5 block">Végösszeg (szerkeszthető)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={editForm.totalPrice}
                                      onChange={(e) => setField("totalPrice", Number(e.target.value))}
                                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-forest-400"
                                    />
                                    <span className="text-sm text-stone-400">Ft</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-amber-600 font-medium mb-1.5 block">Fizetendő előleg (szerkeszthető)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={editForm.depositAmount}
                                      onChange={(e) => setField("depositAmount", Number(e.target.value))}
                                      className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                    <span className="text-sm text-stone-400">Ft</span>
                                  </div>
                                  {depositBase > 0 && editForm.depositAmount > 0 && (
                                    <p className="text-xs text-stone-400 mt-1">
                                      = {Math.round(editForm.depositAmount / depositBase * 100)}% (IFA nélkül)
                                    </p>
                                  )}
                                </div>
                                {editForm.depositAmount > 0 && editForm.totalPrice > editForm.depositAmount && (
                                  <div className="flex justify-between items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                                    <div>
                                      <p className="text-xs font-semibold text-stone-700">Helyszínen fizetendő</p>
                                      <p className="text-[10px] text-stone-400 mt-0.5">Végösszeg – előleg</p>
                                    </div>
                                    <span className="font-bold text-stone-800 text-sm">{formatCurrency(editForm.totalPrice - editForm.depositAmount)}</span>
                                  </div>
                                )}
                              </div>

                            );
                          })()}
                        </div>
                      );
                    })()}
                  </section>

                  {/* Státusz */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Státusz</h3>
                    <select
                      value={editForm.status}
                      onChange={(e) => setField("status", e.target.value as BookingStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </section>

                  {saveError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{saveError}</p>
                  )}

                  {/* Gombok */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      disabled={loading === selected.id}
                      className="flex-1 py-2.5 rounded-xl bg-forest-600 text-white hover:bg-forest-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Mentés
                    </button>
                    <button
                      onClick={() => { setEditing(false); setSaveError(null); }}
                      className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 text-sm font-medium transition-colors"
                    >
                      Mégse
                    </button>
                  </div>

                  {/* Törlés */}
                  <div className="border-t border-stone-100 pt-4">
                    {confirmDelete ? (
                      <div className="space-y-2">
                        <p className="text-sm text-red-600 text-center">Biztosan törlöd a foglalást? Ez nem visszavonható.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={deleteBooking}
                            disabled={loading === selected.id}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Igen, törlöm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 text-sm font-medium transition-colors"
                          >
                            Mégse
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setCancelNote(""); setConfirmDelete(true); setSendCancelEmail(selected?.status !== "PENDING"); setCancelModal(true); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
                      >
                        <Trash2 size={14} />
                        Foglalás törlése
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* ─── Olvasó nézet ─────────────────────────── */
                <>
                  {/* Kapcsolat */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Kapcsolat</h3>
                    <div className="space-y-1 text-sm text-stone-700">
                      <p>{selected.guestEmail}</p>
                      <p>{selected.guestPhone}</p>
                      {selected.guestAddress && <p>{selected.guestAddress}</p>}
                    </div>
                  </section>

                  {/* Dátumok */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Tartózkodás</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-stone-50 rounded-xl p-3">
                        <p className="text-xs text-stone-400 mb-0.5">Érkezés</p>
                        <p className="font-medium text-stone-800">{formatDateHu(selected.checkIn)}</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-3">
                        <p className="text-xs text-stone-400 mb-0.5">Távozás</p>
                        <p className="font-medium text-stone-800">{formatDateHu(selected.checkOut)}</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-3">
                        <p className="text-xs text-stone-400 mb-0.5">Éjszakák</p>
                        <p className="font-medium text-stone-800">{selected.nights} éj</p>
                      </div>
                    </div>
                  </section>

                  {/* Vendégek */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Vendégek</h3>
                    {selected.apartments && selected.apartments.length > 0 ? (
                      <div className="space-y-3">
                        {selected.apartments.map((a) => (
                          <div key={a.apartmentId} className="bg-stone-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-forest-700 mb-2">{a.apartment.name}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-stone-500">Felnőtt (18+)</span>
                                <span className="font-medium text-stone-800">{a.numberOfAdults} fő</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500">Gyerek (2–17)</span>
                                <span className="font-medium text-stone-800">{a.numberOfTeens} fő</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500">Baba (0–2)</span>
                                <span className="font-medium text-stone-800">{a.numberOfBabies} fő</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between bg-forest-50 rounded-xl px-3 py-2 text-sm">
                          <span className="text-stone-500">Összesen</span>
                          <span className="font-semibold text-stone-800">{selected.numberOfGuests} fő</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between bg-stone-50 rounded-xl px-3 py-2">
                          <span className="text-stone-500">Felnőtt (18+)</span>
                          <span className="font-medium text-stone-800">{selected.numberOfAdults} fő</span>
                        </div>
                        <div className="flex justify-between bg-stone-50 rounded-xl px-3 py-2">
                          <span className="text-stone-500">Gyerek (2–17)</span>
                          <span className="font-medium text-stone-800">{selected.numberOfTeens} fő</span>
                        </div>
                        <div className="flex justify-between bg-stone-50 rounded-xl px-3 py-2">
                          <span className="text-stone-500">Baba (0–2)</span>
                          <span className="font-medium text-stone-800">{selected.numberOfBabies} fő</span>
                        </div>
                        <div className="flex justify-between bg-forest-50 rounded-xl px-3 py-2">
                          <span className="text-stone-500">Összesen</span>
                          <span className="font-semibold text-stone-800">{selected.numberOfGuests} fő</span>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Árak */}
                  <section>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Árösszesítő</h3>
                    {(() => {
                      const ci = new Date(selected.checkIn);
                      const co = new Date(selected.checkOut);
                      const apartments = selected.apartments ?? [];

                      return (
                        <div className="space-y-2 text-sm">
                          {/* Per-apartman szállás bontás */}
                          {apartments.length > 0 ? apartments.map((a) => {
                            const personCount = a.numberOfAdults + a.numberOfTeens + Math.max(0, a.numberOfBabies - 1);
                            const aptRules = rules.filter(r => r.apartmentId === a.apartmentId || !r.apartmentId);
                            const breakdown = aptRules.length ? getAdminNightBreakdown(ci, co, aptRules, personCount) : [];
                            const aptBase = breakdown.reduce((s, g) => s + g.count * g.rate, 0) || selected.basePrice / Math.max(apartments.length, 1);
                            const aptTax = a.numberOfAdults * selected.nights * 450;
                            return (
                              <div key={a.apartmentId} className="border border-stone-100 rounded-xl overflow-hidden">
                                <div className="bg-stone-50 px-3 py-2 text-xs font-semibold text-forest-700">{a.apartment.name}</div>
                                <div className="px-3 py-2 space-y-1">
                                  <div className="flex justify-between text-stone-600">
                                    <div>
                                      <span>Szállás ({personCount} fő)</span>
                                      {breakdown.map((g, i) => (
                                        <p key={i} className="text-xs text-stone-400">{g.count} éj × {formatCurrency(g.rate)}/éj</p>
                                      ))}
                                    </div>
                                    <span className="shrink-0 ml-2">{formatCurrency(aptBase)}</span>
                                  </div>
                                  <div className="flex justify-between text-stone-500 text-xs">
                                    <span>IFA ({a.numberOfAdults} felnőtt × {selected.nights} éj × 450 Ft)</span>
                                    <span>{formatCurrency(aptTax)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }) : (
                            <>
                              <div className="flex justify-between text-stone-600">
                                <span>Szállás ({selected.nights} éj)</span>
                                <span>{formatCurrency(selected.basePrice)}</span>
                              </div>
                              {(() => {
                                const ifa = selected.touristTax > 0 ? selected.touristTax : selected.numberOfAdults * selected.nights * 450;
                                return ifa > 0 ? (
                                  <div className="flex justify-between items-start text-stone-600">
                                    <div>
                                      <span>IFA</span>
                                      <p className="text-xs text-stone-400">{selected.numberOfAdults} felnőtt × {selected.nights} éj × 450 Ft/éj</p>
                                    </div>
                                    <span className="shrink-0 ml-2">{formatCurrency(ifa)}</span>
                                  </div>
                                ) : null;
                              })()}
                            </>
                          )}

                          {/* Pótdíj */}
                          {selected.guestSurcharge > 0 && (
                            <div className="flex justify-between text-stone-600">
                              <span>Extra vendég pótdíj</span>
                              <span>{formatCurrency(selected.guestSurcharge)}</span>
                            </div>
                          )}

                          {/* Takarítás */}
                          {selected.cleaningFee > 0 && (
                            <div className="flex justify-between text-stone-600">
                              <span>Takarítási díj</span>
                              <span>{formatCurrency(selected.cleaningFee)}</span>
                            </div>
                          )}

                          {/* Extra szolgáltatások */}
                          {selected.extraServices && selected.extraServices.length > 0 && (
                            <>
                              <div className="border-t border-stone-100 pt-2 mt-1">
                                <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Extra szolgáltatások</p>
                              </div>
                              {selected.extraServices.map((svc, i) => (
                                <div key={i} className="flex justify-between items-start text-stone-600">
                                  <div>
                                    <span>{svc.name}</span>
                                    {svc.price != null && (
                                      <p className="text-xs text-stone-400">
                                        {svc.pricingType === "PER_NIGHT"
                                          ? `${formatCurrency(svc.price)} × ${svc.quantity} db × ${svc.nights} éj`
                                          : `${formatCurrency(svc.price)} × ${svc.quantity} db`}
                                      </p>
                                    )}
                                  </div>
                                  <span className="shrink-0 ml-2">
                                    {svc.price != null ? formatCurrency(svc.total) : "—"}
                                  </span>
                                </div>
                              ))}
                            </>
                          )}

                          {/* Végösszeg */}
                          {(() => {
                            const grandTotal  = selected.totalPrice;
                            const depositBase = grandTotal - (selected.touristTax ?? 0);
                            return (
                              <>
                                {(selected.discountAmount ?? 0) > 0 && (
                                  <div className="flex justify-between items-center text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mt-1">
                                    <div>
                                      <p className="text-xs font-semibold">Kedvezmény</p>
                                      <p className="text-[10px] text-green-600">{selected.discountPercent ?? 0}% a szállásdíjból</p>
                                    </div>
                                    <span className="font-semibold text-sm">− {formatCurrency(selected.discountAmount ?? 0)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-semibold text-stone-800 border-t border-stone-100 pt-2 mt-1">
                                  <span>Végösszeg</span>
                                  <span>{formatCurrency(grandTotal)}</span>
                                </div>

                                {/* Előleg */}
                                {selected.depositAmount > 0 && (
                                  <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mt-2">
                                    <div>
                                      <p className="text-xs font-semibold text-amber-800">Fizetendő előleg</p>
                                      <p className="text-[10px] text-amber-600 mt-0.5">
                                        {depositBase > 0 ? `${Math.round(selected.depositAmount / depositBase * 100)}% (IFA nélkül)` : ""}
                                      </p>
                                    </div>
                                    <span className="font-bold text-amber-800">{formatCurrency(selected.depositAmount)}</span>
                                  </div>
                                )}

                                {/* Maradék */}
                                {selected.depositAmount > 0 && (
                                  <div className="flex justify-between items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                                    <div>
                                      <p className="text-xs font-semibold text-stone-700">Helyszínen fizetendő</p>
                                      <p className="text-[10px] text-stone-400 mt-0.5">Végösszeg – előleg</p>
                                    </div>
                                    <span className="font-bold text-stone-800">{formatCurrency(grandTotal - selected.depositAmount)}</span>
                                  </div>
                                )}
                              </>
                            );
                          })()}

                        </div>
                      );
                    })()}
                  </section>

                  {/* Fizetési mód */}
                  {(selected as any).paymentMethod && (
                    <section>
                      <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Fizetési mód</h3>
                      <p className="text-sm text-stone-700 bg-stone-50 rounded-xl px-3 py-2">
                        {{
                          card:                  "Bankkártya",
                          cash:                  "Készpénz",
                          revolut:               "Revolut",
                          transfer:              "Banki átutalás",
                          szep:                  "OTP SZÉP kártya",
                          "szep-otp":            "OTP SZÉP kártya",
                          "szep-mbh":            "OTP SZÉP kártya",
                          "szep-kh":             "OTP SZÉP kártya",
                        }[(selected as any).paymentMethod] ?? (selected as any).paymentMethod}
                      </p>
                    </section>
                  )}

                  {/* Megjegyzés */}
                  {selected.notes && (
                    <section>
                      <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Megjegyzés</h3>
                      <p className="text-sm text-stone-700 bg-stone-50 rounded-xl px-3 py-2">{selected.notes}</p>
                    </section>
                  )}

                  {/* Előleg befizetve */}
                  {selected.depositAmount > 0 && selected.status !== "CANCELLED" && (
                    <section className="space-y-2">
                      {selected.depositPaidAt ? (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                          <Check className="w-5 h-5 text-green-600 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-green-700">Előleg befizetve</p>
                            <p className="text-xs text-green-500 mt-0.5">
                              {format(new Date(selected.depositPaidAt), "yyyy. MM. dd. HH:mm")} · Visszaigazoló e-mail elküldve
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setDepositForm({ paidAt: new Date().toISOString().slice(0, 10), paidAmount: String(selected.totalPrice), paidMethod: "transfer" }); setDepositModal(selected.id); }}
                            disabled={loading === selected.id}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            Előleg befizetve – visszaigazoló küldése
                          </button>
                          <button
                            onClick={async () => {
                              if (loading === selected.id) return;
                              setLoading(selected.id);
                              try {
                                const res = await fetch(`/api/admin/bookings/${selected.id}/remind`, { method: "POST" });
                                const data = await res.json();
                                if (!data.success) throw new Error(data.error);
                                alert("Fizetési emlékeztető elküldve!");
                              } catch (e: any) {
                                alert("Hiba: " + (e?.message ?? "Ismeretlen hiba"));
                              } finally {
                                setLoading(null);
                              }
                            }}
                            disabled={loading === selected.id}
                            className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Fizetési emlékeztető küldése
                          </button>
                        </>
                      )}
                    </section>
                  )}

                  {/* Státusz műveletek */}
                  {(selected.status === "PENDING" || selected.status === "CONFIRMED") && (
                    <section className="flex gap-2 pt-1">
                      {selected.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(selected.id, "CONFIRMED")}
                            disabled={loading === selected.id}
                            className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium transition-colors"
                          >
                            Jóváhagyás
                          </button>
                          <button
                            onClick={() => { setCancelNote(""); setConfirmDelete(false); setSendCancelEmail(true); setCancelModal(true); }}
                            disabled={loading === selected.id}
                            className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium transition-colors"
                          >
                            Elutasítás
                          </button>
                        </>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Előleg rögzítés modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full sm:max-w-md space-y-4">
            <h3 className="font-serif text-lg text-stone-800">Előleg rögzítése</h3>

            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">Fizetés dátuma</label>
              <input
                type="date"
                value={depositForm.paidAt}
                onChange={(e) => setDepositForm((f) => ({ ...f, paidAt: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">Befizetett összeg (Ft)</label>
              <input
                type="number"
                value={depositForm.paidAmount}
                onChange={(e) => setDepositForm((f) => ({ ...f, paidAmount: e.target.value }))}
                placeholder="pl. 30000"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">Fizetési mód</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "transfer", label: "Átutalás" },
                  { value: "revolut",  label: "Revolut" },
                  { value: "cash",     label: "Készpénz" },
                  { value: "szep",     label: "OTP SZÉP kártya" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDepositForm((f) => ({ ...f, paidMethod: value }))}
                    className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                      depositForm.paidMethod === value
                        ? "border-forest-600 bg-forest-50 text-forest-800"
                        : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{saveError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setDepositModal(null); setSaveError(null); }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                Mégse
              </button>
              <button
                onClick={() => markDepositPaid(depositModal)}
                disabled={loading === depositModal}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard size={14} />
                Rögzítés & email küldés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Törlés / elutasítás modal */}
      {cancelModal && selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full sm:max-w-md">
            <h3 className="font-serif text-lg text-stone-800 mb-1">
              {confirmDelete ? "Foglalás törlése" : "Foglalás elutasítása"}
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              <strong>{selected.guestName}</strong> foglalása {confirmDelete ? "véglegesen törlésre kerül" : "elutasításra kerül"}.
            </p>
            <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendCancelEmail}
                onChange={(e) => setSendCancelEmail(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-red-600 focus:ring-red-300"
              />
              <span className="text-sm text-stone-600">E-mail küldése a vendégnek</span>
            </label>
            {sendCancelEmail && (
              <>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Megjegyzés a vendégnek (opcionális)
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
                  placeholder="pl. Az időszak sajnos már nem elérhető, elnézést kérünk..."
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                />
              </>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setCancelModal(false); setConfirmDelete(false); }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                Mégsem
              </button>
              <button
                onClick={async () => {
                  setCancelModal(false);
                  if (confirmDelete) {
                    setConfirmDelete(false);
                    await deleteBooking();
                  } else {
                    await updateStatus(selected.id, "CANCELLED", cancelNote || undefined, sendCancelEmail);
                  }
                }}
                disabled={loading === selected.id}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {confirmDelete
                  ? (sendCancelEmail ? "Törlés + email küldés" : "Törlés")
                  : (sendCancelEmail ? "Elutasítás + email küldés" : "Elutasítás")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
