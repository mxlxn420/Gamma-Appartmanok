import { NextResponse }    from "next/server";
import { revalidatePath }  from "next/cache";
import { prisma }        from "@/lib/prisma";
import { deleteFromR2 }  from "@/lib/r2";
import { requireAuth }   from "@/lib/auth";

const BUCKET = "extra-services";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAuth(); if (authErr) return authErr;

  const { id } = await params;
  const { name, description, pricingType, price, imageUrl, isActive } = await req.json();

  const data: Record<string, unknown> = {};
  if (name        !== undefined) data.name        = name.trim();
  if (description !== undefined) data.description = description.trim();
  if (pricingType !== undefined) {
    if (!["PER_NIGHT", "PER_BOOKING"].includes(pricingType)) {
      return NextResponse.json({ success: false, error: "Érvénytelen árazási típus!" }, { status: 400 });
    }
    data.pricingType = pricingType;
  }
  if (price    !== undefined) data.price    = price != null ? Number(price) : null;
  if (imageUrl !== undefined) data.imageUrl = imageUrl ?? null;
  if (isActive !== undefined) data.isActive = isActive;

  let oldImageUrl: string | null = null;
  const r2Base = process.env.NEXT_PUBLIC_R2_EXTRA_SERVICES_URL;
  if (imageUrl !== undefined && r2Base) {
    const current = await prisma.extraService.findUnique({ where: { id }, select: { imageUrl: true } });
    oldImageUrl = current?.imageUrl ?? null;
  }

  const service = await prisma.extraService.update({ where: { id }, data });

  if (oldImageUrl && r2Base && oldImageUrl.startsWith(r2Base) && oldImageUrl !== (imageUrl ?? null)) {
    try { await deleteFromR2(BUCKET, oldImageUrl); } catch { /* nem blokkolja */ }
  }

  revalidatePath("/api/extra-services");
  return NextResponse.json({ success: true, data: service });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAuth(); if (authErr) return authErr;

  const { id } = await params;

  const service = await prisma.extraService.findUnique({ where: { id }, select: { imageUrl: true } });

  if (service?.imageUrl) {
    try {
      await deleteFromR2(BUCKET, service.imageUrl);
    } catch {
      // nem blokkolja a törlést ha a kép már nem létezik
    }
  }

  await prisma.extraService.delete({ where: { id } });
  revalidatePath("/api/extra-services");
  return NextResponse.json({ success: true });
}
