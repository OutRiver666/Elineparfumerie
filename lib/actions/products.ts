"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const variantSchema = z.object({
  size: z.enum(["25ml", "30ml", "50ml", "80ml", "100ml"]),
  sku: z.string().min(2).max(60),
  price_dzd: z.coerce.number().min(0),
  compare_at_price_dzd: z.coerce.number().min(0).optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0),
  is_active: z.boolean().default(true),
});

const productFormSchema = z.object({
  name_fr: z.string().min(2, "Nom français requis"),
  name_ar: z.string().min(2, "Nom arabe requis"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug: lettres minuscules, chiffres et tirets seulement"),
  description_fr: z.string().min(10, "Description française requise"),
  description_ar: z.string().min(10, "Description arabe requise"),
  gender: z.enum(["men", "women", "unisex"]),
  classification: z.enum(["standard", "X2", "X3", "X4", "X5", "X6", "X7", "X8"]).default("standard"),
  fragrance_family_id: z.string().uuid().optional().nullable(),
  seasons: z.array(z.string()).min(1, "Au moins une saison requise"),
  top_notes_fr: z.string().optional(),
  top_notes_ar: z.string().optional(),
  heart_notes_fr: z.string().optional(),
  heart_notes_ar: z.string().optional(),
  base_notes_fr: z.string().optional(),
  base_notes_ar: z.string().optional(),
  images: z.string().optional(), // JSON array of URLs
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_published: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, "Au moins une variante requise"),
});

export type ProductFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

import { requireAdminPermission } from "@/lib/security/auth-guard";

// Helper: ensure request is from authenticated staff with products_manage permission
async function requireStaff(locale: string) {
  const { user } = await requireAdminPermission("products_manage", locale);
  return user;
}

