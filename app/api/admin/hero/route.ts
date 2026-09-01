import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

const DEFAULTS = {
  id:            "singleton",
  subtitle:      "Beregi utca 11, Miskolctapolca",
  titleBefore:   "A tökéletes ",
  titleEmphasis: "kikapcsolódás",
  titleAfter:    "csak rád vár.",
  description:   `Romantikus vendégház hatalmas kerttel és privát jacuzzival, Miskolctapolca csendes zsákutcájában. Csak ti vagytok az egész \u201Ebirtokon.\u201D`,
  highlights:    [{ icon: "Waves", label: "Privát jacuzzi" }, { icon: "Home", label: "Csak ti vagytok" }],
  slides:        [
    { src: "/images/haz/IMG_8519 kicsi.jpg", alt: "Gamma Apartmanok – vendégház kívülről" },
    { src: "/images/jacuzzi/jacuzzikivilag.jpg", alt: "Privát jacuzzi" },
    { src: "/images/kert/kert.jpg", alt: "Hatalmas privát kert" },
    { src: "", alt: "" },
    { src: "", alt: "" },
  ],
};

export async function GET() {
  try {
    const hero = await prisma.heroContent.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: hero ?? DEFAULTS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const { subtitle, titleBefore, titleEmphasis, titleAfter, description, highlights, slides } = body;

    if (!subtitle || !titleBefore || !titleEmphasis || !titleAfter || !description || !highlights || !slides) {
      return NextResponse.json({ success: false, error: "Hiányzó kötelező mezők" }, { status: 400 });
    }

    const existing = await prisma.heroContent.findUnique({ where: { id: "singleton" } });
    const r2Base = process.env.NEXT_PUBLIC_R2_HERO_URL;
    const toDelete: string[] = [];
    if (r2Base && existing?.slides) {
      const oldUrls = (existing.slides as Array<{ src: string }>).map(s => s.src).filter(s => s && s.startsWith(r2Base));
      const newUrls = new Set((slides as Array<{ src: string }>).map(s => s.src).filter(Boolean));
      oldUrls.forEach(url => { if (!newUrls.has(url)) toDelete.push(url); });
    }

    const hero = await prisma.heroContent.upsert({
      where:  { id: "singleton" },
      update: { subtitle, titleBefore, titleEmphasis, titleAfter, description, highlights, slides },
      create: { id: "singleton", subtitle, titleBefore, titleEmphasis, titleAfter, description, highlights, slides },
    });

    for (const url of toDelete) {
      try { await deleteFromR2("hero", url); } catch { /* nem blokkolja */ }
    }

    revalidatePath("/");
    revalidatePath("/api/hero");

    return NextResponse.json({ success: true, data: hero });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
