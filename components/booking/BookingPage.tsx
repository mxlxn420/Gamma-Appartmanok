"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import ApartmentSelector from "@/components/booking/ApartmentSelector";
import BookingCalendar   from "@/components/booking/BookingCalendar";
import BookingForm       from "@/components/booking/BookingForm";
import BookingSuccess    from "@/components/booking/BookingSuccess";

export type BookingStep = "apartments" | "calendar" | "form" | "success";

export interface SelectedApartment {
  id:        string;
  name:      string;
  slug:      string;
  maxGuests: number;
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
  apartments:           SelectedApartment[];
  checkIn:              Date;
  checkOut:             Date;
  guests:               number;
  adults:               number;
  teens:                number;
  babies:               number;
  children2to6:         number;
  children6to12:        number;
  nights:               number;
  weekdayNights:        number;
  weekendNights:        number;
  weekdayRate:          number;
  weekendRate:          number;
  totalPrice:           number;
  basePrice:            number;
  childPrice2to6:       number;
  childPrice6to12:      number;
  guestSurcharge:       number;
  touristTax:           number;
  discountPercent:      number;
  discountAmount:       number;
  discountName:         string;
}

export default function BookingPage() {
  const store = useBookingStore();
  const [step, setStep]                           = useState<BookingStep>("apartments");
  const [selectedApartments, setSelectedApartments] = useState<SelectedApartment[]>([]);
  const [bookingData, setBookingData]             = useState<BookingData | null>(null);
  const [bookingId, setBookingId]                 = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <div className="container-custom max-w-4xl">

        {/* Fejléc */}
        <div className="text-center mb-12">
          <div className="section-badge">Foglalás</div>
          <h1 className="font-serif text-display-lg font-light text-forest-900">
            Milán Kuckó foglalása
          </h1>
          <p className="text-stone-500 mt-3">
            Bencések útja 117/A, Miskolctapolca · Max. 4 fő
          </p>
        </div>

        {/* Lépés indikátor */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[
            { key: "apartments", label: "1. Apartman" },
            { key: "calendar",   label: "2. Dátum"    },
            { key: "form",       label: "3. Adatok"   },
            { key: "success",    label: "4. Kész"     },
          ].map(({ key, label }, i) => {
            const steps: BookingStep[] = ["apartments", "calendar", "form", "success"];
            const currentIdx = steps.indexOf(step);
            const thisIdx    = steps.indexOf(key as BookingStep);
            const isDone     = thisIdx < currentIdx;
            const isActive   = step === key;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive ? "bg-forest-900 text-cream"
                  : isDone  ? "bg-forest-100 text-forest-700"
                  : "bg-stone-100 text-stone-400"
                }`}>
                  {label}
                </div>
                {i < 3 && <div className="w-8 h-px bg-stone-200" />}
              </div>
            );
          })}
        </div>

        {/* Tartalom */}
        <AnimatePresence mode="wait">
          {step === "apartments" && (
            <motion.div
              key="apartments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <ApartmentSelector
                onNext={(apts) => {
                  setSelectedApartments(apts);
                  setStep("calendar");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          )}

          {step === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <BookingCalendar
                selectedApartments={selectedApartments}
                onBack={() => { setStep("apartments"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onNext={(data) => {
                  setBookingData({ ...data, apartments: selectedApartments });
                  setStep("form");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          )}

          {step === "form" && bookingData && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <BookingForm
                bookingData={bookingData}
                onBack={() => { setStep("calendar"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onSuccess={(id, finalTotal) => {
                  setBookingId(id);
                  setBookingData((prev) => prev ? { ...prev, totalPrice: finalTotal } : prev);
                  setStep("success");
                  store.reset();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          )}

          {step === "success" && bookingData && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <BookingSuccess
                bookingData={bookingData}
                bookingId={bookingId ?? ""}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}