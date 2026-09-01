import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    const body = await req.json();

    const isLastMinute = Boolean(body.isLastMinute);
    const updated = await prisma.discount.update({
      where: { id },
      data: {
        name:            body.name,
        discountPercent: Number(body.discountPercent),
        stayFrom:        isLastMinute ? new Date("2000-01-01") : new Date(body.stayFrom),
        stayTo:          isLastMinute ? new Date("2100-12-31") : new Date(body.stayTo),
        bookingFrom:     body.bookingFrom ? new Date(body.bookingFrom) : null,
        bookingTo:       body.bookingTo   ? new Date(body.bookingTo)   : null,
        isActive:        Boolean(body.isActive),
        isLastMinute,
        lastMinuteDays:  isLastMinute ? (Number(body.lastMinuteDays) || 7) : 7,
      },
    });

    revalidatePath("/api/discounts");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    await prisma.discount.delete({ where: { id } });
    revalidatePath("/api/discounts");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
