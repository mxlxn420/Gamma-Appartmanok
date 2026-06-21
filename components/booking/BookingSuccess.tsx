"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Users, ArrowLeft } from "lucide-react";
import { formatDateHu, formatCurrency } from "@/lib/utils";
import type { BookingData } from "./BookingPage";

interface Props {
  bookingData: BookingData;
  bookingId: string;
}

export default function BookingSuccess({ bookingData, bookingId }: Props) {
  return (
    <motion.div
      className="max-w-xl mx-auto text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ikon */}
      <motion.div
        className="w-20 h-20 rounded-full bg-terra-400 flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle size={36} className="text-cream" />
      </motion.div>

      <h2 className="font-serif text-display-md font-light text-forest-900 mb-3">
        Foglalás elküldve!
      </h2>
      <p className="text-stone-500 mb-2">
        Hamarosan e-mailben visszaigazolást küldünk.
      </p>
      <p className="text-xs text-stone-400 mb-8">
        Foglalási azonosító: <strong className="text-forest-700">{bookingId}</strong>
      </p>

      {/* Összefoglaló kártya */}
      <div className="bg-white rounded-3xl shadow-card p-8 text-left mb-8">
        <h3 className="font-serif text-lg text-forest-900 mb-5">Foglalás részletei</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-forest-700 shrink-0" />
            <div className="flex justify-between w-full">
              <span className="text-stone-500">Érkezés – Távozás</span>
              <span className="text-stone-800 font-medium">
                {formatDateHu(bookingData.checkIn)} – {formatDateHu(bookingData.checkOut)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users size={16} className="text-forest-700 shrink-0" />
            <div className="flex justify-between w-full">
              <span className="text-stone-500">Vendégek</span>
              <span className="text-stone-800 font-medium">{bookingData.guests} fő · {bookingData.nights} éjszaka</span>
            </div>
          </div>
          <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold">
            <span className="text-stone-700">Végösszeg</span>
            <span className="text-forest-900 text-lg">{formatCurrency(bookingData.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-terra-100 rounded-2xl p-5 text-left mb-8 text-sm text-terra-700">
        <p className="font-medium mb-1">Mi történik ezután?</p>
        <ul className="space-y-1 text-terra-600">
          <li>✓ E-mail visszaigazolás 24 órán belül</li>
          <li>✓ A fizetéssel kapcsolatos részletek a visszaigazolóban szerepelnek</li>
          <li>✓ Bejelentkezési információk e-mailben érkezés előtt</li>
        </ul>
      </div>

      <Link href="/" className="btn-secondary inline-flex items-center gap-2">
        <ArrowLeft size={15} /> Vissza a főoldalra
      </Link>
    </motion.div>
  );
}