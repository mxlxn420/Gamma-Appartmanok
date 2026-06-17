import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

const DEFAULTS = {
  id:           "singleton",
  heading1:     "Egy kis kuckó,",
  heading2:     "ahol az idő megáll.",
  description1: "A Mil\u00E1n Kuck\u00F3 egy romantikus, gondosan berendezett vend\u00E9gh\u00E1z Miskolctapolca csendes zs\u00E1kutc\u00E1j\u00E1ban \u2013 maximum 4 f\u0151 r\u00E9sz\u00E9re. Hatalmas kert, priv\u00E1t jacuzzi, kandall\u00F3 \u00E9s aj\u00E1nd\u00E9k bor v\u00E1r minden \u00E9rkez\u0151t.",
  description2: "Csak ti vagytok az eg\u00E9sz \u201Ebirtokon\u201D \u2013 nincs m\u00E1s vend\u00E9g, nincs zaj. Ugyanakkor Magyarorsz\u00E1g egyik legkedveltebb \u00FCd\u00FCl\u0151hely\u00E9n, a B\u00FCkk l\u00E1b\u00E1n rengeteg program v\u00E1r a k\u00F6zelben.",
  mainImage:    { src: "/images/haz/Mil\u00E1n Kuck\u00F3 vend\u00E9gh\u00E1z kis.jpg", alt: "Mil\u00E1n Kuck\u00F3 \u2013 vend\u00E9gh\u00E1z k\u00EDv\u00FClr\u0151l" },
  floatImage:   { src: "/images/belso/fürdő.jpg", alt: "Jacuzzi este" },
  values: [
    { icon: "MapPin", title: "Zs\u00E1kutcai csend",  text: "Miskolctapolca csendes sark\u00E1ban, zs\u00E1kutc\u00E1ban \u2013 m\u00E9gis mindenhez k\u00F6zel. Az Ellipsum, Barlangf\u00FCrd\u0151 csak 1 km-re!" },
    { icon: "Users",  title: "Csak ti vagytok",  text: "Az eg\u00E9sz kuck\u00F3t kiz\u00E1r\u00F3lag nektek tartjuk fenn. Nincs m\u00E1s vend\u00E9g \u2013 teljes priv\u00E1t szf\u00E9ra, igazi intimszf\u00E9ra." },
  ],
  nearby: [
    "Ellipsum, Barlangf\u00FCrd\u0151 \u2013 1 km",
    "Avalon Park / Maya J\u00E1tsz\u00F3park \u2013 2,5 km",
    "Miskolctapolcai Bobp\u00E1lya",
    "Erdei kisvas\u00FAt \u2013 Lillaf\u00FCred",
    "Diósgyőri Vár",
    "Hámori tó & Zsófia kilátó",
  ],
};

export async function GET() {
  try {
    const about = await prisma.aboutContent.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: about ?? DEFAULTS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const { heading1, heading2, description1, description2, mainImage, floatImage, values, nearby } = body;

    if (!heading1 || !heading2 || !description1 || !description2 || !mainImage || !floatImage || !values || !nearby) {
      return NextResponse.json({ success: false, error: "Hiányzó kötelező mezők" }, { status: 400 });
    }

    const existing = await prisma.aboutContent.findUnique({ where: { id: "singleton" } });
    const r2Base = process.env.NEXT_PUBLIC_R2_ABOUT_URL;
    const toDelete: string[] = [];
    if (r2Base && existing) {
      const oldUrls = [
        (existing.mainImage  as { src: string } | null)?.src,
        (existing.floatImage as { src: string } | null)?.src,
      ].filter((s): s is string => !!s && s.startsWith(r2Base));
      const newUrls = new Set([(mainImage as { src: string })?.src, (floatImage as { src: string })?.src].filter(Boolean));
      oldUrls.forEach(url => { if (!newUrls.has(url)) toDelete.push(url); });
    }

    const about = await prisma.aboutContent.upsert({
      where:  { id: "singleton" },
      update: { heading1, heading2, description1, description2, mainImage, floatImage, values, nearby },
      create: { id: "singleton", heading1, heading2, description1, description2, mainImage, floatImage, values, nearby },
    });

    for (const url of toDelete) {
      try { await deleteFromR2("about", url); } catch { /* nem blokkolja */ }
    }

    return NextResponse.json({ success: true, data: about });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
