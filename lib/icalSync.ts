import { prisma } from "@/lib/prisma";

// Globális (apartman-független) források
const GLOBAL_SOURCES = [
  { envKey: "ICAL_SZALLAS_HU",   label: "szallas.hu"   },
  { envKey: "ICAL_BOOKING_COM",  label: "booking.com"  },
  { envKey: "ICAL_APPARTMAN_HU", label: "appartman.hu" },
];

// Per-apartman források — apartmentSlug alapján keresünk apartmentId-t DB-ből
const APARTMENT_SOURCES = [
  { envKey: "ICAL_SZALLAS_HU_GAMMA_1",  label: "szallas.hu", apartmentSlug: "gamma-1" },
  { envKey: "ICAL_SZALLAS_HU_GAMMA_2",  label: "szallas.hu", apartmentSlug: "gamma-2" },
  { envKey: "ICAL_SZALLAS_HU_GAMMA_3",  label: "szallas.hu", apartmentSlug: "gamma-3" },
  { envKey: "ICAL_SZALLAS_HU_GAMMA_4",  label: "szallas.hu", apartmentSlug: "gamma-4" },
  { envKey: "ICAL_BOOKING_COM_GAMMA_1", label: "booking.com", apartmentSlug: "gamma-1" },
  { envKey: "ICAL_BOOKING_COM_GAMMA_2", label: "booking.com", apartmentSlug: "gamma-2" },
  { envKey: "ICAL_BOOKING_COM_GAMMA_3", label: "booking.com", apartmentSlug: "gamma-3" },
  { envKey: "ICAL_BOOKING_COM_GAMMA_4", label: "booking.com", apartmentSlug: "gamma-4" },
  { envKey: "ICAL_AIRBNB_GAMMA_2",      label: "airbnb",      apartmentSlug: "gamma-2" },
  { envKey: "ICAL_AIRBNB_GAMMA_3",      label: "airbnb",      apartmentSlug: "gamma-3" },
  { envKey: "ICAL_AIRBNB_GAMMA_4",      label: "airbnb",      apartmentSlug: "gamma-4" },
];

function parseIcalDate(s: string): Date {
  const clean = s.slice(0, 8);
  return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00Z`);
}

function parseIcal(text: string): { start: Date; end: Date; summary: string }[] {
  const events: { start: Date; end: Date; summary: string }[] = [];
  const blocks = text.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    const startMatch   = block.match(/DTSTART(?:;[^:\r\n]*)?:(\d{8})/);
    const endMatch     = block.match(/DTEND(?:;[^:\r\n]*)?:(\d{8})/);
    const summaryMatch = block.match(/SUMMARY:([^\r\n]+)/);

    if (!startMatch || !endMatch) continue;

    const start = parseIcalDate(startMatch[1]);
    const end   = parseIcalDate(endMatch[1]);

    if (end <= start) continue;

    events.push({
      start,
      end,
      summary: summaryMatch?.[1]?.trim() ?? "Foglalt",
    });
  }

  return events;
}

export interface SyncResult {
  source:      string;
  apartment?:  string;
  added:       number;
  removed:     number;
  error?:      string;
}

export async function syncIcalFeeds(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  // 1. Globális szinkron
  for (const { envKey, label } of GLOBAL_SOURCES) {
    const url = process.env[envKey];
    if (!url) continue;

    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const events = parseIcal(await res.text());

      const deleted = await prisma.blockedPeriod.deleteMany({
        where: { reason: { startsWith: `[${label}]` }, apartmentId: null },
      });

      if (events.length > 0) {
        await prisma.blockedPeriod.createMany({
          data: events.map((e) => ({
            dateFrom: e.start,
            dateTo:   e.end,
            reason:   `[${label}] ${e.summary}`,
          })),
        });
      }

      results.push({ source: label, added: events.length, removed: deleted.count });
    } catch (err: unknown) {
      results.push({
        source:  label,
        added:   0,
        removed: 0,
        error:   err instanceof Error ? err.message : "Ismeretlen hiba",
      });
    }
  }

  // 2. Per-apartman szinkron (csak ha az env var be van állítva)
  for (const { envKey, label, apartmentSlug } of APARTMENT_SOURCES) {
    const url = process.env[envKey];
    if (!url) continue;

    try {
      const apartment = await prisma.apartment.findUnique({
        where: { slug: apartmentSlug },
        select: { id: true },
      });
      if (!apartment) throw new Error(`Apartman nem található: ${apartmentSlug}`);

      const res = await fetch(url, {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const events = parseIcal(await res.text());

      const deleted = await prisma.blockedPeriod.deleteMany({
        where: { reason: { startsWith: `[${label}]` }, apartmentId: apartment.id },
      });

      if (events.length > 0) {
        await prisma.blockedPeriod.createMany({
          data: events.map((e) => ({
            dateFrom:    e.start,
            dateTo:      e.end,
            reason:      `[${label}] ${e.summary}`,
            apartmentId: apartment.id,
          })),
        });
      }

      results.push({ source: label, apartment: apartmentSlug, added: events.length, removed: deleted.count });
    } catch (err: unknown) {
      results.push({
        source:    label,
        apartment: apartmentSlug,
        added:     0,
        removed:   0,
        error:     err instanceof Error ? err.message : "Ismeretlen hiba",
      });
    }
  }

  return results;
}
