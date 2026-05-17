function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestAddress?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  numberOfAdults?: number;
  totalPrice: number;
  bookingId: string;
  notes?: string | null;
  basePrice?: number;
  guestSurcharge?: number;
  touristTax?: number;
  depositAmount?: number;
  depositPercent?: number;
  freeCancelDays?: number;
  extraServices?: Array<{ name: string; total: number; quantity?: number; nights?: number; price?: number | null; pricingType?: string }>;
  extraServicesTotal?: number;
  paymentMethod?: string | null;
  discountPercent?: number;
  discountAmount?: number;
  numberOfTeens?: number;
  numberOfBabies?: number;
  numberOfChildren2to6?: number;
  numberOfChildren6to12?: number;
  childPrice2to6?: number;
  childPrice6to12?: number;
  apartments?: Array<{
    name: string;
    numberOfGuests: number;
    numberOfAdults: number;
    numberOfBabies?: number;
    breakdown: { count: number; rate: number }[];
    aptBasePrice: number;
    aptTouristTax: number;
  }>;
}

type ApartmentEmailEntry = {
  name: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfBabies?: number;
  breakdown: { count: number; rate: number }[];
  aptBasePrice: number;
  aptTouristTax: number;
};

function apartmentDescriptionHtml(apts?: ApartmentEmailEntry[]): string {
  if (!apts || apts.length === 0) return "";

  const has12 = apts.some(a => /Gamma [12]$/.test(a.name));
  const has34 = apts.some(a => /Gamma [34]$/.test(a.name));
  const names12 = apts.filter(a => /Gamma [12]$/.test(a.name)).map(a => a.name);
  const names34 = apts.filter(a => /Gamma [34]$/.test(a.name)).map(a => a.name);

  const blocks: string[] = [];

  if (has12) {
    const title = names12.join(" + ");
    blocks.push(`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:16px;">
      <tr><td style="padding:20px 24px;">
        <p style="font-family:sans-serif;font-size:13px;font-weight:700;color:#1a3a2a;margin:0 0 10px;">Az Ön apartmanja a ${escapeHtml(title)}</p>
        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 8px;">
          54 nm-es, 4 fős apartman. 1 hálószoba 180×200-as ággyal + nappali kihúzhatós kanapéval (140×200), teljesen felszerelt konyha étkező résszel, fürdőszoba, gardrób és kertkapcsolatos 20 nm-es terasszal.
        </p>
        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 8px;">
          Közös tetőteraszon napozóterasz és 5 férőhelyes jakuzzi található, amit a megjelölt 1,5 órában 11–23 óra között privát tudnak használni.
        </p>
        <p style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1a3a2a;margin:0;">Parkolás ingyenes!</p>
      </td></tr>
    </table>`);
  }

  if (has34) {
    const title = names34.join(" + ");
    blocks.push(`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:16px;">
      <tr><td style="padding:20px 24px;">
        <p style="font-family:sans-serif;font-size:13px;font-weight:700;color:#1a3a2a;margin:0 0 10px;">Az Ön apartmanja a ${escapeHtml(title)}</p>
        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 8px;">
          64 nm-es, 6 fős apartman. 2 hálószoba (160 és 180 cm-es ágyak) + nappali kanapé (380×200), fürdőszoba, teljesen felszerelt konyha étkező résszel és erkély.
        </p>
        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 8px;">
          Közös tetőteraszon napozóterasz és 5 férőhelyes jakuzzi található, amit a megjelölt 1,5 órában 11–23 óra között privát tudnak használni.
        </p>
        <p style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1a3a2a;margin:0;">Parkoló ingyenes!</p>
      </td></tr>
    </table>`);
  }

  return blocks.join("");
}

function apartmentPriceRowsHtml(apts: ApartmentEmailEntry[]): string {
  return apts.map(a => `
    <tr>
      <td colspan="2" style="font-family:sans-serif;font-size:12px;font-weight:700;color:#1a3a2a;padding:8px 0 2px;border-bottom:1px solid #e8d9b5;">
        ${escapeHtml(a.name)} – ${a.numberOfGuests} fő
      </td>
    </tr>
    ${a.breakdown.map(g => `
    <tr>
      <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:3px 0 3px 12px;border-bottom:1px solid #e8d9b5;">
        Szállás: ${g.count} éj × ${formatHuf(g.rate)}/éj
      </td>
      <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:3px 0;border-bottom:1px solid #e8d9b5;">
        ${formatHuf(g.count * g.rate)}
      </td>
    </tr>`).join("")}
    <tr>
      <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:3px 0 6px 12px;border-bottom:1px solid #d4c9a8;">
        IFA (${a.numberOfAdults} felnőtt × 450 Ft)
      </td>
      <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:3px 0 6px;border-bottom:1px solid #d4c9a8;">
        ${formatHuf(a.aptTouristTax)}
      </td>
    </tr>
  `).join("");
}

