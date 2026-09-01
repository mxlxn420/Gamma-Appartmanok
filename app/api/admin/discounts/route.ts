import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { stayFrom: "asc" },
    });
    return NextResponse.json({ success: true, data: discounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const body = await req.json();

    const isLastMinute = Boolean(body.isLastMinute);
    if (!body.name || !body.discountPercent || (!isLastMinute && (!body.stayFrom || !body.stayTo))) {
      return NextResponse.json(
        { success: false, error: "Hiányzó kötelező mezők" },
        { status: 400 }
      );
    }

    if (typeof body.name === "string" && body.name.length > 100) {
      return NextResponse.json({ success: false, error: "A kedvezmény neve maximum 100 karakter lehet" }, { status: 400 });
    }

    const discountPercent = Number(body.discountPercent);
    if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ success: false, error: "A kedvezmény mértéke 1 és 100 közé kell essen" }, { status: 400 });
    }

    const discount = await prisma.discount.create({
      data: {
        name:            body.name,
        discountPercent: Number(body.discountPercent),
        stayFrom:        isLastMinute ? new Date("2000-01-01") : new Date(body.stayFrom),
        stayTo:          isLastMinute ? new Date("2100-12-31") : new Date(body.stayTo),
        bookingFrom:     body.bookingFrom ? new Date(body.bookingFrom) : null,
        bookingTo:       body.bookingTo   ? new Date(body.bookingTo)   : null,
        isActive:        body.isActive ?? true,
        isLastMinute,
        lastMinuteDays:  isLastMinute ? (Number(body.lastMinuteDays) || 7) : 7,
      },
    });

    revalidatePath("/api/discounts");

    return NextResponse.json({ success: true, data: discount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
