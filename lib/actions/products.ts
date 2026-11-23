"use server";

import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/security/auth-guard";

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
  landing_page_mode: z.enum(["standard", "landing_only", "both"]).default("standard"),
  landing_page_images: z.string().optional(), // JSON array of URLs
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

function parseUrlArray(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((u): u is string => typeof u === "string")
        .map((u) => u.trim())
        .filter(Boolean);
    }
    return typeof parsed === "string" && parsed.trim() ? [parsed.trim()] : [];
  } catch {
    return value.trim() ? [value.trim()] : [];
  }
}

// ─── UPLOAD PRODUCT IMAGE (GALLERY OR LANDING PAGE) ─────────────────────────

async function uploadToStorageOrLocal(
  file: File,
  folder: "products" | "landing-pages",
  locale: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      error:
        locale === "ar"
          ? "صيغة الملف غير مدعومة. يرجى اختيار صورة (JPG, PNG, WEBP)."
          : "Format invalide. Veuillez sélectionner une image (JPG, PNG, WEBP).",
    };
  }

  if (file.size > 15 * 1024 * 1024) {
    return {
      success: false,
      error:
        locale === "ar"
          ? "حجم الصورة يجب ألا يتجاوز 15 ميجابايت."
          : "L'image ne doit pas dépasser 15 Mo.",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
  const prefix = folder === "products" ? "product" : "landing";
  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
  const storagePath = `${folder}/${filename}`;

  // 1. Upload to Supabase Storage "storefront" bucket (auto-create public bucket if missing)
  try {
    const admin = createAdminClient();
    let { error: uploadError } = await admin.storage
      .from("storefront")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError && /bucket|not found/i.test(uploadError.message || "")) {
      await admin.storage.createBucket("storefront", {
        public: true,
        fileSizeLimit: 15 * 1024 * 1024,
      });
      const retry = await admin.storage
        .from("storefront")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      uploadError = retry.error;
    }

    if (!uploadError) {
      const { data: pubUrl } = admin.storage.from("storefront").getPublicUrl(storagePath);
      if (pubUrl?.publicUrl) {
        return { success: true, url: pubUrl.publicUrl };
      }
    } else {
      console.warn(`[uploadProductImage:${folder}] Supabase storage error:`, uploadError.message);
    }
  } catch (storageErr) {
    console.warn(`[uploadProductImage:${folder}] Supabase storage fallback to local:`, storageErr);
  }

  // 2. Fallback: Save to public/uploads/<folder>/
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadsDir)) {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  }
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  return { success: true, url: `/uploads/${folder}/${filename}` };
}

export async function uploadProductGalleryImageAction(
  formData: FormData,
  locale: string = "fr"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireStaff(locale);

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return {
        success: false,
        error: locale === "ar" ? "لم يتم اختيار أي ملف." : "Aucun fichier sélectionné.",
      };
    }

    return await uploadToStorageOrLocal(file, "products", locale);
  } catch (error: any) {
    console.error("[uploadProductGalleryImageAction] Error:", error);
    return {
      success: false,
      error:
        error?.message ||
        (locale === "ar"
          ? "حدث خطأ أثناء رفع الصورة."
          : "Erreur lors du téléchargement de l'image."),
    };
  }
}

