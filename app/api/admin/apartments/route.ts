import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";

export async function GET() {
  const apartments = await prisma.apartment.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(apartments);
}

export async function PATCH(req: NextRequest) {
  const { id, name, description, maxGuests, coverImage, isActive } = await req.json();
  if (!id) return NextResponse.json({ success: false, error: "Hiányzó id" }, { status: 400 });

  const updated = await prisma.apartment.update({
    where: { id },
    data: {
      ...(name        !== undefined ? { name }                         : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(maxGuests   !== undefined ? { maxGuests: Number(maxGuests) } : {}),
      ...(coverImage  !== undefined ? { coverImage: coverImage || null } : {}),
      ...(isActive    !== undefined ? { isActive }                    : {}),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
