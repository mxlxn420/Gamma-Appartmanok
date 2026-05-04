import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default async function PricingSection() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      dateFrom: { not: null },
      dateTo: { gte: today },
    },
    orderBy: { priority: "asc" },
  });

  const minPrice = rules.length > 0
    ? Math.min(...rules.map((r) => r.pricePerNight))
    : null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("hu-HU").format(price);

  return (
    <section id="arak" className="section-py bg-cream">
      <div className="container-custom">

        <AnimatedSection className="text-center mb-16">
          <div className="section-badge">Árak</div>
          <h2 className="font-serif text-display-lg font-light text-forest-900 mb-4">
            Átlátható árazás
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            Nincsenek rejtett költségek.
          </p>
        </AnimatedSection>

        {/* Legalacsonyabb ár */}
        <AnimatedSection className="flex flex-col items-center mb-12">
          <div className="bg-forest-900 rounded-3xl px-12 py-10 text-center shadow-luxury max-w-sm w-full">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-cream/50 mb-3">
              Már ennyitől
            </p>
            {minPrice ? (
              <>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="font-serif text-5xl font-light text-cream">
                    {formatPrice(minPrice)}
                  </span>
                  <span className="text-cream/60 text-lg">Ft</span>
                </div>
                <p className="text-cream/50 text-sm mb-6">/ éj</p>
              </>
            ) : (
              <p className="text-cream/60 text-sm mb-6">Hamarosan</p>
            )}
            <ul className="space-y-2 mb-6 text-left">
              {["Privát jacuzzi", "Ingyenes WiFi", "Ingyenes parkoló"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-terra-400 shrink-0" />
                  <span className="text-cream/80">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/foglalas" className="btn-accent w-full justify-center">
              Foglaljon most <ArrowRight size={15} />
            </Link>
          </div>
        </AnimatedSection>

        {/* Egyéb díjak */}
        <AnimatedSection className="bg-white rounded-3xl p-8 mb-10 max-w-2xl mx-auto shadow-card">
          <h3 className="font-serif text-xl text-forest-900 mb-5">Egyéb díjak</h3>
          <div className="divide-y divide-stone-100">
            <div className="flex justify-between py-3 text-sm">
              <span className="text-stone-600">IFA (18+ évesekre)</span>
              <span className="font-medium text-stone-800">450 Ft / fő / éj</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-stone-600">0–2 éves baba</span>
              <span className="font-medium text-stone-800">Ingyenes</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-stone-600">Háziállat</span>
              <span className="font-medium text-stone-800">Nem tudunk fogadni</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-stone-600">Dohányzás</span>
              <span className="font-medium text-stone-800">Nem megengedett</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-stone-600">Bulik, rendezvények</span>
              <span className="font-medium text-stone-800">Nem engedélyezett</span>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}