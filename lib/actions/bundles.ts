"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminPermission } from "@/lib/security/auth-guard";

async function requireStaff(locale: string = "fr") {
  const { user } = await requireAdminPermission("packs_manage", locale);
  return user;
}

// ─── Predefined Bundle Validation ───────────────────────────────────────────

const bundleItemSchema = z.object({
  productId: z.string().uuid("ID de produit invalide"),
  variantId: z.string().uuid("ID de variante invalide"),
  quantity: z.coerce.number().int().min(1, "Quantité minimum 1").default(1),
});

const predefinedBundleSchema = z.object({
  id: z.string().uuid().optional(),
  name_fr: z.string().min(2, "Le nom en français est requis"),
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب"),
  slug: z
    .string()
    .min(2, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
  description_fr: z.string().min(5, "Description française requise"),
  description_ar: z.string().min(5, "الوصف بالعربية مطلوب"),
  fixed_price_dzd: z.coerce.number().min(0, "Le prix doit être positif"),
  discount_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  required_bottles_count: z.coerce.number().int().min(1).default(2),
  allowed_sizes: z.array(z.string()).min(1, "Sélectionnez au moins une taille autorisée"),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  items: z.array(bundleItemSchema).min(1, "Ajoutez au moins un parfum dans le pack"),
});

export type PredefinedBundleInput = z.infer<typeof predefinedBundleSchema>;

// ─── Actions for Predefined Packs ───────────────────────────────────────────

export async function savePredefinedBundleAction(
  payload: PredefinedBundleInput,
  locale: string = "fr"
) {
  try {
    await requireStaff(locale);
    const parsed = predefinedBundleSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const {
      id,
      name_fr,
      name_ar,
      slug,
      description_fr,
      description_ar,
      fixed_price_dzd,
      discount_percentage,
      required_bottles_count,
      allowed_sizes,
      images,
      is_active,
      items,
    } = parsed.data;

    const admin = createAdminClient();

    let bundleId = id;

    if (bundleId) {
      // Update existing bundle
      const { error: updateError } = await (admin.from("bundles") as any)
        .update({
          name_fr,
          name_ar,
          slug,
          description_fr,
          description_ar,
          fixed_price_dzd,
          discount_percentage: discount_percentage || null,
          required_bottles_count,
          allowed_sizes,
          images,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bundleId);

      if (updateError) {
        console.error("Error updating bundle:", updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Insert new bundle
      const { data: newBundle, error: insertError } = await (admin.from("bundles") as any)
        .insert({
          type: "predefined",
          name_fr,
          name_ar,
          slug,
          description_fr,
          description_ar,
          fixed_price_dzd,
          discount_percentage: discount_percentage || null,
          required_bottles_count,
          allowed_sizes,
          images,
          is_active,
        })
        .select("id")
        .single();

      if (insertError || !newBundle) {
        console.error("Error inserting bundle:", insertError);
        return { success: false, error: insertError?.message || "Impossible de créer le pack" };
      }
      bundleId = newBundle.id;
    }

    // Sync bundle_items: delete existing items for this bundle, then insert new items
    await (admin.from("bundle_items") as any).delete().eq("bundle_id", bundleId);

    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        bundle_id: bundleId,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await (admin.from("bundle_items") as any).insert(itemsToInsert);
      if (itemsError) {
        console.error("Error inserting bundle items:", itemsError);
        return { success: false, error: "Pack sauvegardé mais erreur sur les parfums associés: " + itemsError.message };
      }
    }

    revalidatePath(`/${locale}/admin/packs`);
    revalidatePath(`/${locale}/packs`);
    revalidatePath(`/${locale}`);

    return { success: true, bundleId };
  } catch (err: any) {
    console.error("savePredefinedBundleAction exception:", err);
    return { success: false, error: err?.message || "Une erreur inattendue est survenue" };
  }
}

export async function toggleBundleActiveAction(
  bundleId: string,
  isActive: boolean,
  locale: string = "fr"
) {
  try {
    await requireStaff(locale);
    const admin = createAdminClient();
    const { error } = await (admin.from("bundles") as any)
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", bundleId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${locale}/admin/packs`);
    revalidatePath(`/${locale}/admin/packs/rules`);
    revalidatePath(`/${locale}/packs`);
    revalidatePath(`/${locale}/packs/builder`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur de mise à jour" };
  }
}

export async function deleteBundleAction(bundleId: string, locale: string = "fr") {
  try {
    await requireStaff(locale);
    const admin = createAdminClient();

    // bundle_items cascades on delete
    const { error } = await (admin.from("bundles") as any).delete().eq("id", bundleId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${locale}/admin/packs`);
    revalidatePath(`/${locale}/admin/packs/rules`);
    revalidatePath(`/${locale}/packs`);
    revalidatePath(`/${locale}/packs/builder`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la suppression" };
  }
}

// ─── Actions for Custom Pack Rules / Tiers ──────────────────────────────────

const customTierSchema = z.object({
  id: z.string().uuid().optional(),
  name_fr: z.string().min(2, "Nom français requis"),
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب"),
  slug: z
    .string()
    .min(2, "Slug requis")
    .regex(/^[a-z0-9-]+$/, "Slug: minuscules, chiffres et tirets"),
  description_fr: z.string().min(5, "Description française requise"),
  description_ar: z.string().min(5, "الوصف بالعربية مطلوب"),
  required_bottles_count: z.coerce.number().int().min(2, "Minimum 2 flacons pour une formule pack"),
  discount_percentage: z.coerce.number().min(1, "Pourcentage minimum 1%").max(90, "Pourcentage maximum 90%"),
  allowed_sizes: z.array(z.string()).min(1, "Sélectionnez au moins une contenance autorisée"),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

export type CustomTierInput = z.infer<typeof customTierSchema>;

export async function saveCustomTierAction(payload: CustomTierInput, locale: string = "fr") {
  try {
    await requireStaff(locale);
    const parsed = customTierSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const {
      id,
      name_fr,
      name_ar,
      slug,
      description_fr,
      description_ar,
      required_bottles_count,
      discount_percentage,
      allowed_sizes,
      images,
      is_active,
    } = parsed.data;

    const admin = createAdminClient();

    if (id) {
      const { error: updateError } = await (admin.from("bundles") as any)
        .update({
          name_fr,
          name_ar,
          slug,
          description_fr,
          description_ar,
          required_bottles_count,
          discount_percentage,
          allowed_sizes,
          images,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await (admin.from("bundles") as any).insert({
        type: "custom",
        name_fr,
        name_ar,
        slug,
        description_fr,
        description_ar,
        required_bottles_count,
        discount_percentage,
        allowed_sizes,
        images,
        is_active,
      });

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    revalidatePath(`/${locale}/admin/packs/rules`);
    revalidatePath(`/${locale}/packs/builder`);
    revalidatePath(`/${locale}/packs`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur de sauvegarde de la règle" };
  }
}