function formatHuf(amount: number): string {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDateWithDay(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  const days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
  const dayName = days[date.getUTCDay()];
  const formatted = date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${formatted} ${dayName}`;
}

function formatShortDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${d}.`;
}

function depositDeadlineDate(checkIn: string, freeCancelDays: number): string {
  const d = new Date(checkIn + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - (freeCancelDays + 1));
  return formatShortDate(d);
}

// ─── VENDÉG EMAIL HTML ───────────────────────────────────────
function guestEmailHtml(data: BookingEmailData): string {
  const depositPct = data.depositPercent ?? 30;
  const depositAmt = data.totalPrice;
  const remaining = 0;
  const adults = data.numberOfAdults ?? data.guests;
  const freeCancelDays = data.freeCancelDays ?? 11;
  const deadline = depositDeadlineDate(data.checkIn, freeCancelDays);
  const extras = data.extraServices?.filter(s => s.total > 0) ?? [];
  const penaltyFromDay = freeCancelDays - 1;
  const isCardPayment    = data.paymentMethod === "card";
  const isCashPayment    = data.paymentMethod === "cash";
  const isRevolutPayment = data.paymentMethod === "revolut";
  const isSzepPayment    = (data.paymentMethod ?? "").startsWith("szep");

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foglalás visszaigazolása</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,58,42,0.08);">

      <!-- Fejléc -->
      <tr>
        <td style="background:#1a3a2a;padding:36px 40px;text-align:center;">
          <p style="color:#f5f0e8;font-size:28px;font-weight:300;margin:0;letter-spacing:-0.02em;">Gamma Apartmanok</p>
          <p style="color:rgba(245,240,232,0.6);font-size:11px;margin:8px 0 0;font-family:sans-serif;letter-spacing:0.2em;text-transform:uppercase;">Miskolctapolca · Beregi utca 11</p>
        </td>
      </tr>

      <!-- Tartalom -->
      <tr><td style="padding:36px 40px;">

        <!-- Üdvözlés -->
        <p style="font-size:20px;color:#1a3a2a;margin:0 0 10px;">Kedves ${escapeHtml(data.guestName)}!</p>
        <p style="font-family:sans-serif;font-size:14px;color:#525252;line-height:1.7;margin:0 0 28px;">
          ${isCardPayment
      ? "Köszönjük hogy minket választott! A teljes összeg bankkártyás fizetése megtörtént, <strong>foglalása végleges</strong>."
      : "Köszönjük hogy minket választott, foglalását megkaptuk."}
        </p>

        <!-- Ingatlan leírás -->
        ${apartmentDescriptionHtml(data.apartments)}

        <!-- Foglalás részletei -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Foglalás részletei</p>
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;"><strong>Gamma Apartmanok Miskolctapolca</strong></p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Cím: 3519 Miskolctapolca, Beregi utca 11</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Telefonszám: +36 20 359 9222</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 16px;">E-mail: gammaapartmanok@gmail.com</p>
            ${data.apartments && data.apartments.length > 0 ? `
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;">
              <strong>Apartman${data.apartments.length > 1 ? "ok" : ""}:</strong>
              ${data.apartments.map(a => `${escapeHtml(a.name)} (${a.numberOfGuests} fő)`).join(", ")}
            </p>` : ""}
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;">
              <strong>Dátum:</strong> ${formatDateWithDay(data.checkIn)} – ${formatDateWithDay(data.checkOut)} (${data.nights} éjszaka)
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 6px;">
              Érkezés napján <strong>15 órától</strong> lehet elfoglalni a szállást és elutazás napján <strong>11 óráig</strong> kérjük elhagyni.
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:#1a3a2a;font-weight:600;margin:0;">
              Érkezésük napján mobilos vagy email-es tájékoztatást küldünk a bejutás részleteiről!
            </p>
          </td></tr>
        </table>

        <!-- Fizetési mód -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:22px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Fizetési mód</p>
            ${isCardPayment ? `
            <p style="font-family:sans-serif;font-size:14px;color:#f5f0e8;margin:0 0 6px;">
              <strong>Befizetett összeg:</strong>
              &nbsp;<span style="font-size:18px;font-weight:700;color:#d4a878;">${formatHuf(depositAmt)}</span>
            </p>
            <p style="font-family:sans-serif;font-size:12px;color:rgba(245,240,232,0.65);margin:0;">
              Bankkártyával fizetve
            </p>
            ` : isCashPayment ? `
            <p style="font-family:sans-serif;font-size:14px;color:#f5f0e8;margin:0 0 6px;">
              <strong>Fizetendő összeg:</strong>
              &nbsp;<span style="font-size:18px;font-weight:700;color:#d4a878;">${formatHuf(depositAmt)}</span>
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.8);margin:0 0 10px;">
              A szállás átvétele előtt a teljes összeget kérjük készpénzben befizetni.
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.8);margin:0;">
              Amennyiben nem történt előzetes telefonos egyeztetés a tulajdonossal, a foglalást töröljük.
            </p>
            ` : `
            <p style="font-family:sans-serif;font-size:14px;color:#f5f0e8;margin:0 0 6px;">
              <strong>Fizetendő összeg:</strong>
              &nbsp;<span style="font-size:18px;font-weight:700;color:#d4a878;">${formatHuf(depositAmt)}</span>
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.8);margin:0 0 14px;">
              Fizetési határidő: <strong style="color:#f5f0e8;">${escapeHtml(deadline)}</strong>
            </p>
            <p style="font-family:sans-serif;font-size:12px;color:rgba(245,240,232,0.65);margin:0;">
              (átutalás / Revolut / OTP Szép kártya)
            </p>
            `}
          </td></tr>
        </table>

        <!-- Ár összesítő -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Ár összesítő</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${data.apartments && data.apartments.length > 0
      ? apartmentPriceRowsHtml(data.apartments)
      : `
              ${data.basePrice ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">
                  Ár: ${adults} felnőtt${(data.numberOfTeens ?? 0) > 0 ? ` + ${data.numberOfTeens} gyerek (2–17 év)` : ""} részére
                </td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">
                  ${formatHuf(data.basePrice)} / ${data.nights} éj
                </td>
              </tr>` : ""}
              ${(data.numberOfBabies ?? 0) > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Baba (0–2 év): ${data.numberOfBabies} fő</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">ingyenes</td>
              </tr>` : ""}
              ${(data.numberOfChildren6to12 ?? 0) > 0 && (data.childPrice6to12 ?? 0) > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Gyerek (6–12 év): ${data.numberOfChildren6to12} fő × ${data.nights} éj × ${formatHuf(data.childPrice6to12!)}</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.childPrice6to12! * data.numberOfChildren6to12! * data.nights)}</td>
              </tr>` : ""}
              ${(data.numberOfChildren2to6 ?? 0) > 0 && (data.childPrice2to6 ?? 0) > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Kisgyerek (2–6 év): ${data.numberOfChildren2to6} fő × ${data.nights} éj × ${formatHuf(data.childPrice2to6!)}</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.childPrice2to6! * data.numberOfChildren2to6! * data.nights)}</td>
              </tr>` : ""}
              ${data.touristTax && data.touristTax > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Helyi idegenforgalmi adó (IFA: 450 Ft/felnőtt/éj) (${adults} fő/${data.nights} éj)</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.touristTax)}</td>
              </tr>` : ""}`}
              ${data.discountAmount && data.discountAmount > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#1a5c2a;padding:5px 0;border-bottom:1px solid #e8d9b5;">Kedvezmény (${data.discountPercent}%)</td>
                <td style="font-family:sans-serif;font-size:13px;color:#1a5c2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">&minus;${formatHuf(data.discountAmount)}</td>
              </tr>` : ""}
              ${extras.map(s => {
        const detail = s.price != null && s.quantity && s.quantity > 0
          ? s.pricingType === "PER_NIGHT" && s.nights && s.nights > 0
            ? ` (${s.quantity} db × ${s.nights} éj × ${formatHuf(s.price)})`
            : ` (${s.quantity} db × ${formatHuf(s.price)})`
          : "";
        return `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">${escapeHtml(s.name)}${detail}</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(s.total)}</td>
              </tr>`;
      }).join("")}
              <tr>
                <td style="font-family:sans-serif;font-size:15px;font-weight:700;color:#1a3a2a;padding:10px 0 0;">Ár összesen (ÁFA-val)</td>
                <td style="font-family:sans-serif;font-size:17px;font-weight:700;color:#1a3a2a;text-align:right;padding:10px 0 0;">${formatHuf(data.totalPrice)}</td>
              </tr>
            </table>
            ${data.notes ? `<p style="font-family:sans-serif;font-size:13px;color:#525252;margin:12px 0 0;padding-top:12px;border-top:1px solid #e8d9b5;">Megjegyzés: ${escapeHtml(data.notes)}</p>` : ""}
          </td></tr>
        </table>

        <!-- A foglalás véglegesítése + lemondási feltételek -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            ${isCardPayment ? `
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.7;margin:0 0 14px;">
              Foglalása végleges, további teendője nincs. Ha bármilyen kérdése van, keressen minket e-mailben vagy telefonon.
            </p>
            ` : isCashPayment ? `` : `
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.7;margin:0 0 14px;">
              A foglalást az előleg beérkezésével tudjuk véglegesíteni. Ha a járványügyi helyzet úgy alakul, akkor természetesen a foglaló összegét visszatérítjük, vagy módosíthatják a foglalás dátumát.
            </p>
            `}
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Lemondási feltételek</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;line-height:1.7;margin:0;">
              Érkezés előtti ${freeCancelDays + 1}. napig kötbérmentesen lemondható a foglalás. Az érkezési nap előtti ${penaltyFromDay + 1}. nap és az érkezési nap között a foglalás értékének ${depositPct}%-a a kötbér.
            </p>
          </td></tr>
        </table>

        <!-- Átutalás adatai (csak banki átutalásnál) -->
        ${!isCardPayment && !isCashPayment && !isRevolutPayment && !isSzepPayment ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Átutaláshoz az adatok</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.65);padding:4px 0;width:50%;">Számlatulajdonos</td>
                <td style="font-family:sans-serif;font-size:13px;color:#f5f0e8;font-weight:600;padding:4px 0;text-align:right;">Siposé Kiss Gabriella</td>
              </tr>
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.65);padding:4px 0;">Számlaszám</td>
                <td style="font-family:monospace;font-size:13px;color:#f5f0e8;font-weight:600;padding:4px 0;text-align:right;">11773346-03788187-00000000</td>
              </tr>
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.65);padding:4px 0;">Közlemény</td>
                <td style="font-family:sans-serif;font-size:13px;color:#d4a878;font-weight:600;padding:4px 0;text-align:right;">${escapeHtml(data.guestName)}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        ` : ""}

        <!-- SZÉP kártya adatok -->
        ${isSzepPayment ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">OTP SZÉP kártya fizetés</p>
            <p style="font-family:sans-serif;font-size:13px;color:#f5f0e8;line-height:1.8;margin:0;">
              A SZÉP kártyás fizetés előreutalással történik:<br>
              Lépjen be az <span style="color:#d4a878;font-weight:600;">OTP SZÉP kártya portálra</span> (szepkartya.otpportalok.hu), válassza az <span style="color:#d4a878;font-weight:600;">„Előlegfizetés"</span> menüpontot, keresse meg szálláshelyünket az elfogadóhelyek között (<span style="color:#d4a878;font-weight:600;">Gamma Apartmanok, 3519 Miskolctapolca, Beregi utca 11.</span>), adja meg a teljes összeget és erősítse meg, majd a bizonylatot küldje el nekünk.<br><br>
              <span style="color:rgba(245,240,232,0.6);font-size:12px;">Az összeg 5 munkanapon belül érkezik meg hozzánk, ezt követően véglegesítjük a foglalást.</span>
            </p>
          </td></tr>
        </table>
        ` : ""}

        <!-- Revolut adatok -->
        ${isRevolutPayment ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Revolut fizetés</p>
            <p style="font-family:sans-serif;font-size:13px;color:#f5f0e8;line-height:1.7;margin:0;">
              Kérjük utald át az előleg összegét Revoluton az alábbi telefonszámra:<br>
              <span style="color:#f5f0e8;font-weight:600;font-size:15px;">+36 20 359 9222</span><br><br>
              <span style="color:#d4a878;font-weight:600;">Közlemény: ${escapeHtml(data.guestName)}</span>
            </p>
          </td></tr>
        </table>
        ` : ""}

        <!-- Számlázási cím -->
        ${data.guestAddress ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Számlázási cím</p>
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 3px;">Név: ${escapeHtml(data.guestName)}</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 6px;">Cím: ${escapeHtml(data.guestAddress)}</p>
            <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;margin:0;">(Ha Szép Kártyával szeretne fizetni, akkor a Gamma Apartmanok Miskolctapolca, 3519 Miskolctapolca, Beregi utca 11. elfogadóhelyet kell megkeresnie az előleg utalásnál.)</p>
            <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;margin:0;">(Ha a számla kiállítását más névre és címre kéri, vagy adószám feltüntetését is kéri, kérem legyen szíves megírni!)</p>
          </td></tr>
        </table>` : ""}

        <!-- Az ár tartalmazza -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Az ár tartalmazza</p>
            ${[
      "Extra gyors ingyenes WiFi",
      "Automata redőnyök",
      "Központi porszívó",
      "Padló- és mennyezeti hűtés/fűtés",
      "Kapszulás kávéfőző + hagyományos kávéfőző (kávékapszulával)",
      "Teafőző, kenyérpirító",
      "Beépített hűtő + mélyhűtő",
      "Beépített sütő + főzőlap + mikrosütő",
      "Nagyméretű TV",
      "Vasalószoba",
      "Szúnyogháló",
      "Mosókonyha (térítés ellenében)",
      "Tetőteraszon közös jakuzzi és napozóterasz – előre egyeztetett időpontban napi 1,5 óra, privát és térítésmentes",
    ].map(item => `<p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:3px 0;">&#8226; ${item}</p>`).join("")}
          </td></tr>
        </table>

        <!-- Vendég elérhetősége -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Vendég elérhetősége</p>
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;font-weight:600;margin:0 0 3px;">${escapeHtml(data.guestName)}</p>
            ${data.guestPhone ? `<p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 3px;">Telefon: ${escapeHtml(data.guestPhone)}</p>` : ""}
            ${data.guestAddress ? `<p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 3px;">Cím: ${escapeHtml(data.guestAddress)}</p>` : ""}
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0;">E-mail: ${escapeHtml(data.guestEmail)}</p>
          </td></tr>
        </table>

        <!-- Zárás -->
        <p style="font-family:sans-serif;font-size:13px;color:#525252;line-height:1.7;margin:0 0 10px;">
          Köszönjük, hogy minket választottak!<br>
          Bármilyen kérésük/kérdésük merülne föl, forduljanak hozzánk bizalommal!
        </p>
        <p style="font-family:sans-serif;font-size:14px;color:#1a3a2a;font-weight:600;margin:0 0 20px;">
          Szeretettel várjuk Önöket ${formatDateWithDay(data.checkIn)} napján 15 óra után!<br>
          <span style="font-weight:700;font-size:13px;color:#525252;text-decoration:underline;">Az érkezésük körülbelüli időpontját, kérjük legyenek szívesek előre jelezni.</span>
        </p>

        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 4px;">
          Üdvözlettel: <strong>Gabriella</strong>
        </p>
        <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Gamma Apartmanok Vendégház</p>
        <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 16px;">+36 20 359 9222</p>

        <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;line-height:1.6;margin:0;">
          Kérdése esetén hívjon minket a <strong>+36 20 359 9222</strong> számon
          vagy írjon az <strong>gammaapartmanok@gmail.com</strong> címre.
        </p>

      </td></tr>

      <!-- Lábléc -->
      <tr>
        <td style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e8d9b5;">
          <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;margin:0;">
            Gamma Apartmanok · gammaapartmanok@gmail.com · +36 20 359 9222
          </p>
          <p style="font-family:sans-serif;font-size:11px;color:#d4d4d4;margin:4px 0 0;">
            Azonosító: ${data.bookingId}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `;
}

// ─── ADMIN ÉRTESÍTŐ EMAIL HTML ───────────────────────────────
function adminEmailHtml(data: BookingEmailData): string {
  const depositPct = data.depositPercent ?? 30;
  const depositAmt = data.totalPrice;
  const extras = data.extraServices?.filter(s => s.total > 0) ?? [];
  const adminAdults = data.numberOfAdults ?? data.guests;

  const paymentLabel = (() => {
    const m = data.paymentMethod ?? "";
    if (m === "transfer") return "Átutalás";
    if (m === "revolut") return "Revolut";
    if (m === "cash") return "Készpénz";
    if (m === "card") return "Bankkártya";
    if (m.startsWith("szep")) return "OTP Szép kártya";
    return m || "—";
  })();

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,58,42,0.10);">

      <!-- Fejléc -->
      <tr>
        <td style="background:#1a3a2a;padding:28px 32px;">
          <p style="color:rgba(245,240,232,0.6);font-size:11px;margin:0 0 6px;letter-spacing:0.2em;text-transform:uppercase;">Gamma Apartmanok</p>
          <p style="color:#f5f0e8;font-size:22px;font-weight:600;margin:0 0 4px;">Új foglalás érkezett!</p>
          <p style="color:rgba(245,240,232,0.5);font-size:12px;margin:0;font-family:monospace;letter-spacing:0.1em;">${data.bookingId}</p>
        </td>
      </tr>

      <tr><td style="padding:28px 32px;">

        <!-- Vendég adatai -->
        <p style="font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Vendég adatai</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:24px;">
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;width:40%;">Név</td>
            <td style="font-weight:600;color:#1a3a2a;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${escapeHtml(data.guestName)}</td>
          </tr>
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">E-mail</td>
            <td style="color:#2a2a2a;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${escapeHtml(data.guestEmail)}</td>
          </tr>
          ${data.guestPhone ? `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Telefon</td>
            <td style="color:#2a2a2a;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${escapeHtml(data.guestPhone)}</td>
          </tr>` : ""}
          ${data.guestAddress ? `
          <tr>
            <td style="color:#737373;padding:5px 0;">Lakcím</td>
            <td style="color:#2a2a2a;padding:5px 0;text-align:right;">${escapeHtml(data.guestAddress)}</td>
          </tr>` : ""}
        </table>

        <!-- Foglalás részletei -->
        <p style="font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Foglalás részletei</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:24px;">
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Érkezés</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatDateWithDay(data.checkIn)}</td>
          </tr>
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Távozás</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatDateWithDay(data.checkOut)}</td>
          </tr>
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Éjszakák</td>
            <td style="color:#2a2a2a;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${data.nights} éj</td>
          </tr>
          <tr>
            <td style="color:#737373;padding:5px 0;vertical-align:top;">Vendégek</td>
            <td style="color:#2a2a2a;padding:5px 0;text-align:right;">
              ${adminAdults} felnőtt${(data.numberOfTeens ?? 0) > 0 ? `, ${data.numberOfTeens} gyerek (2–17 év)` : ""}${(data.numberOfBabies ?? 0) > 0 ? `, ${data.numberOfBabies} baba` : ""}${(data.numberOfChildren6to12 ?? 0) > 0 ? `, ${data.numberOfChildren6to12} gyerek (6–12 év)` : ""}${(data.numberOfChildren2to6 ?? 0) > 0 ? `, ${data.numberOfChildren2to6} kisgyerek (2–6 év)` : ""}
            </td>
          </tr>
          ${data.apartments && data.apartments.length > 0 ? `
          <tr>
            <td style="color:#737373;padding:5px 0;vertical-align:top;">Apartman${data.apartments.length > 1 ? "ok" : ""}</td>
            <td style="color:#2a2a2a;padding:5px 0;text-align:right;">
              ${data.apartments.map(a => `${escapeHtml(a.name)} (${a.numberOfGuests} fő)`).join("<br>")}
            </td>
          </tr>` : ""}
        </table>

        <!-- Ár összesítő -->
        <p style="font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Ár összesítő</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:24px;">
          ${data.basePrice ? `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Szállás – ${adminAdults} felnőtt${(data.numberOfTeens ?? 0) > 0 ? ` + ${data.numberOfTeens} gyerek (2–17 év)` : ""} (${data.nights} éj)</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatHuf(data.basePrice)}</td>
          </tr>` : ""}
          ${(data.numberOfBabies ?? 0) > 0 ? (() => {
      const totalBabies = data.numberOfBabies ?? 0;
      const freeBabies = data.apartments && data.apartments.length > 0
        ? data.apartments.reduce((sum, a) => sum + ((a.numberOfBabies ?? 0) > 0 ? 1 : 0), 0)
        : Math.min(totalBabies, 1);
      const paidBabies = totalBabies - freeBabies;
      return `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Baba (0–2 év): ${totalBabies} fő</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${freeBabies} ingyenes${paidBabies > 0 ? `, ${paidBabies} felnőtt árú` : ""}</td>
          </tr>`;
    })() : ""}
          ${(data.numberOfChildren6to12 ?? 0) > 0 && (data.childPrice6to12 ?? 0) > 0 ? `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Gyerek (6–12 év): ${data.numberOfChildren6to12} fő × ${data.nights} éj × ${formatHuf(data.childPrice6to12!)}</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatHuf(data.childPrice6to12! * data.numberOfChildren6to12! * data.nights)}</td>
          </tr>` : ""}
          ${(data.numberOfChildren2to6 ?? 0) > 0 && (data.childPrice2to6 ?? 0) > 0 ? `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">Kisgyerek (2–6 év): ${data.numberOfChildren2to6} fő × ${data.nights} éj × ${formatHuf(data.childPrice2to6!)}</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatHuf(data.childPrice2to6! * data.numberOfChildren2to6! * data.nights)}</td>
          </tr>` : ""}
          ${data.discountAmount && data.discountAmount > 0 ? `
          <tr>
            <td style="color:#1a5c2a;padding:5px 0;border-bottom:1px solid #f0f0f0;">Kedvezmény (${data.discountPercent}%)</td>
            <td style="color:#1a5c2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">&minus;${formatHuf(data.discountAmount)}</td>
          </tr>` : ""}
          ${extras.map(s => {
      const detail = s.price != null && s.quantity && s.quantity > 0
        ? s.pricingType === "PER_NIGHT" && s.nights && s.nights > 0
          ? ` (${s.quantity} db × ${s.nights} éj × ${formatHuf(s.price)})`
          : ` (${s.quantity} db × ${formatHuf(s.price)})`
        : "";
      return `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(s.name)}${detail}</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatHuf(s.total)}</td>
          </tr>`;
    }).join("")}
          ${data.touristTax && data.touristTax > 0 ? `
          <tr>
            <td style="color:#737373;padding:5px 0;border-bottom:1px solid #f0f0f0;">IFA (${adminAdults} fő × ${data.nights} éj × 450 Ft)</td>
            <td style="color:#2a2a2a;font-weight:500;padding:5px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatHuf(data.touristTax)}</td>
          </tr>` : ""}
          <tr>
            <td style="color:#1a3a2a;font-weight:700;font-size:15px;padding:10px 0 0;">Végösszeg</td>
            <td style="color:#1a3a2a;font-weight:700;font-size:17px;padding:10px 0 0;text-align:right;">${formatHuf(data.totalPrice)}</td>
          </tr>
        </table>

        <!-- Előleg + fizetési mód -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
              <tr>
                <td style="color:#737373;padding:4px 0;">Előleg (${depositPct}%)</td>
                <td style="color:#1a3a2a;font-weight:700;padding:4px 0;text-align:right;">${formatHuf(depositAmt)}</td>
              </tr>
              <tr>
                <td style="color:#737373;padding:4px 0;">Helyszínen fizetendő</td>
                <td style="color:#2a2a2a;padding:4px 0;text-align:right;">${formatHuf(data.totalPrice - depositAmt)}</td>
              </tr>
              <tr>
                <td style="color:#737373;padding:4px 0;">Előleg fizetési módja</td>
                <td style="color:#2a2a2a;padding:4px 0;text-align:right;">${escapeHtml(paymentLabel)}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        ${data.notes ? `
        <!-- Megjegyzés -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #d4a878;background:#fff8f0;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <tr><td style="padding:14px 18px;">
            <p style="font-size:11px;font-weight:600;color:#a86435;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Megjegyzés</p>
            <p style="font-size:13px;color:#3d3d3d;margin:0;line-height:1.6;">${escapeHtml(data.notes)}</p>
          </td></tr>
        </table>` : ""}

        <!-- Admin link -->
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/foglalasok"
           style="display:inline-block;background:#1a3a2a;color:#f5f0e8;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
          Megtekintés az adminban →
        </a>

      </td></tr>

      <!-- Lábléc -->
      <tr>
        <td style="background:#f5f0e8;padding:16px 32px;text-align:center;border-top:1px solid #e8d9b5;">
          <p style="font-size:11px;color:#a8a8a8;margin:0;">Gamma Apartmanok admin értesítő · ${data.bookingId}</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `;
}

