import { NextRequest, NextResponse } from "next/server";
import { revalidatePath }            from "next/cache";
import { prisma }                    from "@/lib/prisma";
import { requireAuth }               from "@/lib/auth";
import { deleteFromR2 }              from "@/lib/r2";

export async function GET() {
  const apartments = await prisma.apartment.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(apartments);
}

export async function PATCH(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id, name, description, maxGuests, coverImage, isActive } = await req.json();
  if (!id) return NextResponse.json({ success: false, error: "Hiányzó id" }, { status: 400 });

  let oldCoverImage: string | null = null;
  const r2Base = process.env.NEXT_PUBLIC_R2_APARTMENTS_URL;
  if (coverImage !== undefined && r2Base) {
    const current = await prisma.apartment.findUnique({ where: { id }, select: { coverImage: true } });
    oldCoverImage = current?.coverImage ?? null;
  }

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

  if (oldCoverImage && r2Base && oldCoverImage.startsWith(r2Base) && oldCoverImage !== (coverImage || null)) {
    try { await deleteFromR2("apartments", oldCoverImage); } catch { /* nem blokkolja */ }
  }

  revalidatePath("/api/apartments");
  revalidatePath("/");

  return NextResponse.json({ success: true, data: updated });
}
