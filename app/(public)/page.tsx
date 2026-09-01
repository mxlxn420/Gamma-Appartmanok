import { prisma }        from "@/lib/prisma";

export const revalidate = 300;
import HeroSection      from "@/components/sections/HeroSection";
import AboutSection     from "@/components/sections/AboutSection";
import AmenitiesSection from "@/components/sections/AmenitiesSection";
import GallerySection   from "@/components/sections/GallerySection";
import PricingSection   from "@/components/sections/PricingSection";
import ReviewsSection   from "@/components/sections/ReviewsSection";
import FaqSection            from "@/components/sections/FaqSection";
import NeighborhoodSection   from "@/components/sections/NeighborhoodSection";
import ContactSection        from "@/components/sections/ContactSection";

const DEFAULT_SLIDES = [
  { src: "/images/haz/IMG_8519 kicsi.jpg",    alt: "Milán Kuckó – vendégház kívülről" },
  { src: "/images/jacuzzi/jacuzzikivilag.jpg", alt: "Privát jacuzzi"                  },
  { src: "/images/kert/kert.jpg",              alt: "Hatalmas privát kert"             },
] as { src: string; alt: string }[];

const HERO_DEFAULTS = {
  subtitle:      "Beregi utca 11, Miskolctapolca",
  titleBefore:   "A tökéletes ",
  titleEmphasis: "kikapcsolódás",
  titleAfter:    "csak rád vár.",
  description:   `Romantikus vendégház hatalmas kerttel és privát jacuzzival, Miskolctapolca csendes zsákutcájában. Csak ti vagytok az egész \u201Ebirtokon.\u201D`,
  highlights:    [{ icon: "Waves", label: "Privát jacuzzi" }, { icon: "Home", label: "Csak ti vagytok" }] as { icon: string; label: string }[],
  slides:        DEFAULT_SLIDES,
};

const AMENITIES_DEFAULTS = {
  subtitle:    "Felszerelts\u00E9g",
  heading:     "Minden, amire sz\u00FCks\u00E9ge van",
  description: "A Mil\u00E1n Kuck\u00F3 pr\u00E9mium felszerelts\u00E9ggel v\u00E1rja vend\u00E9geit \u2013 hogy az els\u0151 pillanatt\u00F3l fogva csak a pihen\u00E9sre kelljen gondolni.",
  items: [
    { icon: "Waves",           label: "Jacuzzi",                  desc: "Priv\u00E1t, korl\u00E1tlan haszn\u00E1lat" },
    { icon: "Flame",           label: "Kandall\u00F3",             desc: "Hangulatos esti t\u0171z" },
    { icon: "Wind",            label: "Kl\u00EDma",               desc: "F\u0171t\u00E9s \u00E9s h\u0171t\u00E9s eg\u00E9sz \u00E9vben" },
    { icon: "Wifi",            label: "Ingyenes WiFi",             desc: "Nagy sebess\u00E9g\u0171 internet" },
    { icon: "Tv",              label: "Smart TV",                  desc: "S\u00EDkk\u00E9perny\u0151s, m\u0171holdas" },
    { icon: "UtensilsCrossed", label: "Felszerelt konyha",         desc: "F\u0151z\u0151lap, mosogat\u00F3g\u00E9p, mikr\u00F3" },
    { icon: "Coffee",          label: "Bek\u00E9sz\u00EDtett tea \u00E9s k\u00E1v\u00E9", desc: "Tea-/k\u00E1v\u00E9f\u0151z\u0151 bek\u00E9sz\u00EDtve" },
    { icon: "Wine",            label: "Aj\u00E1nd\u00E9k \u00FCveg bor",         desc: "Minden \u00E9rkez\u00E9skor" },
    { icon: "Car",             label: "Ingyenes parkol\u00F3",     desc: "Saj\u00E1t, priv\u00E1t be\u00E1ll\u00F3" },
    { icon: "TreePine",        label: "Hatalmas priv\u00E1t kert", desc: "Grill, bogr\u00E1cs, szalonnas\u00FCt\u0151" },
    { icon: "Shirt",           label: "F\u00FCrd\u0151k\u00F6peny \u0026 t\u00F6r\u00F6lk\u00F6z\u0151", desc: "Minden vend\u00E9gnek" },
    { icon: "Baby",            label: "Babbar\u00E1t sz\u00E1ll\u00E1s",        desc: "Kis\u00E1gy, f\u00FCrdet\u0151k\u00E1d, etet\u0151k\u00E9szlet" },
  ] as { icon: string; label: string; desc: string }[],
};

