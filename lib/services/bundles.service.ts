import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface BundleItem {
  id: string;
  slug: string;
  type: "predefined" | "custom";
  name: {
    fr: string;
    ar: string;
  };
  description: {
    fr: string;
    ar: string;
  };
  priceDZD: number;
  discountPercentage?: number;
  requiredBottlesCount: number;
  allowedSizes: string[];
  images: string[];
  isActive: boolean;
  items?: {
    id: string;
    productId: string;
    productNameFr: string;
    productNameAr: string;
    productImages: string[];
    variantId: string;
    size: string;
    priceDZD: number;
    quantity: number;
  }[];
}

export interface CustomTierRule {
  id: string;
  slug: string;
  name: {
    fr: string;
    ar: string;
  };
  description: {
    fr: string;
    ar: string;
  };
  requiredBottlesCount: number;
  discountPercentage: number;
  allowedSizes: string[];
  images: string[];
  isActive: boolean;
}

export interface ProductForBundleSelection {
  id: string;
  nameFr: string;
  nameAr: string;
  images: string[];
  variants: {
    id: string;
    size: string;
    priceDZD: number;
    stock: number;
  }[];
}

// ─── Storefront Helpers ──────────────────────────────────────────────────────

export async function getBundles(): Promise<BundleItem[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (supabase.from("bundles") as any)
      .select("*, bundle_items(*, product:products(id, name_fr, name_ar, images), variant:product_variants(id, size, price_dzd))")
      .eq("type", "predefined")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((b: any) => mapDbBundleToItem(b));
  } catch {
    return [];
  }
}

export async function getBundleBySlug(slug: string): Promise<BundleItem | null> {
  const bundles = await getBundles();
  return bundles.find((b) => b.slug === slug) || null;
}

export async function getCustomTiers(): Promise<CustomTierRule[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("bundles") as any)
      .select("*")
      .eq("type", "custom")
      .eq("is_active", true)
      .order("required_bottles_count", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((b: any) => ({
      id: b.id,
      slug: b.slug,
      name: { fr: b.name_fr, ar: b.name_ar },
      description: { fr: b.description_fr || "", ar: b.description_ar || "" },
      requiredBottlesCount: Number(b.required_bottles_count || 3),
      discountPercentage: Number(b.discount_percentage ?? 0),
      allowedSizes:
        Array.isArray(b.allowed_sizes) && b.allowed_sizes.length > 0
          ? b.allowed_sizes
          : ["25ml", "30ml", "50ml", "80ml", "100ml"],
      images: b.images || [],
      isActive: Boolean(b.is_active),
    }));
  } catch {
    return [];
  }
}

// ─── Admin Dashboard Helpers (Bypasses RLS) ──────────────────────────────────

export async function getAdminBundles(): Promise<BundleItem[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("bundles") as any)
      .select("*, bundle_items(*, product:products(id, name_fr, name_ar, images), variant:product_variants(id, size, price_dzd))")
      .eq("type", "predefined")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((b: any) => mapDbBundleToItem(b));
  } catch (err) {
    console.error("Error fetching admin bundles:", err);
    return [];
  }
}

export async function getAdminCustomRules(): Promise<CustomTierRule[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("bundles") as any)
      .select("*")
      .eq("type", "custom")
      .order("required_bottles_count", { ascending: true });

    if (error || !data) return [];
    return data.map((b: any) => ({
      id: b.id,
      slug: b.slug,
      name: { fr: b.name_fr, ar: b.name_ar },
      description: { fr: b.description_fr || "", ar: b.description_ar || "" },
      requiredBottlesCount: Number(b.required_bottles_count || 3),
      discountPercentage: Number(b.discount_percentage ?? 0),
      allowedSizes:
        Array.isArray(b.allowed_sizes) && b.allowed_sizes.length > 0
          ? b.allowed_sizes
          : ["25ml", "30ml", "50ml", "80ml", "100ml"],
      images: b.images || [],
      isActive: Boolean(b.is_active),
    }));
  } catch (err) {
    console.error("Error fetching admin custom rules:", err);
    return [];
  }
}

export async function getAdminBundleById(id: string): Promise<BundleItem | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("bundles") as any)
      .select("*, bundle_items(*, product:products(id, name_fr, name_ar, images), variant:product_variants(id, size, price_dzd))")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapDbBundleToItem(data);
  } catch {
    return null;
  }
}

export async function getAvailableProductsForBundles(): Promise<ProductForBundleSelection[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("products") as any)
      .select(`
        id, name_fr, name_ar, images,
        product_variants (id, size, price_dzd, stock_quantity, is_active)
      `)
      .order("name_fr", { ascending: true });

    if (error || !data) return [];

    return (data as any[]).map((p) => ({
      id: p.id,
      nameFr: p.name_fr,
      nameAr: p.name_ar,
      images: p.images || [],
      variants: (p.product_variants || [])
        .filter((v: any) => v.is_active)
        .map((v: any) => ({
          id: v.id,
          size: v.size,
          priceDZD: Number(v.price_dzd || 0),
          stock: Number(v.stock_quantity || 0),
        })),
    }));
  } catch (err) {
    console.error("Error fetching available products for bundles:", err);
    return [];
  }
}

function mapDbBundleToItem(b: any): BundleItem {
  const items = (b.bundle_items || []).map((bi: any) => ({
    id: bi.id,
    productId: bi.product_id,
    productNameFr: bi.product?.name_fr || "Parfum inconnu",
    productNameAr: bi.product?.name_ar || "",
    productImages: bi.product?.images || [],
    variantId: bi.variant_id,
    size: bi.variant?.size || "50ml",
    priceDZD: Number(bi.variant?.price_dzd || 0),
    quantity: bi.quantity || 1,
  }));

  return {
    id: b.id,
    slug: b.slug,
    type: b.type,
    name: {
      fr: b.name_fr,
      ar: b.name_ar,
    },
    description: {
      fr: b.description_fr,
      ar: b.description_ar,
    },
    priceDZD: Number(b.fixed_price_dzd || 0),
    discountPercentage: b.discount_percentage ? Number(b.discount_percentage) : undefined,
    requiredBottlesCount: b.required_bottles_count || 2,
    allowedSizes: b.allowed_sizes || ["50ml"],
    images: b.images || [],
    isActive: b.is_active,
    items,
  };
}
