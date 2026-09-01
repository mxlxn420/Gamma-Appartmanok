export const revalidate = 300;

import { prisma }          from "@/lib/prisma";
import GaleriaPage, { DEFAULT_CATEGORIES } from "@/components/sections/GaleriaPage";
import type { GalleryCategory }            from "@/components/sections/GaleriaPage";

export default async function Galeria() {
  const row = await prisma.galleryContent.findUnique({ where: { id: "singleton" } });
  const categories = (row?.categories ?? DEFAULT_CATEGORIES) as GalleryCategory[];
  return <GaleriaPage categories={categories} />;
}
