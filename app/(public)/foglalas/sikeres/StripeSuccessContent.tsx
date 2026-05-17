"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function StripeSuccessContent() {
  const params    = useSearchParams();
  const bookingId = params.get("bookingId") ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-forest-900 flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle size={36} className="text-cream" />
      </motion.div>

      <h2 className="font-serif text-display-md font-light text-forest-900 mb-3">
        Sikeres fizetés!
      </h2>
      <p className="text-stone-500 mb-2">
        Bankkártyás fizetésed sikeresen beérkezett. Hamarosan e-mailben visszaigazolást küldünk.
      </p>
      {bookingId && (
        <p className="text-xs text-stone-400 mb-8">
          Foglalási azonosító: <strong className="text-forest-700">{bookingId}</strong>
        </p>
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-forest-700 hover:text-forest-900 transition-colors"
      >
        <ArrowLeft size={14} />
        Vissza a főoldalra
      </Link>
    </motion.div>
  );
}
