export const revalidate = 300;

import type { Metadata }   from "next";
import { prisma }          from "@/lib/prisma";
import GaleriaPage, { DEFAULT_CATEGORIES } from "@/components/sections/GaleriaPage";
import type { GalleryCategory }            from "@/components/sections/GaleriaPage";

export const metadata: Metadata = {
  title: "Galéria",
  description:
    "Nézze meg a Gamma Apartmanok Miskolctapolca apartmanjainak, jakuzzijának és kertjének fotóit — kategóriánként rendszerezve.",
  alternates: { canonical: "/galeria" },
  openGraph: {
    title: "Galéria | Gamma Apartmanok",
    description: "Nézze meg a Gamma Apartmanok Miskolctapolca apartmanjainak, jakuzzijának és kertjének fotóit.",
    url: "https://gammaapartmanok.hu/galeria",
  },
};

export default async function Galeria() {
  const row = await prisma.galleryContent.findUnique({ where: { id: "singleton" } });
  const categories = (row?.categories ?? DEFAULT_CATEGORIES) as GalleryCategory[];
  return <GaleriaPage categories={categories} />;
}
