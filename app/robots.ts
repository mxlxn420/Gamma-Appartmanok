import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gammaapartmanok.hu";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
        crawlDelay: 10,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