// ─── ELŐLEG VISSZAIGAZOLÓ EMAIL HTML ────────────────────────
function depositConfirmationHtml(data: BookingEmailData & { depositAmount: number; remaining: number; depositMethod?: string | null; depositPaidAt?: string | null }): string {
  const depositPct = data.depositPercent ?? 30;
  const adults = data.numberOfAdults ?? data.guests;
  const freeCancelDays = data.freeCancelDays ?? 11;
  const penaltyFromDay = freeCancelDays - 1;
  const extras = data.extraServices?.filter(s => s.total > 0) ?? [];

  const depositMethodText = (() => {
    const m = data.depositMethod ?? "";
    if (m === "transfer") return "átutalással";
    if (m === "revolut") return "Revoluttal";
    if (m === "cash") return "készpénzzel";
    if (m.startsWith("szep")) return "OTP Szép kártyával";
    return "átutalással";
  })();

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foglalás visszaigazolása</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,58,42,0.08);">

      <!-- Fejléc -->
      <tr>
        <td style="background:#1a3a2a;padding:36px 40px;text-align:center;">
          <p style="color:#f5f0e8;font-size:28px;font-weight:300;margin:0;letter-spacing:-0.02em;">Gamma Apartmanok</p>
          <p style="color:rgba(245,240,232,0.6);font-size:11px;margin:8px 0 0;font-family:sans-serif;letter-spacing:0.2em;text-transform:uppercase;">Miskolctapolca · Beregi utca 11</p>
        </td>
      </tr>

      <!-- Tartalom -->
      <tr><td style="padding:36px 40px;">

        <!-- Üdvözlés -->
        <p style="font-size:20px;color:#1a3a2a;margin:0 0 10px;">Kedves ${escapeHtml(data.guestName)}!</p>
        <p style="font-family:sans-serif;font-size:14px;color:#525252;line-height:1.7;margin:0 0 8px;">
          A ${formatHuf(data.depositAmount)} összeg ${depositMethodText} beérkezett${data.depositPaidAt ? ` ${data.depositPaidAt} napján` : ""}, így a <strong>foglalása végleges</strong>.
        </p>
        <p style="font-family:sans-serif;font-size:14px;color:#525252;line-height:1.7;margin:0 0 28px;">
          Köszönjük hogy minket választott!
        </p>

        <!-- Ingatlan leírás -->
        ${apartmentDescriptionHtml(data.apartments)}

        <!-- Foglalás részletei -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Foglalás részletei</p>
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;"><strong>Gamma Apartmanok Miskolctapolca</strong></p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Cím: 3519 Miskolctapolca, Beregi utca 11</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Telefonszám: +36 20 359 9222</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 16px;">E-mail: gammaapartmanok@gmail.com</p>
            ${data.apartments && data.apartments.length > 0 ? `
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;">
              <strong>Apartman${data.apartments.length > 1 ? "ok" : ""}:</strong>
              ${data.apartments.map(a => `${escapeHtml(a.name)} (${a.numberOfGuests} fő)`).join(", ")}
            </p>` : ""}
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;">
              <strong>Dátum:</strong> ${formatDateWithDay(data.checkIn)} – ${formatDateWithDay(data.checkOut)} (${data.nights} éjszaka)
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 6px;">
              Érkezés napján <strong>15 órától</strong> lehet elfoglalni a szállást és elutazás napján <strong>11 óráig</strong> kérjük elhagyni.
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:#1a3a2a;font-weight:600;margin:0;">
              Érkezésük napján mobilos vagy email-es tájékoztatást küldünk a bejutás részleteiről!
            </p>
          </td></tr>
        </table>

        <!-- Fizetési mód -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:22px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Fizetési mód</p>
            <p style="font-family:sans-serif;font-size:14px;color:#f5f0e8;margin:0 0 4px;">
              <strong>Befizetett összeg:</strong>
              &nbsp;<span style="font-size:18px;font-weight:700;color:#d4a878;">${formatHuf(data.depositAmount)}</span>
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.7);margin:4px 0 0;">
              ${data.depositPaidAt ? `${data.depositPaidAt} napján` : ""} ${depositMethodText} fizetésre került.
            </p>
            ${data.remaining > 0 ? `
            <p style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.8);margin:8px 0 0;">
              Fennmaradó összeg: <strong style="color:#d4a878;">${formatHuf(data.remaining)}</strong> – fizetés a szálláson (készpénz / átutalás / OTP Szép kártya) lehetséges.
            </p>` : ""}
          </td></tr>
        </table>

        <!-- Ár összesítő -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Ár összesítő</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${data.apartments && data.apartments.length > 0
      ? apartmentPriceRowsHtml(data.apartments)
      : `
              ${data.basePrice ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Ár: ${adults} felnőtt${(data.numberOfTeens ?? 0) > 0 ? ` + ${data.numberOfTeens} fiatal` : ""} részére</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.basePrice)} / ${data.nights} éj</td>
              </tr>` : ""}
              ${(data.numberOfBabies ?? 0) > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Baba (0–2 év): ${data.numberOfBabies} fő</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">ingyenes</td>
              </tr>` : ""}
              ${(data.numberOfChildren6to12 ?? 0) > 0 && (data.childPrice6to12 ?? 0) > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Gyerek (6–12 év): ${data.numberOfChildren6to12} fő × ${data.nights} éj × ${formatHuf(data.childPrice6to12!)}</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.childPrice6to12! * data.numberOfChildren6to12! * data.nights)}</td>
              </tr>` : ""}
              ${(data.numberOfChildren2to6 ?? 0) > 0 && (data.childPrice2to6 ?? 0) > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Kisgyerek (2–6 év): ${data.numberOfChildren2to6} fő × ${data.nights} éj × ${formatHuf(data.childPrice2to6!)}</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.childPrice2to6! * data.numberOfChildren2to6! * data.nights)}</td>
              </tr>` : ""}
              ${data.touristTax && data.touristTax > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">Helyi idegenforgalmi adó (IFA: 450 Ft/felnőtt/éj) (${adults} fő/${data.nights} éj)</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(data.touristTax)}</td>
              </tr>` : ""}`}
              ${data.discountAmount && data.discountAmount > 0 ? `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#1a5c2a;padding:5px 0;border-bottom:1px solid #e8d9b5;">Kedvezmény (${data.discountPercent}%)</td>
                <td style="font-family:sans-serif;font-size:13px;color:#1a5c2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">&minus;${formatHuf(data.discountAmount)}</td>
              </tr>` : ""}
              ${extras.map(s => {
        const detail = s.price != null && s.quantity && s.quantity > 0
          ? s.pricingType === "PER_NIGHT" && s.nights && s.nights > 0
            ? ` (${s.quantity} db × ${s.nights} éj × ${formatHuf(s.price)})`
            : ` (${s.quantity} db × ${formatHuf(s.price)})`
          : "";
        return `
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#525252;padding:5px 0;border-bottom:1px solid #e8d9b5;">${escapeHtml(s.name)}${detail}</td>
                <td style="font-family:sans-serif;font-size:13px;color:#2a2a2a;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid #e8d9b5;">${formatHuf(s.total)}</td>
              </tr>`;
      }).join("")}
              <tr>
                <td style="font-family:sans-serif;font-size:15px;font-weight:700;color:#1a3a2a;padding:10px 0 0;">Ár összesen (ÁFA-val)</td>
                <td style="font-family:sans-serif;font-size:17px;font-weight:700;color:#1a3a2a;text-align:right;padding:10px 0 0;">${formatHuf(data.totalPrice)}</td>
              </tr>
            </table>
            ${data.notes ? `<p style="font-family:sans-serif;font-size:13px;color:#525252;margin:12px 0 0;padding-top:12px;border-top:1px solid #e8d9b5;">Megjegyzés: ${escapeHtml(data.notes)}</p>` : ""}
          </td></tr>
        </table>

        <!-- Lemondási feltételek -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Lemondási feltételek</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;line-height:1.7;margin:0;">
              Érkezés előtti ${freeCancelDays + 1}. napig kötbérmentesen lemondható a foglalás. Az érkezési nap előtti ${penaltyFromDay + 1}. nap és az érkezési nap között a foglalás értékének ${depositPct}%-a a kötbér.
            </p>
          </td></tr>
        </table>

        <!-- Számlázási cím -->
        ${data.guestAddress ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Számlázási cím</p>
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 3px;">Név: ${escapeHtml(data.guestName)}</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 6px;">Cím: ${escapeHtml(data.guestAddress)}</p>
          </td></tr>
        </table>` : ""}

        <!-- Az ár tartalmazza -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Az ár tartalmazza</p>
            ${[
      "Extra gyors ingyenes WiFi",
      "Automata redőnyök",
      "Központi porszívó",
      "Padló- és mennyezeti hűtés/fűtés",
      "Kapszulás kávéfőző + hagyományos kávéfőző (kávékapszulával)",
      "Teafőző, kenyérpirító",
      "Beépített hűtő + mélyhűtő",
      "Beépített sütő + főzőlap + mikrosütő",
      "Nagyméretű TV",
      "Vasalószoba",
      "Szúnyogháló",
      "Mosókonyha (térítés ellenében)",
      "Tetőteraszon közös jakuzzi és napozóterasz – előre egyeztetett időpontban napi 1,5 óra, privát és térítésmentes",
    ].map(item => `<p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:3px 0;">&#8226; ${item}</p>`).join("")}
          </td></tr>
        </table>

        <!-- Vendég elérhetősége -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Vendég elérhetősége</p>
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;font-weight:600;margin:0 0 3px;">${escapeHtml(data.guestName)}</p>
            ${data.guestPhone ? `<p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 3px;">Telefon: ${escapeHtml(data.guestPhone)}</p>` : ""}
            ${data.guestAddress ? `<p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 3px;">Cím: ${escapeHtml(data.guestAddress)}</p>` : ""}
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0;">E-mail: ${escapeHtml(data.guestEmail)}</p>
          </td></tr>
        </table>

        <!-- Zárás -->
        <p style="font-family:sans-serif;font-size:13px;color:#525252;line-height:1.7;margin:0 0 10px;">
          Köszönjük, hogy minket választottak!<br>
          Bármilyen kérésük/kérdésük merülne föl, forduljanak hozzánk bizalommal!
        </p>
        <p style="font-family:sans-serif;font-size:14px;color:#1a3a2a;font-weight:600;margin:0 0 20px;">
          Szeretettel várjuk Önöket ${formatDateWithDay(data.checkIn)} napján 15 óra után!<br>
          <span style="font-weight:700;font-size:13px;color:#525252;text-decoration:underline;">Az érkezésük körülbelüli időpontját, kérjük legyenek szívesek előre jelezni.</span>
        </p>
        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 4px;">
          Üdvözlettel: <strong>Gabriella</strong>
        </p>
        <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Gamma Apartmanok Vendégház</p>
        <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 16px;">+36 20 359 9222</p>

        <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;line-height:1.6;margin:0;">
          Kérdése esetén hívjon minket a <strong>+36 20 359 9222</strong> számon
          vagy írjon az <strong>gammaapartmanok@gmail.com</strong> címre.
        </p>

      </td></tr>

      <!-- Lábléc -->
      <tr>
        <td style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e8d9b5;">
          <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;margin:0;">
            Gamma Apartmanok · gammaapartmanok@gmail.com · +36 20 359 9222
          </p>
          <p style="font-family:sans-serif;font-size:11px;color:#d4d4d4;margin:4px 0 0;">
            Azonosító: ${data.bookingId}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `;
}

// ─── ELŐLEG VISSZAIGAZOLÓ EMAIL KÜLDŐ ───────────────────────
export async function sendDepositConfirmationEmail(params: {
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  guestAddress?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  numberOfAdults?: number;
  numberOfTeens?: number;
  numberOfBabies?: number;
  numberOfChildren2to6?: number;
  numberOfChildren6to12?: number;
  totalPrice: number;
  depositAmount: number;
  depositPercent?: number;
  freeCancelDays?: number;
  depositMethod?: string | null;
  depositPaidAt?: string | null;
  basePrice?: number;
  touristTax?: number;
  childPrice2to6?: number;
  childPrice6to12?: number;
  extraServices?: Array<{ name: string; total: number; quantity?: number; nights?: number; price?: number | null; pricingType?: string }>;
  extraServicesTotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string | null;
  bookingId: string;
  apartments?: Array<{
    name: string;
    numberOfGuests: number;
    numberOfAdults: number;
    breakdown: { count: number; rate: number }[];
    aptBasePrice: number;
    aptTouristTax: number;
  }>;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@gamma-apartmanok.hu";
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? FROM_EMAIL;

  const remaining = params.totalPrice - params.depositAmount;
  const html = depositConfirmationHtml({ ...params, remaining, guestPhone: params.guestPhone ?? undefined, guestAddress: params.guestAddress ?? undefined });

  if (!RESEND_API_KEY || RESEND_API_KEY === "re_xxxxxxxxxxxx") {
    console.log("📧 [DEV] Előleg visszaigazoló email szimulálva:", {
      to: params.guestEmail,
      subject: `Előleg befizetve – ${params.bookingId}`,
    });
    return;
  }

  const guestRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Gamma Apartmanok <${FROM_EMAIL}>`,
      to: [params.guestEmail],
      reply_to: [ADMIN_EMAIL],
      subject: `✅ Előleg befizetve – ${params.bookingId}`,
      html,
    }),
  });

  if (!guestRes.ok) {
    const err = await guestRes.text();
    console.error("Előleg email hiba (vendég):", err);
  }

  // Admin másolat
  const adminRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Gamma Apartmanok Foglalások <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `✅ Előleg befizetve: ${params.guestName} – ${params.bookingId}`,
      html,
    }),
  });

  if (!adminRes.ok) {
    const err = await adminRes.text();
    console.error("Előleg email hiba (admin):", err);
  }
}

