import { MetadataRoute } from "next";
import { getProducts } from "@/lib/services/products.service";
import { getCollections } from "@/lib/services/collections.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elineparfumerie.dz";
  const locales = ["fr", "ar"];

  const routes: MetadataRoute.Sitemap = [];

  // Static routes
  const staticPages = ["", "/shop", "/packs", "/packs/builder", "/cart", "/checkout"];

  const products = await getProducts();
  const collections = await getCollections();

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : page === "/shop" ? 0.9 : 0.8,
      });
    }

    // Perfume product pages from live database
    for (const perfume of products) {
      routes.push({
        url: `${baseUrl}/${locale}/shop/${perfume.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: perfume.isBestseller ? 0.9 : 0.7,
      });
    }

    // Collections from live database
    for (const collection of collections) {
      routes.push({
        url: `${baseUrl}/${locale}/collections/${collection.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  }

  return routes;
}
