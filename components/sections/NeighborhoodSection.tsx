"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ShoppingBag, Waves, Landmark, ExternalLink, Phone, MapPin, Clock } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const CATEGORIES = [
  {
    id: "ettermek",
    label: "Éttermek",
    Icon: Utensils,
    items: [
      { name: "Rossita",                           note: "Házhozszállítás H–P: 11:00 – 22:00 Sz–V: 12:00 – 22:00",         address: "Miskolc, Meggyesalja utca 18, 3530",  url: "https://rossita.hu/",                               phone: "+36 46 344 300",    desc: "Miskolc egyik legjobb és legnépszerűbb étterme, széles ételválasztékkal. Házhozszállítást is vállalnak, szóval ha egy estét inkább otthon töltenél, ez a legjobb választás." },
      { name: "Calimbra Wellness Hotel étterme",   note: "Gyalog H–V: 0:00 – 23:59",                                       address: "Bencések útja 9, 3519",               url: "https://calimbrawellnesshotel.hu/gasztronomia",     phone: "+36 46 799 200",    desc: "A szomszédos wellness hotel elegáns étterme, ahol minőségi fogásokat kínálnak kellemes környezetben. Gyalog is elérhető az apartmanoktól." },
      { name: "Kemencés Étterem",                  note: "Gyalog H–P: 11:00 – 20:00 Sz: 11:30 – 22:00 V: 11:30 – 20:00",   address: "Csabai út 36, 3519",                  url: "https://www.tapolcafogado.hu/?m=14",                phone: "+36 46 562 215",    desc: "Hagyományos magyar konyha kemencés ételekkel, otthonos, meleg hangulatban. Ideális ha egy igazi, autentikus hazai ízekre vágysz." },
      { name: "Villamerica Steakhouse",            note: "Gyalog H–V: 12:00 – 21:30",                                      address: "Miskolctapolcai út 41, 3519",         url: "https://villamerica.hu/steakhouse/hu/",             phone: "+36 20 363 0314",   desc: "Ha húsevős hangulatban vagy, ez a hely a tökéletes választás. Változatos steakek és grill fogások, hangulatos steakhouse környezetben." },
    ],
  },
  {
    id: "boltok",
    label: "Boltok",
    Icon: ShoppingBag,
    items: [
      { name: "Tapolca ABC", note: "Gyalog · 6:30 – 20:00",                          address: "Fagyöngy utca 3, 3519",      url: null, phone: null, desc: "Kis kisbolt gyalog pár percre, ha gyorsan kellene valami. Reggel 6-tól este 10-ig nyitva, szóval reggeli hozzávalókért vagy esti snackért tökéletes." },
      { name: "Lidl",        note: "Autóval · H–Sz: 6:30 – 21:00 V: 7:00 – 19:00",         address: "Csermőkei út 207, 3533",   url: null, phone: null, desc: "A legközelebbi nagyobb bevásárlási lehetőség autóval pár percre. Ha komolyabb bevásárlást tervezel, ide érdemes menni." },
    ],
  },
  {
    id: "furdok",
    label: "Fürdők",
    Icon: Waves,
    items: [
      { name: "Miskolctapolca Barlangfürdő",      note: "Termálvíz", address: "Pazár István sétány 1, 3519",              url: "https://barlangfurdo.hu/",    phone: "+36 46 560 030",  desc: "Az egyik leghíresebb magyar gyógyfürdő, amely egy természetes barlangrendszerben található. Egyedülálló élmény, a meleg gyógyvíz és a barlang különleges hangulata garantáltan emlékezetes marad." },
      { name: "Ellipsum Élmény és Strandfürdő",   note: "Csúszdák · H–V: 10:00 – 19:00",  address: "Aradi sétány 1, 3519",        url: "https://ellipsumfurdo.hu/",   phone: "+36 70 339 3288", desc: "Modern strandfürdő csúszdákkal, élménymedencékkel és strandolási lehetőséggel. Családoknak és fiataloknak egyaránt remek szórakozást nyújt." },
    ],
  },
  {
    id: "latnivalok",
    label: "Látnivalók",
    Icon: Landmark,
    items: [
      { name: "Miskolci Állatkert és Kultúrpark",       note: "H–V: 9:00 – 19:00",                     address: "Miskolc, Csanyik-völgy, 3535", url: "https://www.miskolczoo.hu/", phone: "+36 46 332 121", desc: "130 állatfajt bemutató kert a Bükk lábánál, közel 700 egyeddel. Gyerekekkel különösen ajánlott, egész napot el lehet tölteni." },
      { name: "Színháztörténeti és Színészmúzeum",      note: "K–V: 9:00 – 17:00",                     address: "Miskolc, Déryné utca 3, 3525", url: "https://hermuz.hu/hullamok_hatan/", phone: "+36 70 943 2916", desc: "Magyarország első kőszínházának helyén álló múzeum, interaktív kiállításokkal és archív felvételekkel. Kultúra iránt érdeklődőknek kötelező." },
      { name: "Kohászati Múzeum",                       note: "Felsőhámor, Cs–Sz: 10:00 – 16:00",      address: "Miskolc, Palota utca 22, 3517", url: null, phone: "+36 46 379 375", desc: "A hazai vaskohászat történetét bemutató egyedülálló múzeum Lillafüred közelében, az Anna-barlang szomszédságában. Technika- és történelemkedvelőknek ajánlott." },
      { name: "Lézerpont Látványtár",                   note: "H–P: 9:00 – 18:00, Szo: 9:00 – 14:00",  address: "	3531 Miskolc, Győri kapu 57.", url: null, phone: "+36 46 428 111", desc: "Különleges gyűjtemény: népi viseletek, régi kismesterségek, ásványok és optikatörténet egy helyen. Hétfőtől péntekig 9–18, szombaton 9–14 óráig látogatható." },
      { name: "Szeleta Park Látogatóközpont",           note: "K–V: 10:00 – 20:00",                    address: "Miskolc, Hegyalja utca 245, 3535", url: "https://www.szeletapark.hu/hu", phone: "+36 30 452 6158", desc: "A Bükki Nemzeti Park látogatóközpontja interaktív kiállításokkal a barlangokról, az ősemberről és a Bükk természetéről. 5–12 éveseknek beltéri kalandpark is várja a kicsiket." },
      { name: "Lillafüredi Függőkert és Vízesés",       note: "Lillafüred",                            address: null, url: null, phone: null, desc: "A lillafüredi palotaszálló melletti teraszos kert és a Szinva-vízesés az egyik legromantikusabb kirándulóhely a környéken. Sétánya több tematikus teraszból áll." },
      { name: "Anna Mésztufa Barlang",                  note: "Május–Szeptember H–V: 10:00 – 16:00",   address: "Miskolc, Hámor sétány 1, 3517", url: "https://www.bnpi.hu/hu/reszletek/anna-barlang-miskolc-lillafured", phone: "+36 46 334 130", desc: "Fokozottan védett barlang Lillafüreden, amely 150–200 ezer éve keletkezett. Túravezetővel látogatható, csak májustól szeptemberig van nyitva." },
      { name: "Szent István Barlang",                   note: "Egész évben H–V: 9:00 – 17:00",         address: "Miskolc, Egri Országút, 3517", url: "https://www.bnpi.hu/hu/reszletek/szent-istvan-barlang", phone: "+36 46 334 130", desc: "Lillafüred másik látogatható barlangja, egész évben nyitva tart. Több mint 1000 méter járattal és 94 méter szintkülönbséggel lenyűgöző természeti látvány." },
      { name: "Herman Ottó Emlékház",                   note: "Lillafüred K–V: 9:00 – 17:00",          address: "Miskolc, Erzsébet sétány 33, 3517", url: "https://pelelak.hermuz.hu/", phone: "+36 46 370 703", desc: "A neves természettudós lillafüredi nyaralója, ahol nyarait töltötte és tudományos munkáit írta. Megújult állandó kiállítással várja a látogatókat." },
      { name: "Diósgyőri Vár",                          note: "Diósgyőr",                              address: "Miskolc, Vár utca 24, 3534", url: "https://www.diosgyorivar.hu/", phone: "+36 46 533 355", desc: "2014-ben felújított középkori vár Miskolc szívében, Közép-Európa legnagyobb lovagterméével. Gyerekeknek és felnőtteknek egyaránt élménydús kirándulás." },
      { name: "Eger",                                   note: "Világhírú borok",                       address: "Eger, 3300", url: null, phone: null, desc: "Kb. 1 óra autóval, de megéri: középkori vár, a legészakibb török minaret Európában, gyógyfürdők és a világhírű Szépasszony-völgy boraival." },
      { name: "Tokaj",                                  note: "Világhírű borok",                       address: "Tokaj, 3910", url: null, phone: null, desc: "Kb. 1 óra autóval, a tokaji borvidék fővárosa. Borpincék, Rákóczi kastély és friss tiszai halételek várnak a Tisza és a Bodrog találkozásánál." },
      { name: "Aggtelek",                               note: "UNESCO",                                address: "Aggtelek, 3759", url: null, phone: null, desc: "UNESCO Világörökség részeként nyilvántartott barlangrendszer, a Baradla-barlanggal. Kb. 1,5 óra autóval, de felejthetetlen természeti élmény." },
      { name: "Bükkszentkereszt",                       note: "Bükk",                                  address: "Bükkszentkereszt, 3557", url: null, phone: null, desc: "Hangulatos bükki kis falu, amelynek gyökerei egy 1755-ben alapított üveghutáig nyúlnak vissza. Természetjáróknak, csendet keresőknek ideális." },
      { name: "Répáshuta – Bükki Csillagda",            note: "Bükk Sze–V: 9:30 – 18:00",              address: "Répáshuta, külterület, hrsz. 016/5, 3559", url: "https://www.bukkicsillagda.hu/hu", phone: "+36 30 965 1874", desc: "Planetárium, megtapogatható meteoritok, virtuális űrutazás és Napot is megfigyelni képes távcső egy helyen. Gyerekeknek és felnőtteknek egyaránt lenyűgöző élmény." },
    ],
  },
];

