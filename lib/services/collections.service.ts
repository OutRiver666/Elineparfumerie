import { Perfume } from "@/lib/data/mock-perfumes";
import { getProducts } from "@/lib/services/products.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface Collection {
  id: string;
  slug: string;
  name: {
    fr: string;
    ar: string;
  };
  subtitle: {
    fr: string;
    ar: string;
  };
  description: {
    fr: string;
    ar: string;
  };
  image: string;
  tag?: string;
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: { fr: c.name_fr, ar: c.name_ar },
      subtitle: {
        fr: c.description_fr ? c.description_fr.slice(0, 50) + "..." : "Collection Signature",
        ar: c.description_ar ? c.description_ar.slice(0, 50) + "..." : "تشكيلة الدار المميزة",
      },
      description: { fr: c.description_fr || "", ar: c.description_ar || "" },
      image: c.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
      tag: "Collection",
    }));
  } catch {
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<{
  collection: Collection | null;
  products: Perfume[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: rawC, error } = await (supabase.from("collections") as any)
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !rawC) {
      return { collection: null, products: [] };
    }

    const c = rawC as any;
    const collection: Collection = {
      id: c.id,
      slug: c.slug,
      name: { fr: c.name_fr, ar: c.name_ar },
      subtitle: {
        fr: c.description_fr ? c.description_fr.slice(0, 50) + "..." : "Collection Signature",
        ar: c.description_ar ? c.description_ar.slice(0, 50) + "..." : "تشكيلة الدار المميزة",
      },
      description: { fr: c.description_fr || "", ar: c.description_ar || "" },
      image: c.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
      tag: "Collection",
    };

    // Find products in this collection
    const { data: linkedProducts } = await (supabase.from("product_collections") as any)
      .select("product_id")
      .eq("collection_id", c.id);

    const allProducts = await getProducts();
    let products: Perfume[] = [];

    if (linkedProducts && linkedProducts.length > 0) {
      const ids = new Set(linkedProducts.map((lp: any) => lp.product_id));
      products = allProducts.filter((p) => ids.has(p.id));
    }

    // Fallback filter if product_collections table is empty
    if (products.length === 0) {
      if (slug.includes("oriental") || slug.includes("hiver")) {
        products = allProducts.filter((p) => p.family.fr.toLowerCase().includes("oriental") || p.seasons.includes("winter"));
      } else if (slug.includes("floral") || slug.includes("ete")) {
        products = allProducts.filter((p) => p.family.fr.toLowerCase().includes("floral") || p.seasons.includes("summer"));
      } else {
        products = allProducts.slice(0, 4);
      }
    }

    return { collection, products };
  } catch {
    return { collection: null, products: [] };
  }
}
