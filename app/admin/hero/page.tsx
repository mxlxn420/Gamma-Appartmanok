import { cookies }   from "next/headers";
import { redirect }   from "next/navigation";
import { prisma }     from "@/lib/prisma";
import AdminHero      from "@/components/admin/AdminHero";

const DEFAULT_SLIDES = [
  { src: "/images/haz/IMG_8519 kicsi.jpg",    alt: "Milán Kuckó – vendégház kívülről" },
  { src: "/images/jacuzzi/jacuzzikivilag.jpg", alt: "Privát jacuzzi"                  },
  { src: "/images/kert/kert.jpg",              alt: "Hatalmas privát kert"             },
];

const DEFAULTS = {
  subtitle:      "Beregi utca 11, Miskolctapolca",
  titleBefore:   "A tökéletes ",
  titleEmphasis: "kikapcsolódás",
  titleAfter:    "csak rád vár.",
  description:   `Romantikus vendégház hatalmas kerttel és privát jacuzzival, Miskolctapolca csendes zsákutcájában. Csak ti vagytok az egész \u201Ebirtokon.\u201D`,
  highlights:    [{ icon: "Waves", label: "Privát jacuzzi" }, { icon: "Home", label: "Csak ti vagytok" }],
  slides:        DEFAULT_SLIDES,
};

export default async function AdminHeroPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const row = await prisma.heroContent.findUnique({ where: { id: "singleton" } });

  const data = {
    subtitle:      row?.subtitle      ?? DEFAULTS.subtitle,
    titleBefore:   row?.titleBefore   ?? DEFAULTS.titleBefore,
    titleEmphasis: row?.titleEmphasis ?? DEFAULTS.titleEmphasis,
    titleAfter:    row?.titleAfter    ?? DEFAULTS.titleAfter,
    description:   row?.description   ?? DEFAULTS.description,
    highlights:    (row?.highlights   ?? DEFAULTS.highlights) as { icon: string; label: string }[],
    slides:        (row?.slides       ?? DEFAULTS.slides)     as { src: string; alt: string; label: string }[],
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">Kezdőlap</h1>
        <p className="text-stone-500 text-sm mt-1">
          A főoldal fejlécének képei, szövegei és kiemelt jellemzői
        </p>
      </div>
      <AdminHero initial={data} />
    </div>
  );
}
