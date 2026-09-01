import AnimatedSection from "@/components/ui/AnimatedSection";
import FaqAccordion, { type FaqItem } from "@/components/sections/FaqAccordion";

const FAQS: FaqItem[] = [
  { q: "Mikor van bejelentkezés és kijelentkezés?",          a: "Bejelentkezés: 15:00–00:00 között. Kijelentkezés: 11:00-ig. Eltérő időpont előzetesen egyeztethető." },
  { q: "Hogyan jutok be az apartmanba?",                     a: "Az apartmanba való belépés érintkezésmentesen történik, a bejárati ajtók egyedi belépőkóddal működnek. A kódot érkezés napján küldjük Önnek." },
  { q: "Hány főt tudnak elszállásolni az apartmanok?",              a: "A Gamma Apartmanok maximum 20 fő részére biztosít elhelyezést." },
  { q: "Szabad-e kisállatot hozni?",                         a: "Sajnos kisállatokat nem tudunk fogadni. Kérjük ennek tiszteletben tartását." },
  { q: "Hogyan működik a jakuzzi?",                          a: "Panorámás tetőteraszunkon egy közös 4-5 férőhelyes jakuzzi és napozóterasz található, melyet a helyszínen előre egyeztetett napi 1,5  órában 12-23 óra között privát használhatnak. Törölközőt biztosítunk, saját fürdőköpenyt kérjük hozzanak magukkal. A részletes használati szabályokat az ÁSZF Jakuzzi és tetőterasz használati szabályzat című szakasza tartalmazza." },
  { q: "Van-e lehetőség korai érkezésre vagy késői távozásra?", a: "Foglaltságtól függően, előzetes egyeztetés alapján van lehetőség korai érkezésre, illetve késői távozásra, esetlegesen felár ellenében." },
  { q: "Hogyan lehet lemondani, vagy módosítani a foglalást?",                 a: "A foglalás lemondására, vagy módosítására minden esetben írásban van lehetőség." },
  { q: "Van-e a közelben étterem vagy bevásárlási lehetőség?",a: "Legközelebb kb. 1,5 km távolságban találhatóak éttermek, de Miskolcon rengeteg helyről tudnak akár házhoz rendelni is. A közelben számos étterem kereshető fel, melyek között találnak Michelin ajánlásút is. Miskolctapolcán kb. 1,5 km-re található egy kisebb bolt, azonban 3,5 - 4 km távolságban található Lidl és Tesco is, illetve Miskolcon számtalan áruházból választhatnak. Az apartmanokban jól felszerelt konyha áll rendelkezésre." },
  { q: "Hány fő tartózkodhat egyszerre a jakuzziban?",        a: "A jakuzziban egyszerre legfeljebb 5 fő tartózkodhat (1 fekvő és 4 ülőhely). A kapacitáskorlát betartása a vízminőség megőrzése érdekében kötelező." },
  { q: "Mi történik, ha a jakuzzi vizét nem megfelelő használat miatt ki kell cserélni?", a: "Ha például ital vagy étel kerül a vízbe, vagy túllépik a megengedett létszámot, és ezért a vizet ki kell cserélni, ennek költségét – 10.000 Ft – a vendégnek kell megtérítenie." },
  { q: "Van takarítás a tartózkodás alatt?",                  a: "Egy hétnél hosszabb tartózkodás esetén hetente egyszer ágynemű- és törölközőcserét biztosítunk. A tartózkodás alatt takarítást csak külön kérésre végzünk." },
  { q: "Mit kell tudni a jakuzzi biztonságos használatáról?", a: "A jakuzziban fürdőruha használata kötelező, használat előtt zuhanyozás szükséges, és utcai lábbeliben a teraszon tartózkodni tilos. 14 év alatti gyermek csak 18 éven felüli felelős kísérővel mehet fel a tetőteraszra, és nem használhatja a jakuzzit, ha a vízhőmérséklet meghaladja a 37°C-ot." },
  { q: "Dohányozhatok az apartmanban?",                       a: "Az apartmanban – az elektromos cigarettával és IQOS-szal együtt – tilos a dohányzás, csak az udvaron, a kijelölt hamutartók használatával engedélyezett." },
  { q: "Mi van az ott hagyott személyes tárgyakkal?",         a: "Az apartmanban felejtett tárgyakat 2 hónapig megőrizzük, és kérésre a megadott címre postázzuk." },
];

export default function FaqSection() {
  return (
    <section id="gyik" className="section-py bg-cream">
      <div className="container-custom max-w-3xl">

        <AnimatedSection className="text-center mb-14">
          <div className="section-badge">GYIK</div>
          <h2 className="font-serif text-display-lg font-light text-forest-900">
            Gyakori kérdések
          </h2>
        </AnimatedSection>

        <FaqAccordion items={FAQS} />

      </div>
    </section>
  );
}
