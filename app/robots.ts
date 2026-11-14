import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elineparfumerie.dz";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/fr/admin/", "/ar/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
