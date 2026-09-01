import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  const apartments = await prisma.apartment.findMany({
    where:   { isActive: true },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, slug: true, maxGuests: true, description: true, coverImage: true },
  });
  return NextResponse.json(apartments);
}
