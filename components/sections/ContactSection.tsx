"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Hiba történt");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Hiba történt. Kérjük próbálja újra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kapcsolat" className="section-py bg-cream">
      <div className="container-custom">

        <AnimatedSection className="text-center mb-16">
          <div className="section-badge">Kapcsolat</div>
          <h2 className="font-serif text-display-lg font-light text-forest-900">
            Vegye fel velünk a kapcsolatot
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          <AnimatedSection direction="left" className="space-y-8">
            <div className="space-y-5">
              {[
                { icon: MapPin, label: "Cím", value: "3519 Miskolctapolca, Beregi utca 11." },
                { icon: Phone, label: "Telefon", value: "+36 20 359 9222" },
                { icon: Mail, label: "E-mail", value: "gammaapartmanok@gmail.com" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-forest-900/8 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-forest-700" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-stone-800 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bejelentkezési infó */}
            <div className="bg-forest-900 rounded-2xl p-6 text-cream">
              <p className="text-xs tracking-[0.2em] uppercase text-cream/50 mb-4">Tudnivalók</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cream/60">Bejelentkezés</span><span>15:00 – 00:00</span></div>
                <div className="flex justify-between"><span className="text-cream/60">Kijelentkezés</span><span>8:00 – 11:00</span></div>
                <div className="flex justify-between"><span className="text-cream/60">Max. vendég</span><span>4 fő</span></div>
                <div className="flex justify-between"><span className="text-cream/60">NTAK</span><span>MA21027231</span></div>
                <div className="flex justify-between"><span className="text-cream/60">Háziállat</span><span>Nem tudunk fogadni</span></div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl overflow-hidden shadow-card h-56">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2666.1200384756376!2d20.7463474767372!3d48.0693258559098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47409f721c28f079%3A0xce829f7d15e260b5!2sGamma%20Apartmanok!5e0!3m2!1shu!2shu!4v1777851018328!5m2!1shu!2shu"
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gamma Apartmanok – Bencések útja 117/A"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-forest-900 rounded-3xl p-10 text-center text-cream"
              >
                <div className="w-16 h-16 rounded-full bg-terra-400/20 flex items-center justify-center mx-auto mb-5">
                  <Send size={28} className="text-terra-300" />
                </div>
                <h3 className="font-serif text-2xl mb-3">Üzenet elküldve!</h3>
                <p className="text-cream/60">Hamarosan felvesszük Önnel a kapcsolatot.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-card space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">Név *</label>
                    <input className="input-base" placeholder="Kovács Anna" required
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">Telefon</label>
                    <input className="input-base" placeholder="+36 30 ..."
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">E-mail *</label>
                  <input className="input-base" type="email" placeholder="email@example.com" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1.5">Üzenet *</label>
                  <textarea className="input-base resize-none" rows={5} placeholder="Írjon nekünk..." required
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
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
                      <Send size={15} /> Üzenet küldése
                    </span>
                  )}
                </button>
              </form>
            )}
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}