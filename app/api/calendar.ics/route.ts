import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatIcalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").slice(0, 8);
}

function escapeIcal(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET() {
  const [bookings, blocked] = await Promise.all([
    prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "PAID", "PENDING"] } },
      select: { id: true, checkIn: true, checkOut: true, guestName: true },
    }),
    prisma.blockedPeriod.findMany({
      where: { AND: [
        { reason: { not: { startsWith: "[szallas.hu]" } } },
        { reason: { not: { startsWith: "[appartman.hu]" } } },
      ]},
      select: { id: true, dateFrom: true, dateTo: true, reason: true },
    }),
  ]);

  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gamma Apartmanok//Vendeghaz//HU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Gamma Apartmanok és Jakuzzi",
    "X-WR-TIMEZONE:Europe/Budapest",
  ];

  for (const b of bookings) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@gamma-apartmanok.hu`,
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
      `UID:blocked-${p.id}@gamma-apartmanok.hu`,
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
      "Cache-Control": "no-cache, no-store",
    },
  });
}
