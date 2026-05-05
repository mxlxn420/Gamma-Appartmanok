import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Adatvédelmi tájékoztató – Gamma Apartmanok",
  description: "Adatvédelmi tájékoztató – Gamma Apartmanok és Jakuzzi, Miskolctapolca",
};

export default function AdatvedelemPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="container-custom max-w-3xl">

        <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-forest-800 transition-colors mb-10">
          <ArrowLeft size={15} />
          Vissza a főoldalra
        </Link>

        <h1 className="font-serif text-4xl text-forest-900 mb-2">Adatvédelmi tájékoztató</h1>
        <p className="text-stone-400 text-sm mb-12">Hatályos: 2025. január 1-től</p>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">1. Az adatkezelő adatai</h2>
            <p>Adatkezelő neve: Gamma Apartmanok és Jakuzzi</p>
            <p>Cím: 3519 Miskolctapolca, Beregi utca 11</p>
            <p>Telefon: +36 20 359 9222</p>
            <p>E-mail: gammaapartmanok@gmail.com</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">2. Az adatkezelés jogalapja és célja</h2>
            <p>
              Az adatkezelés jogalapja az érintett önkéntes hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont),
              illetve szerződés teljesítése (GDPR 6. cikk (1) bekezdés b) pont).
            </p>
            <p className="mt-3">Az adatkezelés céljai:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Szállásfoglalás lebonyolítása és visszaigazolása</li>
              <li>Kapcsolattartás a vendéggel</li>
              <li>Jogszabályi kötelezettségek teljesítése (pl. vendégkönyv, NTAK bejelentés)</li>
              <li>Számlázás és pénzügyi nyilvántartás</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">3. A kezelt személyes adatok köre</h2>
            <p>Foglalás során az alábbi adatokat kérjük meg:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Teljes név</li>
              <li>E-mail-cím</li>
              <li>Telefonszám</li>
              <li>Érkezés és távozás időpontja</li>
              <li>Vendégek száma (felnőttek, gyermekek)</li>
              <li>Fizetési mód</li>
              <li>Esetleges megjegyzés / különleges kérés</li>
            </ul>
            <p className="mt-3">
              Jogszabályi kötelezettség alapján a bejelentkezéskor személyazonosító okmány bemutatása szükséges
              (útlevél vagy személyi igazolvány), amelynek adatait a vendégkönyvbe rögzítjük.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">4. Az adatkezelés időtartama</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Foglalási adatok: a foglalást követő 5 évig (számviteli törvény alapján)</li>
              <li>Vendégkönyv adatai: jogszabályban meghatározott ideig</li>
              <li>Hozzájárulás visszavonása esetén: az adatokat haladéktalanul töröljük,
                kivéve ha jogszabály hosszabb megőrzési kötelezettséget ír elő</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">5. Adattovábbítás</h2>
            <p>
              Az Ön személyes adatait harmadik félnek nem adjuk át, kivéve az alábbi eseteket:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>NTAK (Nemzeti Turisztikai Adatszolgáltató Központ):</strong> jogszabályi
                kötelezettség alapján a szálláshely-szolgáltatók kötelesek a vendégadatokat bejelenteni.
              </li>
              <li>
                <strong>E-mail küldő szolgáltatás:</strong> a foglalási visszaigazolók küldéséhez
                külső e-mail szolgáltatót (Resend) veszünk igénybe, amely az adatokat kizárólag
                az üzenet kézbesítéséhez használja.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">6. Az érintett jogai</h2>
            <p>Önnek joga van:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Hozzáféréshez:</strong> tájékoztatást kérhet a kezelt adatairól</li>
              <li><strong>Helyesbítéshez:</strong> kérheti pontatlan adatai kijavítását</li>
              <li><strong>Törléshez:</strong> kérheti adatai törlését, ha az adatkezelés már nem szükséges</li>
              <li><strong>Az adatkezelés korlátozásához</strong></li>
              <li><strong>Hordozhatósághoz:</strong> kérheti adatait géppel olvasható formátumban</li>
              <li><strong>Tiltakozáshoz:</strong> tiltakozhat az adatkezelés ellen</li>
            </ul>
            <p className="mt-3">
              Jogai gyakorlásához forduljon hozzánk az alábbi elérhetőségeken:
            </p>
            <p>E-mail: gammaapartmanok@gmail.com</p>
            <p>Telefon: +36 20 359 9222</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">7. Jogorvoslat</h2>
            <p>
              Ha úgy véli, hogy adatkezelésünk sérti a GDPR rendelkezéseit, panaszt tehet a
              Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):
            </p>
            <p className="mt-2">Cím: 1055 Budapest, Falk Miksa utca 9–11.</p>
            <p>Telefon: +36 1 391 1400</p>
            <p>Web: naih.hu</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">8. Cookie-k (sütik)</h2>
            <p>
              Weboldalunk kizárólag a működéshez szükséges munkamenet-cookie-kat használ (pl. admin bejelentkezés).
              Harmadik fél által elhelyezett nyomkövető vagy marketing cookie-kat nem alkalmazunk.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">9. Adatbiztonság</h2>
            <p>
              Az Ön személyes adatait biztonságos, titkosított kapcsolaton (HTTPS) keresztül kezeljük.
              Az adatok tárolása megbízható, európai adatközpontban üzemelő felhőszolgáltatáson
              (Supabase/PostgreSQL) történik.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">10. Tájékoztató módosítása</h2>
            <p>
              Fenntartjuk a jogot, hogy jelen tájékoztatót módosítsuk. A változásokról a weboldalon
              értesítjük látogatóinkat. Az aktuális verzió mindig ezen az oldalon érhető el.
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
