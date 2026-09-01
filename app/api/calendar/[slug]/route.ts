import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatIcalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").slice(0, 8);
}

function escapeIcal(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

const EXTERNAL_PREFIXES = ["[szallas.hu]", "[booking.com]", "[appartman.hu]"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.ics$/, "");

  const apartment = await prisma.apartment.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!apartment) {
    return NextResponse.json({ error: "Nem található" }, { status: 404 });
  }

  const [bookings, blocked] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "PAID", "PENDING"] },
        apartments: { some: { apartmentId: apartment.id } },
      },
      select: { id: true, checkIn: true, checkOut: true },
    }),
    prisma.blockedPeriod.findMany({
      where: {
        OR: [{ apartmentId: apartment.id }, { apartmentId: null }],
        AND: EXTERNAL_PREFIXES.map((prefix) => ({
          reason: { not: { startsWith: prefix } },
        })),
      },
      select: { id: true, dateFrom: true, dateTo: true },
    }),
  ]);

  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Gamma Apartmanok//${escapeIcal(apartment.name)}//HU`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcal(apartment.name)}`,
    "X-WR-TIMEZONE:Europe/Budapest",
  ];

  for (const b of bookings) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}-${slug}@gamma-apartmanok.hu`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(b.checkIn)}`,
      `DTEND;VALUE=DATE:${formatIcalDate(b.checkOut)}`,
      `SUMMARY:${escapeIcal("Foglalt")}`,
      "END:VEVENT"
    );
  }

  for (const p of blocked) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:blocked-${p.id}-${slug}@gamma-apartmanok.hu`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(p.dateFrom)}`,
      `DTEND;VALUE=DATE:${formatIcalDate(p.dateTo)}`,
      `SUMMARY:${escapeIcal("Foglalt")}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

    return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