const ABOUT_DEFAULTS = {
  heading1:     "Egy kis kuckó,",
  heading2:     "ahol az idő megáll.",
  description1: "A Mil\u00E1n Kuck\u00F3 egy romantikus, gondosan berendezett vend\u00E9gh\u00E1z Miskolctapolca csendes zs\u00E1kutc\u00E1j\u00E1ban \u2013 maximum 4 f\u0151 r\u00E9sz\u00E9re. Hatalmas kert, priv\u00E1t jacuzzi, kandall\u00F3 \u00E9s aj\u00E1nd\u00E9k bor v\u00E1r minden \u00E9rkez\u0151t.",
  description2: "Csak ti vagytok az eg\u00E9sz \u201Ebirtokon\u201D \u2013 nincs m\u00E1s vend\u00E9g, nincs zaj. Ugyanakkor Magyarorsz\u00E1g egyik legkedveltebb \u00FCd\u00FCl\u0151hely\u00E9n, a B\u00FCkk l\u00E1b\u00E1n rengeteg program v\u00E1r a k\u00F6zelben.",
  mainImage:    { src: "/images/haz/Mil\u00E1n Kuck\u00F3 vend\u00E9gh\u00E1z kis.jpg", alt: "Mil\u00E1n Kuck\u00F3 \u2013 vend\u00E9gh\u00E1z k\u00EDv\u00FClr\u0151l" },
  floatImage:   { src: "/images/belso/f\u00FCrd\u0151.jpg", alt: "Jacuzzi este" },
  values: [
    { icon: "MapPin", title: "Zs\u00E1kutcai csend",  text: "Miskolctapolca csendes sark\u00E1ban, zs\u00E1kutc\u00E1ban \u2013 m\u00E9gis mindenhez k\u00F6zel. Az Ellipsum, Barlangf\u00FCrd\u0151 csak 1 km-re!" },
    { icon: "Users",  title: "Csak ti vagytok",  text: "Az eg\u00E9sz kuck\u00F3t kiz\u00E1r\u00F3lag nektek tartjuk fenn. Nincs m\u00E1s vend\u00E9g \u2013 teljes priv\u00E1t szf\u00E9ra, igazi intimszf\u00E9ra." },
  ] as { icon: string; title: string; text: string }[],
  nearby: [
    "Ellipsum, Barlangf\u00FCrd\u0151 \u2013 1 km",
    "Avalon Park / Maya J\u00E1tsz\u00F3park \u2013 2,5 km",
    "Miskolctapolcai Bobp\u00E1lya",
    "Erdei kisvas\u00FAt \u2013 Lillaf\u00FCred",
    "Diósgyőri Vár",
    "Hámori tó & Zsófia kilátó",
  ] as string[],
};

export default async function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [heroRow, aboutRow, amenitiesRow, galleryRow, pricingRules] = await Promise.all([
    prisma.heroContent.findUnique({ where: { id: "singleton" } }),
    prisma.aboutContent.findUnique({ where: { id: "singleton" } }),
    prisma.amenitiesContent.findUnique({ where: { id: "singleton" } }),
    prisma.galleryContent.findUnique({ where: { id: "singleton" } }),
    prisma.pricingRule.findMany({
      where: {
        isActive: true,
        dateFrom: { not: null },
        dateTo: { gte: today },
      },
      orderBy: { priority: "asc" },
    }),
  ]);

  const minPrice = pricingRules.length > 0
    ? Math.min(...pricingRules.map((r) => r.pricePerNight))
    : null;

  const heroData = {
    subtitle:      heroRow?.subtitle      ?? HERO_DEFAULTS.subtitle,
    titleBefore:   heroRow?.titleBefore   ?? HERO_DEFAULTS.titleBefore,
    titleEmphasis: heroRow?.titleEmphasis ?? HERO_DEFAULTS.titleEmphasis,
    titleAfter:    heroRow?.titleAfter    ?? HERO_DEFAULTS.titleAfter,
    description:   heroRow?.description   ?? HERO_DEFAULTS.description,
    highlights:    (heroRow?.highlights   ?? HERO_DEFAULTS.highlights) as { icon: string; label: string }[],
    slides:        (heroRow?.slides       ?? HERO_DEFAULTS.slides)     as { src: string; alt: string; label: string }[],
  };

  const aboutData = {
    heading1:     aboutRow?.heading1     ?? ABOUT_DEFAULTS.heading1,
    heading2:     aboutRow?.heading2     ?? ABOUT_DEFAULTS.heading2,
    description1: aboutRow?.description1 ?? ABOUT_DEFAULTS.description1,
    description2: aboutRow?.description2 ?? ABOUT_DEFAULTS.description2,
    mainImage:    (aboutRow?.mainImage   ?? ABOUT_DEFAULTS.mainImage)  as { src: string; alt: string },
    floatImage:   (aboutRow?.floatImage  ?? ABOUT_DEFAULTS.floatImage) as { src: string; alt: string },
    values:       (aboutRow?.values      ?? ABOUT_DEFAULTS.values)     as { icon: string; title: string; text: string }[],
    nearby:       (aboutRow?.nearby      ?? ABOUT_DEFAULTS.nearby)     as string[],
  };

  const amenitiesData = {
    subtitle:    amenitiesRow?.subtitle    ?? AMENITIES_DEFAULTS.subtitle,
    heading:     amenitiesRow?.heading     ?? AMENITIES_DEFAULTS.heading,
    description: amenitiesRow?.description ?? AMENITIES_DEFAULTS.description,
    items:       (amenitiesRow?.items      ?? AMENITIES_DEFAULTS.items) as { icon: string; label: string; desc: string }[],
  };

  const galleryFeatured = (galleryRow?.featured ?? null) as { src: string; alt: string }[] | null;

  return (
    <>
      <HeroSection data={heroData} />
      <AboutSection data={aboutData} />
      <AmenitiesSection data={amenitiesData} />
      <GallerySection featured={galleryFeatured ?? undefined} />
      <PricingSection minPrice={minPrice} />
      <ReviewsSection />
      <FaqSection />
      <NeighborhoodSection />
      <ContactSection />
    </>
  );
}
