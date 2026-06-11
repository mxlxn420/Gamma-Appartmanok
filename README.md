# Gamma Apartmanok és Jakuzzi — Vendégház

Vendégház foglalási és adminisztrációs rendszer. A Gamma Apartmanok és Jakuzzi (Miskolctapolca, 4 apartman) számára készült Next.js alapú webalkalmazás, teljes online foglalási folyamattal, online fizetéssel és admin felülettel.

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Frontend | Next.js 16 (App Router), React 18 |
| Stílus | Tailwind CSS, Framer Motion |
| State | Zustand |
| Backend | Next.js API Routes |
| Adatbázis | PostgreSQL (Neon) + Prisma 7 |
| Fizetés | Stripe (bankkártya) |
| Email | Resend |
| Képtárolás | Cloudflare R2 |
| Rate limiting | Upstash Redis |

---

## Funkciók

**Vendégoldal**
- Foglalási naptár dátumválasztóval és vendégszám megadással (akár több apartmanra egyszerre)
- Valós idejű árkalkuláció (szezonális, hétvégi, gyerekárak, kedvezmények, IFA)
- Elérhetőség ellenőrzés (saját foglalások + iCal-szinkronizált külső foglaltságok)
- Extra szolgáltatások (reggeli, romantikus bekészítés stb.)
- 5 fizetési mód: bankkártya (Stripe), készpénz, átutalás, Revolut, OTP SZÉP kártya
- Galéria, kapcsolatfelvétel, ÁSZF, adatvédelmi tájékoztató

**Admin felület** (`/admin`)
- Foglalások kezelése (jóváhagyás, lemondás, előleg, fizetve státusz)
- Havi foglalási naptár
- Időszak blokkolás (pl. karbantartás)
- Szezonális árszabályok és előleg/lemondási szabályok
- Kedvezmények kezelése
- Extra szolgáltatások szerkesztése
- Hero szekció, Rólunk, Felszereltség, Galéria szerkesztő
- iCal szinkron (Szállás.hu, Booking.com, Airbnb, Appartman.hu)

---

## Fejlesztői indítás

```bash
npm install
npm run dev
```

Az alkalmazás a `http://localhost:3000` címen érhető el.

---

## Környezeti változók

Hozz létre egy `.env.local` fájlt a gyökérkönyvtárban:

```env
# Adatbázis (Neon PostgreSQL)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Admin auth
ADMIN_PASSWORD=...
ADMIN_SESSION_TOKEN=...

# Email (Resend)
RESEND_API_KEY=...
FROM_EMAIL=...
ADMIN_EMAIL=...

NEXT_PUBLIC_SITE_URL=...

# Cloudflare R2 (képtárolás)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
NEXT_PUBLIC_R2_HERO_URL=...
NEXT_PUBLIC_R2_GALLERY_URL=...
NEXT_PUBLIC_R2_ABOUT_URL=...
NEXT_PUBLIC_R2_EXTRA_SERVICES_URL=...
NEXT_PUBLIC_R2_APARTMENTS_URL=...

# Stripe (bankkártyás fizetés)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Cron (iCal szinkron)
CRON_SECRET=...

# iCal feedek (globális)
ICAL_SZALLAS_HU=
ICAL_BOOKING_COM=
ICAL_APPARTMAN_HU=

# iCal feedek (apartmanonként, gamma-1..gamma-4)
ICAL_SZALLAS_HU_GAMMA_1=
ICAL_SZALLAS_HU_GAMMA_2=
ICAL_SZALLAS_HU_GAMMA_3=
ICAL_SZALLAS_HU_GAMMA_4=
ICAL_BOOKING_COM_GAMMA_1=
ICAL_BOOKING_COM_GAMMA_2=
ICAL_BOOKING_COM_GAMMA_3=
ICAL_BOOKING_COM_GAMMA_4=
ICAL_AIRBNB_GAMMA_2=
ICAL_AIRBNB_GAMMA_3=
ICAL_AIRBNB_GAMMA_4=

# Google értékelések (opcionális)
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=...
```

A Prisma CLI-hez szükséges egy `prisma.config.ts` a gyökérkönyvtárban (nincs verziókezelve):

```ts
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
```

---

## Adatbázis

```bash
npx prisma db push      # séma szinkronizálás
npx prisma generate     # kliens generálás
npx prisma studio       # adatbázis böngésző
npm run db:seed         # kezdeti adatok feltöltése
```

---

## Parancsok

```bash
npm run dev       # fejlesztői szerver (port 3000)
npm run build     # production build (prisma generate + next build)
npm run start     # production szerver
npm run lint      # ESLint
```
