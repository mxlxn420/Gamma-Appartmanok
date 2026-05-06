import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const policies = await prisma.bookingPolicy.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: policies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const { name, depositPercent, freeCancelDays } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "Név megadása kötelező" }, { status: 400 });

    const policy = await prisma.bookingPolicy.create({
      data: {
        name,
        depositPercent: Number(depositPercent) || 30,
        freeCancelDays: Number(freeCancelDays) || 7,
      },
    });
    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