function parseNotes(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── CREATE PRODUCT ──────────────────────────────────────────────────────────

export async function createProduct(
  formData: FormData,
  locale: string = "fr"
): Promise<ProductFormState> {
  await requireStaff(locale);

  const raw = Object.fromEntries(formData.entries());

  // Parse variants from JSON string sent by client
  let variants: z.infer<typeof variantSchema>[] = [];
  try {
    variants = JSON.parse((raw.variants as string) || "[]");
  } catch {
    return { error: "Données variantes invalides." };
  }

  // Parse seasons as array
  const seasons = formData.getAll("seasons").map(String);

  const parsed = productFormSchema.safeParse({
    ...raw,
    seasons,
    variants,
    is_featured: raw.is_featured === "true" || raw.is_featured === "on",
    is_bestseller: raw.is_bestseller === "true" || raw.is_bestseller === "on",
    is_published: raw.is_published === "true" || raw.is_published === "on",
    fragrance_family_id: raw.fragrance_family_id || null,
  });

  if (!parsed.success) {
    return {
      error: "Données invalides. Veuillez corriger les champs ci-dessous.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  // Parse image URLs
  let images: string[] = [];
  try {
    images = data.images ? JSON.parse(data.images) : [];
  } catch {
    images = data.images ? [data.images] : [];
  }

  // 1. Insert product
  const { data: product, error: productError } = await (admin.from("products") as any)
    .insert({
      slug: data.slug,
      name_fr: data.name_fr,
      name_ar: data.name_ar,
      description_fr: data.description_fr,
      description_ar: data.description_ar,
      gender: data.gender,
      classification: data.classification,
      fragrance_family_id: data.fragrance_family_id || null,
      seasons: data.seasons,
      top_notes_fr: parseNotes(data.top_notes_fr),
      top_notes_ar: parseNotes(data.top_notes_ar),
      heart_notes_fr: parseNotes(data.heart_notes_fr),
      heart_notes_ar: parseNotes(data.heart_notes_ar),
      base_notes_fr: parseNotes(data.base_notes_fr),
      base_notes_ar: parseNotes(data.base_notes_ar),
      images,
      is_featured: data.is_featured,
      is_bestseller: data.is_bestseller,
      is_published: data.is_published,
    })
    .select("id")
    .single();

  if (productError || !product?.id) {
    console.error("[createProduct] error:", productError?.message);
    if (productError?.message?.includes("fragrance_classification")) {
      return { error: "Veuillez exécuter la migration SQL '00006_expand_classification_enum.sql' dans l'éditeur SQL Supabase pour activer les classifications X2 à X8." };
    }
    if (productError?.message?.includes("unique")) {
      return { error: "Un produit avec ce slug existe déjà. Choisissez un slug différent." };
    }
    return { error: "Erreur lors de la création du produit. Veuillez réessayer." };
  }

  // 2. Insert variants
  const variantInserts = data.variants.map((v) => ({
    product_id: product.id,
    size: v.size,
    sku: v.sku,
    price_dzd: v.price_dzd,
    compare_at_price_dzd: v.compare_at_price_dzd || null,
    stock_quantity: v.stock_quantity,
    is_active: v.is_active,
  }));

  const { error: variantsError } = await (admin.from("product_variants") as any).insert(
    variantInserts
  );

  if (variantsError) {
    // Rollback product if variants fail
    await (admin.from("products") as any).delete().eq("id", product.id);
    console.error("[createProduct] variants error:", variantsError.message);
    if (variantsError.message?.includes("unique")) {
      return { error: "Un SKU ou une taille existe déjà. Vérifiez vos variantes." };
    }
    return { error: "Erreur lors de la création des variantes." };
  }

  redirect(`/${locale}/admin/products`);
}

// ─── UPDATE PRODUCT ──────────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  formData: FormData,
  locale: string = "fr"
): Promise<ProductFormState> {
  await requireStaff(locale);

  const raw = Object.fromEntries(formData.entries());

  let variants: z.infer<typeof variantSchema>[] = [];
  try {
    variants = JSON.parse((raw.variants as string) || "[]");
  } catch {
    return { error: "Données variantes invalides." };
  }

  const seasons = formData.getAll("seasons").map(String);

  const parsed = productFormSchema.safeParse({
    ...raw,
    seasons,
    variants,
    is_featured: raw.is_featured === "true" || raw.is_featured === "on",
    is_bestseller: raw.is_bestseller === "true" || raw.is_bestseller === "on",
    is_published: raw.is_published === "true" || raw.is_published === "on",
    fragrance_family_id: raw.fragrance_family_id || null,
  });

  if (!parsed.success) {
    return {
      error: "Données invalides. Veuillez corriger les champs ci-dessous.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  let images: string[] = [];
  try {
    images = data.images ? JSON.parse(data.images) : [];
  } catch {
    images = data.images ? [data.images] : [];
  }

  // 1. Update product
  const { error: productError } = await (admin.from("products") as any)
    .update({
      slug: data.slug,
      name_fr: data.name_fr,
      name_ar: data.name_ar,
      description_fr: data.description_fr,
      description_ar: data.description_ar,
      gender: data.gender,
      classification: data.classification,
      fragrance_family_id: data.fragrance_family_id || null,
      seasons: data.seasons,
      top_notes_fr: parseNotes(data.top_notes_fr),
      top_notes_ar: parseNotes(data.top_notes_ar),
      heart_notes_fr: parseNotes(data.heart_notes_fr),
      heart_notes_ar: parseNotes(data.heart_notes_ar),
      base_notes_fr: parseNotes(data.base_notes_fr),
      base_notes_ar: parseNotes(data.base_notes_ar),
      images,
      is_featured: data.is_featured,
      is_bestseller: data.is_bestseller,
      is_published: data.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (productError) {
    console.error("[updateProduct] error:", productError.message);
    if (productError.message?.includes("fragrance_classification")) {
      return { error: "Veuillez exécuter la migration SQL '00006_expand_classification_enum.sql' dans l'éditeur SQL Supabase pour activer les classifications X2 à X8." };
    }
    return { error: "Erreur lors de la mise à jour du produit." };
  }

  // 2. Delete existing variants and re-insert (simplest upsert strategy)
  await (admin.from("product_variants") as any).delete().eq("product_id", productId);

  const variantInserts = data.variants.map((v) => ({
    product_id: productId,
    size: v.size,
    sku: v.sku,
    price_dzd: v.price_dzd,
    compare_at_price_dzd: v.compare_at_price_dzd || null,
    stock_quantity: v.stock_quantity,
    is_active: v.is_active,
  }));

  const { error: variantsError } = await (admin.from("product_variants") as any).insert(
    variantInserts
  );

  if (variantsError) {
    console.error("[updateProduct] variants error:", variantsError.message);
    return { error: "Erreur lors de la mise à jour des variantes." };
  }

  redirect(`/${locale}/admin/products`);
}

// ─── GET FRAGRANCE FAMILIES (for select dropdowns) ───────────────────────────

export async function getFragranceFamilies() {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("fragrance_families") as any).select(
      "id, name_fr, name_ar"
    );
    return (data || []) as { id: string; name_fr: string; name_ar: string }[];
  } catch {
    return [];
  }
}

// ─── GET SINGLE PRODUCT FOR EDITING ─────────────────────────────────────────

export async function getProductForEdit(productId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("products") as any)
      .select(
        `
        *,
        product_variants (id, size, sku, price_dzd, compare_at_price_dzd, stock_quantity, is_active)
      `
      )
      .eq("id", productId)
      .single();

    if (error || !data) return null;
    return data as any;
  } catch {
    return null;
  }
}