export default function NeighborhoodSection() {
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0].id);

  const active = CATEGORIES.find((c) => c.id === activeTab)!;

  return (
    <section id="kornyek" className="section-py bg-white">
      <div className="container-custom max-w-4xl">

        <AnimatedSection className="text-center mb-12">
          <div className="section-badge">Környék</div>
          <h2 className="font-serif text-display-lg font-light text-forest-900">
            Mit talál a közelben?
          </h2>
          <p className="text-stone-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Miskolctapolca és a Bükk rengeteg programot kínál – éttermektől fürdőkig, váraktól barlangokon át.
          </p>
        </AnimatedSection>

        {/* Tab gombok */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? "bg-forest-900 text-cream shadow-md"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tartalom */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {active.items.map((item, i) => (
              <div
                key={i}
                className="bg-stone-50 rounded-2xl p-4 border border-stone-100 hover:border-forest-200 hover:shadow-card transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm leading-snug">{item.name}</p>
                    {item.note && (
                      <span className="inline-flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full mt-1">
                        <Clock size={10} />
                        {item.note}
                      </span>
                    )}
                    {item.desc && (
                      <p className="text-xs text-stone-500 mt-2 leading-relaxed">{item.desc}</p>
                    )}
                    {item.address && (
                      <p className="flex items-center gap-1 text-xs text-stone-400 mt-1.5">
                        <MapPin size={10} className="shrink-0" />
                        {item.address}
                      </p>
                    )}
                    {item.phone && (
                      <a
                        href={`tel:${item.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-1 text-xs text-stone-400 hover:text-forest-700 mt-1 transition-colors"
                      >
                        <Phone size={10} className="shrink-0" />
                        {item.phone}
                      </a>
                    )}
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-8 h-8 rounded-xl bg-forest-900 flex items-center justify-center hover:bg-forest-700 transition-colors"
                      aria-label={`${item.name} webhely`}
                    >
                      <ExternalLink size={13} className="text-cream" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
