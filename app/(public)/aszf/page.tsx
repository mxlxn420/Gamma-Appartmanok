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
        <p className="text-stone-400 text-sm mb-12">Hatályos: 2025. január 1-től</p>

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
              Előleg fizetése esetén annak összege és határideje a visszaigazoló e-mailben kerül közlésre.
              Az előleg megfizetésével a foglalás véglegesnek minősül.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">5. Lemondási feltételek</h2>
            <p>
              A lemondási feltételek szezononként eltérhetnek, és a foglalás visszaigazolásában kerülnek feltüntetésre.
              Amennyiben a vendég a megadott határidőn belül mondja le a foglalást, az előleg visszajár.
              Késői lemondás esetén az előleg megtartásra kerülhet.
            </p>
            <p>
              Lemondani telefonon (+36 20 359 9222) vagy e-mailben (gammaapartmanok@gmail.com) lehetséges.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">6. Bejelentkezés és kijelentkezés</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bejelentkezés: 14:00–20:00 között</li>
              <li>Kijelentkezés: 10:00-ig</li>
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
              <li>Dohányzás a szállás egész területén tilos.</li>
              <li>Háziállat behozatala nem engedélyezett.</li>
              <li>A vendégek kötelesek a szállást rendeltetésszerűen használni és a berendezési tárgyakat megóvni.</li>
              <li>Az okozott károkért a vendég anyagi felelősséggel tartozik.</li>
              <li>Kérjük, tartsák tiszteletben a szomszédokat – a csendes óra 22:00–08:00 között érvényes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">9. Felelősségkorlátozás</h2>
            <p>
              A szolgáltató nem vállal felelősséget a vendég személyes tárgyaiban, vagyonában bekövetkező
              károkért, kivéve, ha azok a szolgáltató szándékos magatartásából vagy súlyos gondatlanságából
              erednek. A vendégek értéktárgyainak biztonságos elhelyezéséről saját maguk gondoskodnak.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">10. Panaszkezelés</h2>
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
            <h2 className="font-serif text-xl text-forest-900 mb-3">11. Irányadó jog</h2>
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