export async function uploadProductLandingImageAction(
  formData: FormData,
  locale: string = "fr"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireStaff(locale);

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return {
        success: false,
        error: locale === "ar" ? "لم يتم اختيار أي ملف." : "Aucun fichier sélectionné.",
      };
    }

    return await uploadToStorageOrLocal(file, "landing-pages", locale);
  } catch (error: any) {
    console.error("[uploadProductLandingImageAction] Error:", error);
    return {
      success: false,
      error:
        error?.message ||
        (locale === "ar"
          ? "حدث خطأ أثناء رفع الصورة."
          : "Erreur lors du téléchargement de l'image."),
    };
  }
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
    landing_page_mode: raw.landing_page_mode || "standard",
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
  const images = parseUrlArray(data.images);
  const landingPageImages = parseUrlArray(data.landing_page_images);

  if (data.landing_page_mode !== "standard" && landingPageImages.length === 0) {
    return {
      error:
        locale === "ar"
          ? "يرجى إضافة صورة واحدة على الأقل لصفحة الهبوط أو اختيار وضع صفحة التفاصيل العادية."
          : "Veuillez ajouter au moins une image pour la page landing, ou sélectionner le mode Fiche Produit Normale.",
    };
  }

  const admin = createAdminClient();

  const basePayload = {
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
  };

  // 1. Insert product
  let { data: product, error: productError } = await (admin.from("products") as any)
    .insert({
      ...basePayload,
      landing_page_mode: data.landing_page_mode,
      landing_page_images: landingPageImages,
    })
    .select("id")
    .single();

  // If landing page columns don't exist yet and mode is standard with no landing images, fallback cleanly
  if (
    productError &&
    (productError.code === "42703" || productError.message?.includes("landing_page")) &&
    data.landing_page_mode === "standard" &&
    landingPageImages.length === 0
  ) {
    const retry = await (admin.from("products") as any)
      .insert(basePayload)
      .select("id")
      .single();
    product = retry.data;
    productError = retry.error;
  }

  if (productError || !product?.id) {
    console.error("[createProduct] error:", productError?.message);
    if (productError?.code === "42703" || productError?.message?.includes("landing_page")) {
      return {
        error:
          locale === "ar"
            ? "يرجى تنفيذ ملف التحديث '00009_product_landing_page.sql' في محرر SQL على Supabase لتفعيل ميزة صفحة الهبوط."
            : "Veuillez exécuter la migration SQL '00009_product_landing_page.sql' dans l'éditeur SQL Supabase pour activer le mode Page Landing.",
      };
    }
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

  revalidatePath("/fr");
  revalidatePath("/ar");
  revalidatePath(`/fr/shop/${data.slug}`);
  revalidatePath(`/ar/shop/${data.slug}`);
  revalidatePath(`/fr/shop`);
  revalidatePath(`/ar/shop`);
  revalidatePath(`/${locale}/admin/products`);

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
    landing_page_mode: raw.landing_page_mode || "standard",
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
  const images = parseUrlArray(data.images);
  const landingPageImages = parseUrlArray(data.landing_page_images);

  if (data.landing_page_mode !== "standard" && landingPageImages.length === 0) {
    return {
      error:
        locale === "ar"
          ? "يرجى إضافة صورة واحدة على الأقل لصفحة الهبوط أو اختيار وضع صفحة التفاصيل العادية."
          : "Veuillez ajouter au moins une image pour la page landing, ou sélectionner le mode Fiche Produit Normale.",
    };
  }

  const admin = createAdminClient();

  const basePayload = {
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
  };

  // 1. Update product
  let { error: productError } = await (admin.from("products") as any)
    .update({
      ...basePayload,
      landing_page_mode: data.landing_page_mode,
      landing_page_images: landingPageImages,
    })
    .eq("id", productId);

  if (
    productError &&
    (productError.code === "42703" || productError.message?.includes("landing_page")) &&
    data.landing_page_mode === "standard" &&
    landingPageImages.length === 0
  ) {
    const retry = await (admin.from("products") as any)
      .update(basePayload)
      .eq("id", productId);
    productError = retry.error;
  }

  if (productError) {
    console.error("[updateProduct] error:", productError.message);
    if (productError?.code === "42703" || productError?.message?.includes("landing_page")) {
      return {
        error:
          locale === "ar"
            ? "يرجى تنفيذ ملف التحديث '00009_product_landing_page.sql' في محرر SQL على Supabase لتفعيل ميزة صفحة الهبوط."
            : "Veuillez exécuter la migration SQL '00009_product_landing_page.sql' dans l'éditeur SQL Supabase pour activer le mode Page Landing.",
      };
    }
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

  revalidatePath("/fr");
  revalidatePath("/ar");
  revalidatePath(`/fr/shop/${data.slug}`);
  revalidatePath(`/ar/shop/${data.slug}`);
  revalidatePath(`/fr/shop`);
  revalidatePath(`/ar/shop`);
  revalidatePath(`/${locale}/admin/products`);

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

// ─── DELETE PRODUCT ──────────────────────────────────────────────────────────

export async function deleteProduct(
  productId: string,
  locale: string = "fr"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff(locale);

    if (!productId || typeof productId !== "string") {
      return {
        success: false,
        error:
          locale === "ar"
            ? "معرّف العطر غير صالح."
            : "Identifiant du parfum invalide.",
      };
    }

    const admin = createAdminClient();

    // Fetch slug first so we can revalidate its storefront routes
    const { data: existing } = await (admin.from("products") as any)
      .select("id, slug")
      .eq("id", productId)
      .maybeSingle();

    if (!existing) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "هذا العطر غير موجود أو تم حذفه مسبقاً."
            : "Ce parfum est introuvable ou a déjà été supprimé.",
      };
    }

    const { error: deleteError } = await (admin.from("products") as any)
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("[deleteProduct] error:", deleteError);
      if (deleteError.code === "23503") {
        return {
          success: false,
          error:
            locale === "ar"
              ? "لا يمكن حذف هذا العطر لأنه مرتبط بدفعات إنتاج مسجلة. يرجى إزالة دفعات الإنتاج المرتبطة به أو إلغاء نشره بدلاً من ذلك."
              : "Impossible de supprimer ce parfum car il est lié à des lots de production. Supprimez d'abord les lots associés ou dépubliez-le.",
        };
      }
      return {
        success: false,
        error:
          locale === "ar"
            ? "حدث خطأ أثناء حذف العطر. يرجى المحاولة مرة أخرى."
            : "Erreur lors de la suppression du parfum. Veuillez réessayer.",
      };
    }

    revalidatePath("/fr");
    revalidatePath("/ar");
    revalidatePath("/fr/shop");
    revalidatePath("/ar/shop");
    revalidatePath("/fr/packs");
    revalidatePath("/ar/packs");
    revalidatePath("/fr/admin/products");
    revalidatePath("/ar/admin/products");
    if (existing.slug) {
      revalidatePath(`/fr/shop/${existing.slug}`);
      revalidatePath(`/ar/shop/${existing.slug}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("[deleteProduct] unexpected error:", error);
    return {
      success: false,
      error:
        error?.message ||
        (locale === "ar"
          ? "حدث خطأ غير متوقع أثناء الحذف."
          : "Une erreur inattendue est survenue lors de la suppression."),
    };
  }
}
