import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const DEFAULT_FEATURED = [
  { src: "/images/haz/IMG_8537 kicsi.jpg",   alt: "Kuck\u00F3 k\u00FCls\u0151"    },
  { src: "/images/jacuzzi/jacuzzi.jpg",       alt: "Jacuzzi"                        },
  { src: "/images/belso/nappali.jpg",         alt: "Nappali"                        },
  { src: "/images/belso/haloszoba.jpg",        alt: "H\u00E1l\u00F3szoba"           },
  { src: "/images/belso/konyha.jpg",           alt: "Konyha"                        },
  { src: "/images/belso/f\u00FCrd\u0151.jpg", alt: "F\u00FCrd\u0151"               },
];

export async function GET() {
  try {
    const row = await prisma.galleryContent.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({
      success: true,
      data: {
        featured:   (row?.featured   ?? DEFAULT_FEATURED),
        categories: (row?.categories ?? null),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const { featured, categories } = body;

    if (!featured || !categories) {
      return NextResponse.json({ success: false, error: "Hi\u00E1nyz\u00F3 k\u00F6telez\u0151 mez\u0151k" }, { status: 400 });
    }

    if (!Array.isArray(featured)) {
      return NextResponse.json({ success: false, error: "A featured mező tömb kell legyen" }, { status: 400 });
    }
    for (const item of featured) {
      if (typeof item?.src !== "string" || typeof item?.alt !== "string") {
        return NextResponse.json({ success: false, error: "Minden featured elemnek van src és alt mezője (string)" }, { status: 400 });
      }
    }

    if (!Array.isArray(categories)) {
      return NextResponse.json({ success: false, error: "A categories mező tömb kell legyen" }, { status: 400 });
    }
    for (const cat of categories) {
      if (typeof cat?.label !== "string") {
        return NextResponse.json({ success: false, error: "Minden kategóriának van label mezője (string)" }, { status: 400 });
      }
      if (cat.images !== undefined && !Array.isArray(cat.images)) {
        return NextResponse.json({ success: false, error: "A kategória images mezője tömb kell legyen" }, { status: 400 });
      }
    }

    const row = await prisma.galleryContent.upsert({
      where:  { id: "singleton" },
      update: { featured, categories },
      create: { id: "singleton", featured, categories },
    });

    return NextResponse.json({ success: true, data: row });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
