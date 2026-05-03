import { Quote } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const REVIEWS = [
  {
    name:     "Tamás Gubis",
    score:    10,
    text:     "Csendre, nyugalomra vágytunk a Párommal. Helyi, és közelben lévő látványosságban nincs hiány, ha valaki szeretné megismerni a Bükk adta gyönyörű látnivalókat. Teljes mértékben elégedettek voltunk a jól felszerelt szálláshellyel.",
    initials: "TG",
    type:     "Páros",
  },
  {
    name:     "Annamari Ujvári",
    score:    10,
    text:     "Szuper felszereltségű kis ház, minden van, amit az ember csak el tud képzelni!",
    initials: "AU",
    type:     "Páros",
  },
  {
    name:     "Alexandra Deák",
    score:    9,
    text:     "Gyönyörű szép, tökéletes a pihenésre és csendes. A tulajdonos borzasztóan kedves és aranyos!",
    initials: "AD",
    type:     "Családi",
  },
  {
    name:     "Ilona Molnár",
    score:    9,
    text:     "Nagyon szép és rendezett minden. Nekünk nagyon tetszett minden, és csak ajánlani tudom mindenkinek.",
    initials: "IM",
    type:     "Páros",
  },
  {
    name:     "Zsolt Mészáros",
    score:    10,
    text:     "Ha tehetem, visszatérek - kiváló hely, barátságos tulajdonos, nagyszerű elhelyezkedés.",
    initials: "ZM",
    type:     "Páros",
  },
];

const OVERALL_RATING = 9.4;
const BOOKING_URL    = "https://www.booking.com/hotel/hu/gamma-apartman.html?ssne=Miskolctapolca&ssne_untouched=Miskolctapolca&highlighted_hotels=7923262&ss=Miskolctapolca&dest_id=7923262&dest_type=hotel&hp_avform=1&origin=hp&do_availability_check=1&label=apartmani-gama-dskenvNUWmVmIb23SSY3cQS631993302664%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-1651362902379%3Alp9062927%3Ali%3Adec%3Adm%3Appccp%3DUmFuZG9tSVYkc2RlIyh9YavywThF4buZMwppv9IhQn0&sid=9a2ad2c4a127b005b0fdbe29517fdac8&aid=319854&lang=hu&sb=1&src_elem=sb&src=hotel&checkin=2026-06-22&checkout=2026-06-24&group_adults=3&no_rooms=1&group_children=0#tab-reviews";


export default function ReviewsSection() {
  return (
    <section id="ertekelesek" className="section-py bg-forest-900 overflow-hidden">
      <div className="container-custom">

        {/* Fejléc */}
        <AnimatedSection className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-terra-300 text-xs font-medium tracking-[0.2em] uppercase mb-4">
            <span className="h-px w-8 bg-terra-400/60" />
            Értékelések
            <span className="h-px w-8 bg-terra-400/60" />
          </div>
          <h2 className="font-serif text-display-lg font-light text-cream mb-6">
            Vendégeink mondták
          </h2>

          {/* Összesített értékelés */}
          <div className="inline-flex flex-col items-center gap-3 bg-white/10 rounded-2xl px-8 py-5 border border-white/10">
            <div className="flex items-center gap-4">
              <span className="font-serif text-5xl font-light text-cream">
                {OVERALL_RATING.toFixed(1)}
              </span>
              <div className="flex flex-col items-start gap-1.5">
                <span className="text-sm font-semibold text-terra-300">/ 10</span>
                <p className="text-cream/60 text-xs">
                  Booking.com értékelések alapján
                </p>
              </div>
            </div>
            
              <a href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-terra-300 hover:text-terra-200 transition-colors"
            >
              Összes értékelés megtekintése →
            </a>
          </div>
        </AnimatedSection>

        {/* Értékelés kártyák */}
        <div className="flex flex-wrap justify-center gap-5">
          {REVIEWS.map((review, i) => (
            <AnimatedSection
              key={i}
              delay={i * 0.1}
              className="w-full md:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] bg-white/8 border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/12 transition-colors duration-300"
            >
              {/* Idézőjel */}
              <Quote size={22} className="text-terra-400/40 mb-4 shrink-0" />

              {/* Szöveg */}
              <p className="text-cream/75 text-sm leading-relaxed flex-1 mb-5">
                {review.text}
              </p>

              {/* Lábléc */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-cream font-medium text-xs shrink-0">
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-cream text-sm font-medium leading-none mb-0.5">
                        {review.name}
                      </p>
                      <p className="text-cream/40 text-xs">Booking.com</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-serif text-xl font-light text-terra-300">{review.score}</span>
                    <span className="text-xs text-cream/30">/10</span>
                  </div>
                </div>
                <span className="text-xs text-terra-400/70 bg-terra-400/10 px-2 py-0.5 rounded-full">
                  {review.type}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Booking.com attribúció */}
        <div className="mt-10 text-center">
          <a href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cream/30 hover:text-cream/50 transition-colors"
          >
            Powered by Booking.com
          </a>
        </div>

      </div>
    </section>
  );
}