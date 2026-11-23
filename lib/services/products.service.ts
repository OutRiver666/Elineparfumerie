import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Perfume, LandingPageMode } from "@/types/perfume";

export interface GetProductsFilters {
  gender?: "men" | "women" | "unisex";
  family?: string;
  season?: string;
  limit?: number;
  offset?: number;
}

const BASE_PRODUCT_SELECT = `
  id,
  slug,
  name_fr,
  name_ar,
  description_fr,
  description_ar,
  gender,
  seasons,
  classification,
  top_notes_fr,
  top_notes_ar,
  heart_notes_fr,
  heart_notes_ar,
  base_notes_fr,
  base_notes_ar,
  images,
  is_featured,
  is_bestseller,
  is_published,
  fragrance_families (name_fr, name_ar),
  product_variants (id, size, sku, price_dzd, compare_at_price_dzd, stock_quantity, is_active)
`;

const EXTENDED_PRODUCT_SELECT = `
  ${BASE_PRODUCT_SELECT},
  landing_page_mode,
  landing_page_images
`;

function parseLandingMode(value: unknown): LandingPageMode {
  if (value === "landing_only" || value === "both" || value === "standard") {
    return value;
  }
  return "standard";
}

function parseImageArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function getProducts(filters?: GetProductsFilters): Promise<Perfume[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const buildQuery = (selectFields: string) => {
      let query = supabase
        .from("products")
        .select(selectFields)
        .eq("is_published", true);

      if (filters?.gender) {
        query = query.eq("gender", filters.gender);
      }
      if (filters?.season) {
        query = query.contains("seasons", [filters.season]);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      return query;
    };

    let { data, error } = await buildQuery(EXTENDED_PRODUCT_SELECT);

    // Graceful fallback if migration 00009 hasn't been executed on Supabase yet
    if (error && (error.code === "42703" || error.message?.includes("landing_page"))) {
      const fallback = await buildQuery(BASE_PRODUCT_SELECT);
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !data || data.length === 0) {
      return [];
    }

    // Map database records to domain Perfume entities
    return data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      name: { fr: item.name_fr, ar: item.name_ar },
      description: { fr: item.description_fr, ar: item.description_ar },
      gender: item.gender,
      seasons: item.seasons,
      family: {
        fr: item.fragrance_families?.name_fr || "Boisé",
        ar: item.fragrance_families?.name_ar || "خشبي",
      },
      classification: item.classification === "standard" ? undefined : item.classification,
      notes: {
        top: { fr: item.top_notes_fr || [], ar: item.top_notes_ar || [] },
        heart: { fr: item.heart_notes_fr || [], ar: item.heart_notes_ar || [] },
        base: { fr: item.base_notes_fr || [], ar: item.base_notes_ar || [] },
      },
      variants: (item.product_variants || []).map((v: any) => ({
        id: v.id,
        size: v.size,
        priceDZD: Number(v.price_dzd),
        compareAtPriceDZD: v.compare_at_price_dzd ? Number(v.compare_at_price_dzd) : undefined,
        stock: v.stock_quantity,
        sku: v.sku,
      })),
      images: parseImageArray(item.images),
      landingPageMode: parseLandingMode(item.landing_page_mode),
      landingPageImages: parseImageArray(item.landing_page_images),
      isFeatured: item.is_featured,
      isBestseller: item.is_bestseller,
    }));
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Perfume | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}
