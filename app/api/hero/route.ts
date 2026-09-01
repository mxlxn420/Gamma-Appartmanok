import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

const DEFAULTS = {
  id:            "singleton",
  subtitle:      "Beregi utca 11, Miskolctapolca",
  titleBefore:   "A tökéletes ",
  titleEmphasis: "kikapcsolódás",
  titleAfter:    "csak rád vár.",
  description:   `Romantikus vendégház hatalmas kerttel és privát jacuzzival, Miskolctapolca csendes zsákutcájában. Csak ti vagytok az egész \u201Ebirtokon.\u201D`,
  highlights:    [{ icon: "Waves", label: "Privát jacuzzi" }, { icon: "Home", label: "Csak ti vagytok" }],
};

export async function GET() {
  try {
    const hero = await prisma.heroContent.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: hero ?? DEFAULTS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
