"use client";

import { useState }           from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingStore }    from "@/store/bookingStore";
import ApartmentSelector      from "@/components/booking/ApartmentSelector";
import GuestSelector          from "@/components/booking/GuestSelector";
import BookingCalendar        from "@/components/booking/BookingCalendar";
import BookingForm            from "@/components/booking/BookingForm";
import BookingSuccess         from "@/components/booking/BookingSuccess";

export type BookingStep = "apartments" | "guests" | "calendar" | "form" | "success";

export interface SelectedApartment {
  id:         string;
  name:       string;
  slug:       string;
  maxGuests:  number;
  coverImage: string | null;
}

export interface ApartmentGuests {
  id:            string;
  name:          string;
  slug:          string;
  maxGuests:     number;
  coverImage:    string | null;
  adults:   number;
  children: number;  // 2-17 év, felnőtt ár, IFA nélkül
  babies:   number;  // 0-2 év, első ingyenes, többi felnőtt ár
}

export interface SelectedService {
  id:          string;
  name:        string;
  pricingType: "PER_NIGHT" | "PER_BOOKING";
  price:       number | null;
  quantity:    number;
  nights:      number;
  total:       number;
}

export interface BookingData {
  apartmentGuests: ApartmentGuests[];
  checkIn:         Date;
  checkOut:        Date;
  // Összesített vendégszámok (minden apartman)
  guests:          number;
  adults:          number;
  children:        number;
  babies:          number;
  nights:          number;
  weekdayNights:   number;
  weekendNights:   number;
  weekdayRate:     number;
  weekendRate:     number;
  totalPrice:      number;
  basePrice:       number;
  childPrice2to6:  number;
  childPrice6to12: number;
  guestSurcharge:  number;
  touristTax:      number;
  discountPercent: number;
  discountAmount:  number;
  discountName:    string;
}

const STEPS: BookingStep[] = ["apartments", "guests", "calendar", "form", "success"];
const STEP_LABELS = ["1. Apartman", "2. Vendégek", "3. Dátum", "4. Adatok", "5. Kész"];

export default function BookingPage() {
  const store = useBookingStore();
  const [step, setStep]                               = useState<BookingStep>("apartments");
  const [selectedApartments, setSelectedApartments]   = useState<SelectedApartment[]>([]);
  const [apartmentGuests, setApartmentGuests]         = useState<ApartmentGuests[]>([]);
  const [bookingData, setBookingData]                 = useState<BookingData | null>(null);
  const [bookingId, setBookingId]                     = useState<string | null>(null);

  const goTo = (s: BookingStep) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <div className="container-custom max-w-4xl">

        {/* Fejléc */}
        <div className="text-center mb-12">
          <div className="section-badge">Foglalás</div>
          <h1 className="font-serif text-display-lg font-light text-forest-900">
            Gamma Apartmanok
          </h1>
        </div>

        {/* Lépés indikátor */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {STEPS.map((key, i) => {
            const currentIdx = STEPS.indexOf(step);
            const isDone     = i < currentIdx;
            const isActive   = step === key;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive ? "bg-forest-600 text-white"
                  : isDone  ? "bg-forest-100 text-forest-700"
                  : "bg-stone-100 text-stone-400"
                }`}>
                  {STEP_LABELS[i]}
                </div>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-stone-200" />}
              </div>
            );
          })}
        </div>

        {/* Tartalom */}
        <AnimatePresence mode="wait">
          {step === "apartments" && (
            <motion.div key="apartments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
              <ApartmentSelector
                onNext={(apts) => { setSelectedApartments(apts); goTo("guests"); }}
              />
            </motion.div>
          )}

          {step === "guests" && (
            <motion.div key="guests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
              <GuestSelector
                apartments={selectedApartments}
                onBack={() => goTo("apartments")}
                onNext={(guests) => { setApartmentGuests(guests); goTo("calendar"); }}
              />
            </motion.div>
          )}

          {step === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
              <BookingCalendar
                apartmentGuests={apartmentGuests}
                onBack={() => goTo("guests")}
                onNext={(data) => { setBookingData(data); goTo("form"); }}
              />
            </motion.div>
          )}

          {step === "form" && bookingData && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
              <BookingForm
                bookingData={bookingData}
                onBack={() => goTo("calendar")}
                onSuccess={(id, finalTotal) => {
                  setBookingId(id);
                  setBookingData((prev) => prev ? { ...prev, totalPrice: finalTotal } : prev);
                  goTo("success");
                  store.reset();
                }}
              />
            </motion.div>
          )}

          {step === "success" && bookingData && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <BookingSuccess bookingData={bookingData} bookingId={bookingId ?? ""} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
