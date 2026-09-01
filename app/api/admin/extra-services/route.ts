import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const authErr = await requireAuth(); if (authErr) return authErr;

  const services = await prisma.extraService.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ success: true, data: services });
}

export async function POST(req: Request) {
  const authErr = await requireAuth(); if (authErr) return authErr;

  const { name, description, pricingType, price, imageUrl } = await req.json();
  if (!name?.trim()) return NextResponse.json({ success: false, error: "A név kötelező!" }, { status: 400 });
  if (!description?.trim()) return NextResponse.json({ success: false, error: "A leírás kötelező!" }, { status: 400 });
  if (!["PER_NIGHT", "PER_BOOKING"].includes(pricingType)) return NextResponse.json({ success: false, error: "Érvénytelen árazási típus!" }, { status: 400 });

  if (name.trim().length > 100) return NextResponse.json({ success: false, error: "A név maximum 100 karakter lehet!" }, { status: 400 });
  if (description.trim().length > 500) return NextResponse.json({ success: false, error: "A leírás maximum 500 karakter lehet!" }, { status: 400 });

  const parsedPrice = price != null ? Number(price) : null;
  if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
    return NextResponse.json({ success: false, error: "Az ár nem lehet negatív!" }, { status: 400 });
  }

  const service = await prisma.extraService.create({
    data: {
      name:        name.trim(),
      description: description.trim(),
      pricingType,
      price:       parsedPrice,
      imageUrl:    imageUrl ?? null,
    },
  });
  revalidatePath("/api/extra-services");
  return NextResponse.json({ success: true, data: service });
}
