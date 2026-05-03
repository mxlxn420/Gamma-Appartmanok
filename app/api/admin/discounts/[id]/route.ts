import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    const updated = await prisma.discount.update({
      where: { id },
      data: {
        name:            body.name,
        discountPercent: Number(body.discountPercent),
        stayFrom:        new Date(body.stayFrom),
        stayTo:          new Date(body.stayTo),
        bookingFrom:     body.bookingFrom ? new Date(body.bookingFrom) : null,
        bookingTo:       body.bookingTo   ? new Date(body.bookingTo)   : null,
        isActive:        Boolean(body.isActive),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.discount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