// ─── FŐ EMAIL KÜLDŐ FÜGGVÉNY ─────────────────────────────────
async function sendWithRetry(payload: object, apiKey: string, label: string): Promise<void> {
  const send = () => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });

  const res = await send();
  if (res.ok) return;

  const err1 = await res.text();
  console.warn(`${label} email hiba (1. próba):`, err1, "– újrapróbálkozás 2mp múlva...");

  await new Promise((r) => setTimeout(r, 2000));

  const res2 = await send();
  if (res2.ok) return;

  const err2 = await res2.text();
  console.error(`${label} email hiba (2. próba, feladva):`, err2);
}

export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@gamma-apartmanok.hu";
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.FROM_EMAIL ?? "info@gamma-apartmanok.hu";

  if (!RESEND_API_KEY || RESEND_API_KEY === "re_xxxxxxxxxxxx") {
    console.log("📧 [DEV] Email küldés szimulálva:", {
      to: data.guestEmail,
      subject: `Foglalás visszaigazolása – ${data.bookingId}`,
    });
    return;
  }

  await sendWithRetry({
    from: `Gamma Apartmanok <${FROM_EMAIL}>`,
    to: [data.guestEmail],
    bcc: [ADMIN_EMAIL],
    reply_to: [ADMIN_EMAIL],
    subject: `✓ Foglalás visszaigazolása – ${data.bookingId}`,
    html: guestEmailHtml(data),
  }, RESEND_API_KEY, "Vendég");

  await sendWithRetry({
    from: `Gamma Apartmanok Foglalások <${FROM_EMAIL}>`,
    to: [ADMIN_EMAIL],
    subject: `🏡 Új foglalás: ${data.guestName} – ${formatDate(data.checkIn)}`,
    html: adminEmailHtml(data),
  }, RESEND_API_KEY, "Admin");
}

