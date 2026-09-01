import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const services = await prisma.extraService.findMany({
    where:   { isActive: true },
    orderBy: { createdAt: "asc" },
    select:  { id: true, name: true, description: true, pricingType: true, price: true, imageUrl: true },
  });
  return NextResponse.json({ success: true, data: services });
}
