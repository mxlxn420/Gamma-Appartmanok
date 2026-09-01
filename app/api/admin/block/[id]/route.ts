import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    const deleted = await prisma.blockedPeriod.delete({
      where: { id },
    });

    revalidatePath("/api/availability");
    revalidatePath("/api/calendar.ics");
    const apartments = await prisma.apartment.findMany({
      where: deleted.apartmentId ? { id: deleted.apartmentId } : {},
      select: { slug: true },
    });
    for (const a of apartments) revalidatePath(`/api/calendar/${a.slug}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}