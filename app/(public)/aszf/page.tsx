import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "ÁSZF – Gamma Apartmanok",
  description: "Általános Szerződési Feltételek – Gamma Apartmanok és Jakuzzi, Miskolctapolca",
};

export default function AszfPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="container-custom max-w-3xl">

        <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-forest-800 transition-colors mb-10">
          <ArrowLeft size={15} />
          Vissza a főoldalra
        </Link>

        <h1 className="font-serif text-4xl text-forest-900 mb-2">Általános Szerződési Feltételek</h1>
        <p className="text-stone-400 text-sm mb-12">Hatályos: 2025. január 1-től · Utoljára frissítve: 2026. június 15.</p>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">1. A szolgáltató adatai</h2>
            <p>Szolgáltató neve: Gamma Apartmanok és Jakuzzi</p>
            <p>Cím: 3519 Miskolctapolca, Beregi utca 11</p>
            <p>Telefon: +36 20 359 9222</p>
            <p>E-mail: gammaapartmanok@gmail.com</p>
            <p>NTAK regisztrációs szám: MA21027231</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">2. A foglalás menete</h2>
            <p>
              A foglalás a weboldalon elérhető foglalási rendszeren keresztül, vagy telefonon / e-mailben adható le.
              A foglalás akkor válik érvényessé, amikor a vendég visszaigazoló e-mailt kap a szolgáltatótól.
            </p>
            <p>
              A foglalás leadásakor a vendég köteles megadni nevét, e-mail-címét, telefonszámát, a vendégek számát,
              az érkezés és távozás tervezett időpontját, valamint a választott fizetési módot.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">3. Árak és díjak</h2>
            <p>
              A weboldalon feltüntetett árak a szállás éjszakai díját tartalmazzák, az aktuálisan érvényes szezonális
              árszabás szerint, a vendégszám függvényében.
            </p>
            <p>Az árakon felül az alábbi díjak kerülnek felszámításra:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Idegenforgalmi adó (IFA): 450 Ft / fő / éj (18 éven felüliekre)</li>
              <li>0–2 éves gyermekek: ingyenes</li>
            </ul>
            <p className="mt-3">
              Az árak forintban (HUF) értendők és tartalmazzák az ÁFÁ-t.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">4. Fizetési feltételek</h2>
            <p>Az elfogadott fizetési módok:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Készpénz</li>
              <li>Bankkártya</li>
              <li>Banki átutalás</li>
              <li>OTP SZÉP kártya</li>
            </ul>
            <p className="mt-3">
              A fizetendő összeg mértéke és a fizetési határidő a visszaigazoló e-mailben kerül közlésre.
              A foglalás a fizetendő összeg határidőre történő beérkezésével válik véglegessé.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">5. Lemondási feltételek</h2>
            <p>
              Érkezés előtti 15. napig kötbérmentesen lemondható a foglalás, ilyenkor a befizetett összeg
              teljes egészében visszajár. Az érkezés előtti 14–3. nap közötti lemondás esetén a foglalás
              értékének 50%-a, az érkezés előtti 3 napon belüli lemondás esetén 100%-a kötbérként kerül
              felszámításra.
            </p>
            <p>
              Lemondani telefonon (+36 20 359 9222) vagy e-mailben (gammaapartmanok@gmail.com) lehetséges.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">6. Bejelentkezés és kijelentkezés</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bejelentkezés: 15:00–00:00 között</li>
              <li>Kijelentkezés: 11:00-ig</li>
            </ul>
            <p className="mt-3">
              Ettől eltérő időpontban való érkezés esetén kérjük, előzetesen egyeztessen velünk.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">7. Minimális tartózkodás</h2>
            <p>
              A minimális tartózkodás időszakonként változik. Az aktuálisan érvényes minimum éjszakák száma
              a foglalási felületen kerül megjelenítésre.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">8. Házirend</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bejelentkezéskor a vendég köteles átadni a szállásadónak a személyazonosító okmányait (személyi igazolvány vagy útlevél, lakcímkártya), valamint a helyszínen fizetendő összeget. Az apartman csak a teljes díj megfizetése után vehető igénybe.</li>
              <li>Amennyiben a vendég a foglalt időszaknál korábban szakítja meg a tartózkodást, a fennmaradó éjszakák díja nem jár vissza.</li>
              <li>Bejelentkezés: 15:00–24:00 között, késéséről kérjük telefonon tájékoztassák a szállásadót. Kijelentkezés: 11:00-ig, vagy a szállásadóval előre egyeztetett időpontban.</li>
              <li>Érkezéskor a vendégek egyedi beléptető kódot kapnak az apartmanhoz; távozáskor az ajtókat be kell zárni.</li>
              <li>Takarítás: egy hétnél hosszabb tartózkodás esetén hetente egyszer ágynemű- és törölközőcsere történik. A tartózkodás alatt takarítást csak kérésre végzünk.</li>
              <li>A szobákat tisztán, kitakarítva adjuk át. Amennyiben a tisztasággal kapcsolatban probléma merül fel, kérjük érkezéskor jelezzék – utólagos reklamációt nem áll módunkban elfogadni.</li>
              <li>A szállás csak az előre egyeztetett létszámban vehető igénybe, melyet a szállásadó előzetes bejelentés nélkül is ellenőrizhet. Látogatók kizárólag napközben, a szállásadó engedélyével fogadhatók.</li>
              <li>Csendes pihenő: 22:00–08:00 között minden zajos tevékenység mellőzendő, kérjük tartsák tiszteletben a szomszédokat.</li>
              <li>Dohányzás (elektromos cigarettával és IQOS-szal együtt) az apartmanban tilos, csak az udvaron, a kijelölt hamutartók használatával engedélyezett. Az ebből eredő esetleges hatósági eljárás vagy bírság költsége a szabályt megszegő vendéget terheli.</li>
              <li>Háziállat behozatala nem engedélyezett.</li>
              <li>Az apartmanban hagyott személyes tárgyakért felelősséget nem vállalunk. A talált tárgyakat 2 hónapig megőrizzük, és kérésre a megadott címre postázzuk.</li>
              <li>A vendég felel saját viselkedéséért és az abból eredő balesetekért. A szállásadó nem vállal felelősséget az önhibáján kívül történt eseményekből eredő károkért (pl. természeti esemény, tűz, áramszünet, parkolóban keletkezett kár).</li>
              <li>A berendezési tárgyak (törölköző, párna, takaró stb.) nem vihetők el a szobából. A vendégek kötelesek a szállást rendeltetésszerűen használni és a berendezési tárgyakat megóvni; az okozott károkért anyagi felelősséggel tartoznak. Távozáskor az apartmant átnézzük.</li>
              <li>Gyúlékony anyag vagy eszköz behozatala a szobákba tilos, a tűzvédelmi előírásokat minden vendég köteles betartani.</li>
              <li>A szobákban étkezni nem lehet – étkezésre a konyha használata javasolt, melyet kérünk tisztán tartani, és a használt edényeket elmosni.</li>
              <li>Szelektív hulladékgyűjtés: a műanyag, alumínium és papír hulladékot kérjük a kijelölt sárga zsákokba és kukákba elhelyezni.</li>
              <li>A jelen házirend megszegése a foglalás azonnali felmondásához vezethet; ebben az esetben a hátralévő napok díja nem jár vissza.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">9. Jakuzzi és tetőterasz használati szabályzat</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>A jakuzzi és a napozóterasz 11:00–23:00 között, naponta egy előre egyeztetett, legfeljebb 1,5 órás idősávban, kizárólag az adott apartman vendégei számára, privát módon használható.</li>
              <li>A tetőterasz lezárt magánterületeire belépni tilos.</li>
              <li>A foglalás a jelen szabályzat elfogadását is jelenti. 14 év alatti gyermek csak 18 éven felüli felelős kísérővel tartózkodhat a tetőterasz területén, és nem használhatja a jakuzzit, ha a vízhőmérséklet meghaladja a 37°C-ot.</li>
              <li>A szolgáltató fenntartja a jogot, hogy a jakuzzi használatától elzárja a nem megfelelő higiéniai vagy egészségi állapotban lévő, illetve alkohol vagy egyéb tudatmódosító hatása alatt álló vendégeket.</li>
              <li>Alkohol és étel behozatala, fogyasztása, valamint üvegpohár vagy üveg bevitele a jakuzzi területére tilos. Műanyag poharak az apartman konyhájában elérhetők.</li>
              <li>A kezelőfelületen csak a JET és a világítás kapcsolható, a vízhőfok rögzített, nem állítható. A fúvókák és a levegő mennyisége a perem mentén lévő tekerőgombokkal szabályozható. Használat után a JET-et és a világítást ki kell kapcsolni, és a biztonsági termofedelet óvatosan vissza kell hajtani.</li>
              <li>A jakuzziban fürdőruha használata kötelező, használat előtt zuhanyozás szükséges, és utcai lábbeliben a teraszon tartózkodni tilos.</li>
              <li>A folyosón és a tetőteraszon a csúszásveszély miatt fokozott óvatosság szükséges. Be- és kiszállás előtt a masszázsfunkciókat ki kell kapcsolni.</li>
              <li>A jakuzziban egyszerre legfeljebb 5 fő tartózkodhat (1 fekvő és 4 ülőhely), a kapacitáskorlát betartása a vízminőség megőrzése érdekében kötelező.</li>
              <li>Amennyiben a vizet a nem szabályszerű használat (pl. belekerült étel, ital, vagy a megengedett létszám túllépése) miatt ki kell cserélni, ennek költségét – 10.000 Ft – a vendég köteles megtéríteni.</li>
              <li>A szolgáltató nem vállal felelősséget a jakuzzi és a tetőterasz használata során bekövetkező sérülésekért vagy balesetekért; az esetleges károk megtérítése a vendéget terheli.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">10. Felelősségkorlátozás</h2>
            <p>
              A szolgáltató nem vállal felelősséget a vendég személyes tárgyaiban, vagyonában bekövetkező
              károkért, kivéve, ha azok a szolgáltató szándékos magatartásából vagy súlyos gondatlanságából
              erednek. A vendégek értéktárgyainak biztonságos elhelyezéséről saját maguk gondoskodnak.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">11. Panaszkezelés</h2>
            <p>
              Amennyiben a vendégnek kifogása merül fel a szolgáltatással kapcsolatban, azt kérjük jelezze
              a tartózkodás ideje alatt személyesen, vagy utólag az alábbi elérhetőségeken:
            </p>
            <p className="mt-2">Telefon: +36 20 359 9222</p>
            <p>E-mail: gammaapartmanok@gmail.com</p>
            <p className="mt-3">
              A szóbeli panaszokat haladéktalanul, az írásbeli panaszokat 30 napon belül vizsgáljuk ki és válaszoljuk meg.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">12. Irányadó jog</h2>
            <p>
              Jelen ÁSZF-re a magyar jog az irányadó. A felek közötti jogvitában a magyar bíróságok rendelkeznek
              illetékességgel. Fogyasztói jogviták esetén a vendég a Fogyasztóvédelmi Hatósághoz vagy a
              területileg illetékes Békéltető Testülethez fordulhat.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-stone-200">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-forest-800 transition-colors">
            <ArrowLeft size={15} />
            Vissza a főoldalra
          </Link>
        </div>

      </div>
    </main>
  );
}
