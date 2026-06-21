import type { Metadata, Viewport } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import ViewportFix from "@/components/ui/ViewportFix";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gammaapartmanok.hu"),
  title: {
    default: "Gamma Apartmanok | Prémium pihenés Miskolctapolcán",
    template: "%s | Gamma Apartmanok",
  },
  description:
    "4 különálló prémium apartman Miskolctapolcán – időpontra foglalható privát jacuzzival, panorámás tetőterasszal, ingyenes parkolóval. Max. 20 fő. Érintkezésmentes bejelentkezés. Foglaljon közvetlenül!",
  keywords: [
    "gamma apartmanok miskolctapolca",
    "miskolctapolca szállás",
    "jacuzzi szállás miskolctapolca",
    "privát jacuzzi apartman",
    "romantikus szállás miskolc",
    "apartman miskolctapolca",
    "hétvégi pihenés borsod",
    "szállás miskolc közelében",
    "bükk apartman",
    "tetőterasz jakuzzi szállás",
    "4 fős apartman miskolctapolca",
    "6 fős apartman miskolctapolca",
  ],
  openGraph: {
    type:        "website",
    locale:      "hu_HU",
    url:         "https://gammaapartmanok.hu",
    siteName:    "Gamma Apartmanok",
    title:       "Gamma Apartmanok | Prémium pihenés Miskolctapolcán",
    description: "4 különálló prémium apartman Miskolctapolcán – időpontra foglalható privát jacuzzival, panorámás tetőterasszal. Max. 20 fő.",
    images: [{ url: "/og-image.jpg?v=2", width: 1200, height: 630, alt: "Gamma Apartmanok Miskolctapolca" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Gamma Apartmanok | Prémium pihenés Miskolctapolcán",
    description: "4 különálló prémium apartman Miskolctapolcán – időpontra foglalható privát jacuzzival, panorámás tetőterasszal. Max. 20 fő.",
    images:      ["/og-image.jpg?v=2"],
  },
  robots: {
    index:  true,
    follow: true,
  },
  alternates: {
    canonical: "https://gammaapartmanok.hu",
  },
  icons: {
    icon:  [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#6e4e32",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${playfair.variable} ${jost.variable}`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context":  "https://schema.org",
              "@type":     "LodgingBusiness",
              name:        "Gamma Apartmanok",
              description: "4 különálló prémium apartman Miskolctapolcán, időpontra foglalható privát jacuzzival, panorámás tetőterasszal és teljes felszereltséggel. Maximum 20 fő.",
              url:         "https://gammaapartmanok.hu",
              telephone:   "+36 20 359 9222",
              email:       "gammaapartmanok@gmail.com",
              address: {
                "@type":         "PostalAddress",
                streetAddress:   "Beregi utca 11",
                addressLocality: "Miskolctapolca",
                postalCode:      "3519",
                addressCountry:  "HU",
              },
              geo: {
                "@type":    "GeoCoordinates",
                latitude:   48.0731645,
                longitude:  20.7470249,
              },
              priceRange:   "$$",
              checkinTime:  "15:00",
              checkoutTime: "11:00",
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "Jacuzzi",                    value: true },
                { "@type": "LocationFeatureSpecification", name: "Panorámás tetőterasz",       value: true },
                { "@type": "LocationFeatureSpecification", name: "Wi-Fi",                      value: true },
                { "@type": "LocationFeatureSpecification", name: "Klíma",                      value: true },
                { "@type": "LocationFeatureSpecification", name: "Ingyenes parkoló",           value: true },
                { "@type": "LocationFeatureSpecification", name: "Teljesen felszerelt konyha", value: true },
              ],
              sameAs: [
                "https://www.facebook.com/profile.php?id=100070831690258",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans bg-cream text-stone-800 antialiased">
        <ViewportFix />
        {children}
        <Analytics />
      </body>
    </html>
  );
}