// ─── TÖRLÉSI / ELUTASÍTÁSI EMAIL ─────────────────────────────

function cancellationEmailHtml(data: {
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingId: string;
  adminNote?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Foglalás törlése</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Fejléc -->
      <tr><td style="background:#1a3a2a;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
        <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.5);text-transform:uppercase;letter-spacing:0.2em;margin:0 0 8px;">Gamma Apartmanok</p>
        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;color:#f5f0e8;margin:0;">Foglalás törölve</h1>
      </td></tr>

      <!-- Tartalom -->
      <tr><td style="background:#ffffff;padding:32px;">
        <p style="font-family:sans-serif;font-size:15px;color:#3d3d3d;margin:0 0 16px;">
          Kedves <strong>${escapeHtml(data.guestName)}</strong>!
        </p>
        <p style="font-family:sans-serif;font-size:14px;color:#666;margin:0 0 24px;line-height:1.6;">
          Sajnálattal értesítjük, hogy az alábbi foglalása törlésre került.
        </p>

        <!-- Foglalás adatai -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#8a7a6a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Foglalás részletei</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#8a7a6a;padding:4px 0;">Érkezés</td>
                <td style="font-family:sans-serif;font-size:13px;color:#3d3d3d;font-weight:600;text-align:right;padding:4px 0;">${data.checkIn}</td>
              </tr>
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#8a7a6a;padding:4px 0;">Távozás</td>
                <td style="font-family:sans-serif;font-size:13px;color:#3d3d3d;font-weight:600;text-align:right;padding:4px 0;">${data.checkOut}</td>
              </tr>
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:#8a7a6a;padding:4px 0;">Éjszakák</td>
                <td style="font-family:sans-serif;font-size:13px;color:#3d3d3d;font-weight:600;text-align:right;padding:4px 0;">${data.nights} éj</td>
              </tr>
            </table>
          </td></tr>
        </table>

        ${data.adminNote ? `
        <!-- Admin megjegyzés -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-left:3px solid #d4a878;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#a86435;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Megjegyzés</p>
            <p style="font-family:sans-serif;font-size:14px;color:#3d3d3d;margin:0;line-height:1.6;">${escapeHtml(data.adminNote)}</p>
          </td></tr>
        </table>
        ` : ""}

        <p style="font-family:sans-serif;font-size:14px;color:#666;margin:0 0 8px;line-height:1.6;">
          Ha kérdése van, kérjük vegye fel velünk a kapcsolatot.
        </p>
      </td></tr>

      <!-- Lábléc -->
      <tr><td style="background:#f0ebe3;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
        <p style="font-family:sans-serif;font-size:12px;color:#a8a8a8;margin:0;">Gamma Apartmanok · Miskolctapolca, Beregi utca 11</p>
        <p style="font-family:sans-serif;font-size:11px;color:#c0c0c0;margin:6px 0 0;">Azonosító: ${data.bookingId}</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendCancellationEmail(params: {
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingId: string;
  adminNote?: string;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@gamma-apartmanok.hu";
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? FROM_EMAIL;

  if (!RESEND_API_KEY || RESEND_API_KEY === "re_xxxxxxxxxxxx") {
    console.log("📧 [DEV] Törlési email szimulálva:", { to: params.guestEmail, note: params.adminNote });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Gamma Apartmanok <${FROM_EMAIL}>`,
      to: [params.guestEmail],
      reply_to: [ADMIN_EMAIL],
      subject: `Foglalás törölve – ${params.bookingId}`,
      html: cancellationEmailHtml(params),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Törlési email hiba:", err);
  }
}

// ─── FIZETÉSI EMLÉKEZTETŐ EMAIL ──────────────────────────────

function paymentReminderHtml(p: {
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  depositAmount: number;
  bookingId: string;
  deadline: string;
  paymentMethod?: string;
  apartments: string[];
}): string {
  const isSzep = (p.paymentMethod ?? "").startsWith("szep");

  const aptSorHtml = p.apartments.length > 0
    ? '<p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;"><strong>Apartman' + (p.apartments.length > 1 ? "ok" : "") + ':</strong> ' + p.apartments.map(a => escapeHtml(a)).join(", ") + "</p>"
    : "";

  const bankDetailsHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Átutaláshoz az adatok</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.65);padding:4px 0;width:50%;">Számlatulajdonos</td>
                <td style="font-family:sans-serif;font-size:13px;color:#f5f0e8;font-weight:600;padding:4px 0;text-align:right;">Siposné Kiss Gabriella</td>
              </tr>
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.65);padding:4px 0;">Számlaszám</td>
                <td style="font-family:monospace;font-size:13px;color:#f5f0e8;font-weight:600;padding:4px 0;text-align:right;">11773346-03788187-00000000</td>
              </tr>
              <tr>
                <td style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.65);padding:4px 0;">Közlemény</td>
                <td style="font-family:sans-serif;font-size:13px;color:#d4a878;font-weight:600;padding:4px 0;text-align:right;">${escapeHtml(p.guestName)}</td>
              </tr>
            </table>
          </td></tr>
        </table>`;

  const szepHtml = !isSzep ? "" : `
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">OTP SZÉP kártyás fizetés</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;line-height:1.7;margin:0;">
              A SZÉP kártyás fizetés előreutalással történik: lépjen be az <strong>OTP SZÉP kártya portálra</strong> (szepkartya.otpportalok.hu), válassza az <strong>„Előlegfizetés"</strong> menüpontot, keresse meg szálláshelyünket az elfogadóhelyek között, adja meg a teljes összeget és erősítse meg, illetve a bizonylatot küldje el nekünk. Az összeg 5 munkanapon belül érkezik meg hozzánk.
            </p>
          </td></tr>
        </table>`;

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fizetési emlékeztető</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,58,42,0.08);">

      <tr>
        <td style="background:#1a3a2a;padding:36px 40px;text-align:center;">
          <p style="color:#f5f0e8;font-size:28px;font-weight:300;margin:0;letter-spacing:-0.02em;">Gamma Apartmanok</p>
          <p style="color:rgba(245,240,232,0.6);font-size:11px;margin:8px 0 0;font-family:sans-serif;letter-spacing:0.2em;text-transform:uppercase;">Miskolctapolca · Beregi utca 11</p>
        </td>
      </tr>

      <tr><td style="padding:36px 40px;">

        <p style="font-size:20px;color:#1a3a2a;margin:0 0 10px;">Kedves ${escapeHtml(p.guestName)}!</p>
        <p style="font-family:sans-serif;font-size:14px;color:#525252;line-height:1.7;margin:0 0 28px;">
          Emlékeztetjük, hogy a <strong>${escapeHtml(p.bookingId)}</strong> azonosítójú foglalásához tartozó fizetés még nem érkezett meg. Kérjük, hogy az alábbi határidőig rendezze az összeget.
        </p>

        <!-- Foglalás összefoglalója -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d9b5;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:#1a3a2a;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Foglalás részletei</p>
            ${aptSorHtml}
            <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;margin:0 0 4px;"><strong>Dátum:</strong> ${formatDateWithDay(p.checkIn)} – ${formatDateWithDay(p.checkOut)} (${p.nights} éjszaka)</p>
            <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0;"><strong>Foglalási szám:</strong> ${escapeHtml(p.bookingId)}</p>
          </td></tr>
        </table>

        <!-- Fizetési infó -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a2a;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:22px 24px;">
            <p style="font-family:sans-serif;font-size:11px;font-weight:600;color:rgba(245,240,232,0.6);text-transform:uppercase;letter-spacing:0.15em;margin:0 0 14px;">Fizetendő összeg</p>
            <p style="font-family:sans-serif;font-size:14px;color:#f5f0e8;margin:0 0 6px;">
              <span style="font-size:24px;font-weight:700;color:#d4a878;">${formatHuf(p.depositAmount)}</span>
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:rgba(245,240,232,0.8);margin:0;">
              Fizetési határidő: <strong style="color:#f5f0e8;">${escapeHtml(p.deadline)}</strong>
            </p>
          </td></tr>
        </table>

        ${bankDetailsHtml}
        ${szepHtml}

        <p style="font-family:sans-serif;font-size:13px;color:#525252;line-height:1.7;margin:0 0 10px;">
          Ha már utalt, kérjük hagyja figyelmen kívül ezt az üzenetet. Kérdés esetén keressen minket!
        </p>

        <p style="font-family:sans-serif;font-size:13px;color:#3d3d3d;line-height:1.8;margin:0 0 4px;">
          Üdvözlettel: <strong>Gabriella</strong>
        </p>
        <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 4px;">Gamma Apartmanok Vendégház</p>
        <p style="font-family:sans-serif;font-size:13px;color:#525252;margin:0 0 16px;">+36 20 359 9222</p>

      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendPaymentReminderEmail(params: {
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  depositAmount: number;
  bookingId: string;
  freeCancelDays: number;
  paymentMethod?: string;
  apartments: string[];
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@gamma-apartmanok.hu";
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? FROM_EMAIL;

  const deadline = depositDeadlineDate(params.checkIn, params.freeCancelDays);
  const html = paymentReminderHtml({ ...params, deadline });

  if (!RESEND_API_KEY || RESEND_API_KEY === "re_xxxxxxxxxxxx") {
    console.log("📧 [DEV] Fizetési emlékeztető szimulálva:", { to: params.guestEmail });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: `Gamma Apartmanok <${FROM_EMAIL}>`,
      to: [params.guestEmail],
      reply_to: [ADMIN_EMAIL],
      subject: `⏰ Fizetési emlékeztető – ${params.bookingId}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Reminder email hiba: ${err}`);
  }
}