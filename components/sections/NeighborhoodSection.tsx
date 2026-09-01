import AnimatedSection from "@/components/ui/AnimatedSection";
import NeighborhoodTabs, { type NeighborhoodCategory } from "@/components/sections/NeighborhoodTabs";

const CATEGORIES: NeighborhoodCategory[] = [
  {
    id: "ettermek",
    label: "Éttermek",
    icon: "Utensils",
    items: [
      { name: "Rossita Pizzéria",                  note: "Házhozszállítás H–P: 11:00 – 22:00 Sz–V: 12:00 – 22:00",           address: "Miskolc, Meggyesalja utca 18, 3530",  url: "https://rossita.hu/",                               phone: "+36 46 344 300",    desc: "Miskolc egyik legjobb és legnépszerűbb étterme, széles ételválasztékkal. Házhozszállítást is vállalnak, szóval ha egy estét inkább otthon töltenél, ez a legjobb választás." },
      { name: "Calimbra Wellness Hotel étterme",   note: "Gyalog H–V: 0:00 – 23:59",                                         address: "Bencések útja 9, 3519",               url: "https://calimbrawellnesshotel.hu/gasztronomia",     phone: "+36 46 799 200",    desc: "A szomszédos wellness hotel elegáns étterme, ahol minőségi fogásokat kínálnak kellemes környezetben. Gyalog is elérhető az apartmanoktól." },
      { name: "Kemencés Étterem",                  note: "Gyalog H–P: 11:00 – 20:00 Sz: 11:30 – 22:00 V: 11:30 – 20:00",     address: "Csabai út 36, 3519",                  url: "https://www.tapolcafogado.hu/?m=14",                phone: "+36 46 562 215",    desc: "Hagyományos magyar konyha kemencés ételekkel, otthonos, meleg hangulatban. Ideális ha egy igazi, autentikus hazai ízekre vágysz." },
      { name: "Villamerica Steakhouse",            note: "Gyalog H–V: 12:00 – 21:30",                                        address: "Miskolctapolcai út 41, 3519",         url: "https://villamerica.hu/steakhouse/hu/",             phone: "+36 20 363 0314",   desc: "Ha húsevős hangulatban vagy, ez a hely a tökéletes választás. Változatos steakek és grill fogások, hangulatos steakhouse környezetben." },
      { name: "Fald Fel Amerikát",                 note: "Gyalog H–V: 12:00 – 22:00",                                        address: "Miskolctapolcai út 41, 3519",         url: null,                                                phone: "+36 20 363 0314",   desc: "Ha a hamburger számodra nem egyszerű gyorskaja, hanem komoly élmény, ez a hely neked szól. Kézműves burgerek több méretben, pulled pork szendvicsek, hot-dogok, burritók és amerikai desszertkülönlegességek várnak. Az étlapon akadnak igazi kihívások is — a legbátrabbaknak például egy 5 húspogácsás, 5 szelet cheddaros szörnyeteg. Online is rendelhető, házhozszállítással." },
      { name: "Tusculanum Vendéglő",               note: "Gyalog H–Cs: 12:00 – 20:00 P: 12:00 – 21:00 V: 12:00 – 20:00",     address: "Zilahi utca 7, 3519",                 url: "https://tusculanumvendeglo.hu/",                    phone: "+36 46 792 103",    desc: "Miskolctapolca egyik legkedveltebb étterme, 4.5-os Google értékeléssel, közvetlenül a barlangfürdő közelében. Autentikus magyar konyha, ahol a helyi, tájjellegű fogások mellett a világkonyha ízei is megtalálhatók — gluténmentes, laktózmentes és vegetáriánus opciókkal is. A vendégek különösen dicsérik a tyúkhúslevest, az Apáca Sóhaját, az ördöglángost és a bécsi szeletet. Élőzenés estek és terasz is várja a vendégeket, házhozszállítás is igénybe vehető." },
      { name: "Lignum Bistro & Café",              note: "Gyalog H–V: 11:00 – 22:00",                                        address: "Csabai út 4-6, 3519",                 url: "https://lignumbistro.hu/",                          phone: "+36 70 414 7944",   desc: "A Lignum Hotel földszintjén, Miskolctapolca szívében található bisztró nemzetközi és hagyományos magyar ételekkel várja vendégeit, friss, hazai termelőktől származó alapanyagokból. Hétköznap változatos napimenüt kínálnak, olasz kávékülönlegességekkel, házi szörpökkel és kézműves süteményekkel. Elvitelre és házhozszállításra is van lehetőség." },
    ],
  },
  {
    id: "boltok",
    label: "Boltok",
    icon: "ShoppingBag",
    items: [
      { name: "Tapolca ABC", note: "Gyalog · 6:30 – 20:00",                          address: "Fagyöngy utca 3, 3519",      url: null, phone: null, desc: "Kis kisbolt gyalog pár percre, ha gyorsan kellene valami. Reggel 6-tól este 10-ig nyitva, szóval reggeli hozzávalókért vagy esti snackért tökéletes." },
      { name: "Lidl",        note: "Autóval · H–Sz: 6:30 – 21:00 V: 7:00 – 19:00",         address: "Csermőkei út 207, 3533",   url: null, phone: null, desc: "A legközelebbi nagyobb bevásárlási lehetőség autóval pár percre. Ha komolyabb bevásárlást tervezel, ide érdemes menni." },
    ],
  },
  {
    id: "furdok",
    label: "Fürdők",
    icon: "Waves",
    items: [
      { name: "Miskolctapolca Barlangfürdő",      note: "Termálvíz", address: "Pazár István sétány 1, 3519",              url: "https://barlangfurdo.hu/",    phone: "+36 46 560 030",  desc: "Az egyik leghíresebb magyar gyógyfürdő, amely egy természetes barlangrendszerben található. Egyedülálló élmény, a meleg gyógyvíz és a barlang különleges hangulata garantáltan emlékezetes marad." },
      { name: "Ellipsum Élmény és Strandfürdő",   note: "Csúszdák · HCV: 10:00 – 19:00",  address: "Aradi sétány 1, 3519",        url: "https://ellipsumfurdo.hu/",   phone: "+36 70 339 3288", desc: "Modern strandfürdő csúszdákkal, élménymedencékkel és strandolási lehetőséggel. Családoknak és fiataloknak egyaránt remek szórakozást nyújt." },
    ],
  },
  {
    id: "cukraszdak",
    label: "Cukrászdák",
    icon: "IceCream",
    items: [
      { name: "A Fekvő Róka Cukrászda", note: "Gyalog H–V: 11:00 – 19:00", address: "Pazár István sétány 2, 3519", url: "https://fekvoroka.hu/", phone: "+36 30 080 7444", desc: "Miskolctapolca egyik legújabb és leghangulatosabb cukrászdája, közvetlenül a Barlangfürdő kapujában. A klasszikus francia hangulatot idéző enteriőrben hagyományos és mentes desszertek, helyben főzött fagylalt, gourmet franciapirítós és kávékülönlegességek várnak. Tökéletes megálló egy barlangfürdős nap előtt vagy után." },
      { name: "Balajti Cukrászda",      note: "Gyalog H–V: 11:00 – 19:00", address: "Miskolctapolcai út 41/B, 3519", url: "https://balajticukraszda.hu/", phone: "+36 46 785 882", desc: "Több mint 50 éves családi hagyomány áll e cukrászda mögött — a történet id. Balajti László forrói cukrászdájával kezdődött, és 2006 óta Miskolctapolcán folytatódik, változatlan receptúrával és minőséggel. Fürdőzés után különösen jól esik kiülni a napos teraszra egy adag frissen készült fagylaltra vagy süteményre." },
    ],
  },
  {
    id: "latnivalok",
    label: "Látnivalók",
    icon: "Landmark",
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
  return (
    <section id="kornyek" className="section-py bg-cream">
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

        <NeighborhoodTabs categories={CATEGORIES} />

      </div>
    </section>
  );
}
