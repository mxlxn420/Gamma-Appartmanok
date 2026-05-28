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
        <p className="text-stone-400 text-sm mb-12">Hatályos: 2026. január 1-től</p>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">1. Az adatkezelő adatai</h2>
            <p>Adatkezelő neve: Gamma Apartmanok és Jakuzzi</p>
            <p>Cím: 3519 Miskolctapolca, Beregi utca 11</p>
            <p>Telefon: +36 20 359 9222</p>
            <p>E-mail: <a href="mailto:gammaapartmanok@gmail.com" className="text-forest-700 underline">gammaapartmanok@gmail.com</a></p>
            <p className="mt-3 text-sm text-stone-500">
              Az adatkezelő nem köteles adatvédelmi tisztviselő (DPO) kinevezésére, mivel az adatkezelés
              nem minősül nagy kockázatú vagy különleges adatokat érintő tevékenységnek.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">2. Az adatkezelés jogalapja és célja</h2>
            <p>Adatait az alábbi jogalapokon és célokból kezeljük:</p>
            <div className="mt-3 space-y-3">
              <div className="bg-stone-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-stone-800">Szerződés teljesítése – GDPR 6. cikk (1) b)</p>
                <p className="mt-1 text-stone-600">Szállásfoglalás lebonyolítása, visszaigazolása és a vendéggel való kapcsolattartás. Az adatmegadás a foglalási szerződés megkötésének feltétele – enélkül nem tudunk szállást biztosítani.</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-stone-800">Jogi kötelezettség teljesítése – GDPR 6. cikk (1) c)</p>
                <p className="mt-1 text-stone-600">Vendégkönyv vezetése, NTAK bejelentési kötelezettség, számlázás és pénzügyi nyilvántartás a számviteli törvény alapján.</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-stone-800">Jogos érdek – GDPR 6. cikk (1) f)</p>
                <p className="mt-1 text-stone-600">A foglalási rendszer biztonsága, visszaélések megelőzése.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">3. A kezelt személyes adatok köre</h2>
            <p>Online foglalás során az alábbi adatokat kérjük el:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Teljes név</li>
              <li>E-mail-cím</li>
              <li>Telefonszám</li>
              <li>Lakcím</li>
              <li>Érkezés és távozás időpontja</li>
              <li>Vendégek száma és összetétele (felnőttek, gyermekek, babák)</li>
              <li>Fizetési mód</li>
              <li>Esetleges megjegyzés / különleges kérés</li>
            </ul>
            <p className="mt-3">
              Bankkártyás fizetés esetén a kártyaadatokat kizárólag a Stripe fizetési szolgáltató kezeli;
              mi ezeket az adatokat nem látjuk és nem tároljuk.
            </p>
            <p className="mt-3">
              Jogszabályi kötelezettség alapján a bejelentkezéskor személyazonosító okmány bemutatása szükséges
              (útlevél vagy személyi igazolvány), amelynek adatait a vendégkönyvbe rögzítjük.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">4. Az adatkezelés időtartama</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Foglalási és számlázási adatok: a foglalást követő <strong>8 évig</strong> (számviteli törvény, 2000. évi C. tv. 169. § alapján)</li>
              <li>Vendégkönyv adatai: a jogszabályban előírt ideig</li>
              <li>Törölt vagy lemondott foglalások adatai: az eredeti foglalás dátumától számított 8 évig, amennyiben számlázási kötelezettség keletkezett; egyéb esetben haladéktalanul töröljük</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">5. Adatfeldolgozók és adattovábbítás</h2>
            <p>
              Személyes adatait az alábbi adatfeldolgozóknak továbbítjuk, kizárólag az adott szolgáltatás
              nyújtásához szükséges mértékben:
            </p>
            <div className="mt-3 space-y-3 text-sm">
              <div className="border border-stone-200 rounded-xl p-4">
                <p className="font-semibold text-stone-800">NTAK – Nemzeti Turisztikai Adatszolgáltató Központ</p>
                <p className="text-stone-600 mt-1">Jogszabályi kötelezettség alapján a szálláshely-szolgáltatók kötelesek a vendégadatokat bejelenteni. Jogalap: GDPR 6. cikk (1) c).</p>
              </div>
              <div className="border border-stone-200 rounded-xl p-4">
                <p className="font-semibold text-stone-800">Resend (e-mail szolgáltatás)</p>
                <p className="text-stone-600 mt-1">A foglalási visszaigazolók és emlékeztetők kézbesítéséhez. Adatait kizárólag az üzenet továbbításához használja. Resend Inc., USA – GDPR megfelelőség: standard szerződési záradékok (SCC) alapján.</p>
              </div>
              <div className="border border-stone-200 rounded-xl p-4">
                <p className="font-semibold text-stone-800">Stripe (online fizetés)</p>
                <p className="text-stone-600 mt-1">Bankkártyás fizetés feldolgozásához. A kártyaadatok kizárólag a Stripe rendszerében kerülnek kezelésre; mi azokat nem látjuk. Stripe, Inc., USA – PCI DSS Level 1 tanúsítvánnyal rendelkezik; GDPR megfelelőség: SCC alapján.</p>
              </div>
              <div className="border border-stone-200 rounded-xl p-4">
                <p className="font-semibold text-stone-800">Neon (adatbázis-szolgáltatás)</p>
                <p className="text-stone-600 mt-1">A foglalási adatok tárolása biztonságos, titkosított PostgreSQL adatbázisban történik. Neon Inc., USA – GDPR megfelelőség: SCC alapján; adatok EU régióban tárolva.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              Harmadik országba (EGT-n kívülre) történő adattovábbítás kizárólag a fentiek szerint,
              megfelelő garanciák (standard szerződési záradékok) alkalmazásával valósul meg.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">6. Az érintett jogai</h2>
            <p>A GDPR alapján Önnek az alábbi jogai vannak:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Hozzáférés joga (15. cikk):</strong> tájékoztatást kérhet arról, hogy milyen adatait kezeljük</li>
              <li><strong>Helyesbítés joga (16. cikk):</strong> kérheti pontatlan vagy hiányos adatai kijavítását</li>
              <li><strong>Törlés joga (17. cikk):</strong> kérheti adatai törlését, ha az adatkezelés célja megszűnt és jogszabály nem kötelez megőrzésre</li>
              <li><strong>Adatkezelés korlátozása (18. cikk):</strong> kérheti az adatkezelés felfüggesztését meghatározott esetekben</li>
              <li><strong>Adathordozhatóság joga (20. cikk):</strong> kérheti adatait géppel olvasható formátumban (szerződéses jogalap esetén)</li>
              <li><strong>Tiltakozás joga (21. cikk):</strong> tiltakozhat a jogos érdeken alapuló adatkezelés ellen</li>
            </ul>
            <p className="mt-4">
              Kérelmére <strong>30 napon belül</strong> válaszolunk (GDPR 12. cikk). Összetett esetekben
              ez az határidő legfeljebb további 60 nappal meghosszabbítható, amelyről tájékoztatjuk Önt.
            </p>
            <p className="mt-3">Jogai gyakorlásához forduljon hozzánk:</p>
            <p>E-mail: <a href="mailto:gammaapartmanok@gmail.com" className="text-forest-700 underline">gammaapartmanok@gmail.com</a></p>
            <p>Telefon: +36 20 359 9222</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">7. Jogorvoslat</h2>
            <p>
              Ha úgy véli, hogy adatkezelésünk megsérti a GDPR rendelkezéseit, panaszt tehet a
              Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):
            </p>
            <p className="mt-2">Cím: 1055 Budapest, Falk Miksa utca 9–11.</p>
            <p>Telefon: +36 1 391 1400</p>
            <p>Web: <a href="https://naih.hu" target="_blank" rel="noopener noreferrer" className="text-forest-700 underline">naih.hu</a></p>
            <p className="mt-3">
              Emellett az Ön lakóhelye vagy tartózkodási helye szerinti EU-tagállam felügyeleti hatóságához
              is fordulhat, illetve bírósági jogorvoslattal is élhet.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">8. Cookie-k (sütik)</h2>
            <p>
              Weboldalunk kizárólag a működéshez elengedhetetlenül szükséges munkamenet-cookie-kat alkalmaz
              (pl. admin bejelentkezési munkamenet). Ezek a sütik nem igényelnek hozzájárulást, mivel
              a weboldal alapvető működéséhez szükségesek.
            </p>
            <p className="mt-3">
              Harmadik fél által elhelyezett nyomkövető, elemző vagy marketing cookie-kat nem alkalmazunk.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">9. Adatbiztonság</h2>
            <p>
              Személyes adatait titkosított kapcsolaton (HTTPS/TLS) keresztül kezeljük. Az adatbázisban
              tárolt adatok nyugalmi állapotban is titkosítva vannak. Rendszeres biztonsági mentéseket
              végzünk az adatvesztés megelőzése érdekében.
            </p>
            <p className="mt-3">
              Adatvédelmi incidens (pl. jogosulatlan hozzáférés) esetén a GDPR 33. cikke alapján
              72 órán belül bejelentjük azt a felügyeleti hatóságnak, és szükség esetén az érintetteket
              is értesítjük.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest-900 mb-3">10. Tájékoztató módosítása</h2>
            <p>
              Fenntartjuk a jogot, hogy jelen tájékoztatót módosítsuk. Lényeges változás esetén
              a weboldalon értesítjük látogatóinkat, és frissítjük a hatályosság dátumát.
              Az aktuális verzió mindig ezen az oldalon érhető el.
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
