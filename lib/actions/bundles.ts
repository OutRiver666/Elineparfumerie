"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminPermission } from "@/lib/security/auth-guard";
import { getAdminCustomRules } from "@/lib/services/bundles.service";
import { getStoreSettings, saveStoreSettings } from "@/lib/services/settings.service";

function revalidateAllBundlePaths() {
  for (const loc of ["fr", "ar"]) {
    revalidatePath(`/${loc}/admin/packs`);
    revalidatePath(`/${loc}/admin/packs/rules`);
    revalidatePath(`/${loc}/admin/settings`);
    revalidatePath(`/${loc}/packs`);
    revalidatePath(`/${loc}/packs/builder`);
    revalidatePath(`/${loc}/checkout`);
    revalidatePath(`/${loc}`);
  }
}

async function syncTierDiscountToStoreSettings(
  bottlesCount: number,
  discountPct: number
) {
  if (![3, 5, 10].includes(bottlesCount)) return;
  try {
    const current = await getStoreSettings();
    const updated = {
      ...current,
      ...(bottlesCount === 3 ? { pack3DiscountPct: discountPct } : {}),
      ...(bottlesCount === 5 ? { pack5DiscountPct: discountPct } : {}),
      ...(bottlesCount === 10 ? { pack10DiscountPct: discountPct } : {}),
    };
    await saveStoreSettings(updated);
  } catch {
    // Non-fatal sync
  }
}

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

    revalidateAllBundlePaths();
    const tiers = await getAdminCustomRules();
    return { success: true, tiers };
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

    revalidateAllBundlePaths();
    const tiers = await getAdminCustomRules();
    return { success: true, tiers };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la suppression" };
  }
}

// ─── Actions for Custom Pack Rules / Tiers ──────────────────────────────────

const customTierSchema = z.object({
  id: z.string().uuid().optional(),
  name_fr: z.string().trim().min(2, "Nom français requis"),
  name_ar: z.string().trim().min(2, "الاسم بالعربية مطلوب"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug requis")
    .regex(/^[a-z0-9-]+$/, "Slug: minuscules, chiffres et tirets"),
  description_fr: z.string().trim().optional().default(""),
  description_ar: z.string().trim().optional().default(""),
  required_bottles_count: z.coerce.number().int().min(2, "Minimum 2 flacons pour une formule pack").max(20),
  discount_percentage: z.coerce.number().min(0, "Pourcentage minimum 0%").max(90, "Pourcentage maximum 90%"),
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

    const finalDescFr =
      description_fr.trim() ||
      `Composez votre coffret de ${required_bottles_count} flacons avec -${discount_percentage}% de remise immédiate.`;
    const finalDescAr =
      description_ar.trim() ||
      `اختر ${required_bottles_count} عطور مع تخفيض فوري بنسبة ${discount_percentage}%.`;

    const admin = createAdminClient();
    const now = new Date().toISOString();

    if (id) {
      const { data: updatedRow, error: updateError } = await (admin.from("bundles") as any)
        .update({
          name_fr,
          name_ar,
          slug,
          description_fr: finalDescFr,
          description_ar: finalDescAr,
          required_bottles_count,
          discount_percentage,
          allowed_sizes,
          images,
          is_active,
          updated_at: now,
        })
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (updateError) {
        return { success: false, error: updateError.message };
      }
      if (!updatedRow) {
        return {
          success: false,
          error:
            locale === "ar"
              ? "لم يتم العثور على هذه القاعدة في قاعدة البيانات."
              : "Palier introuvable dans la base de données.",
        };
      }
    } else {
      const { error: insertError } = await (admin.from("bundles") as any).insert({
        type: "custom",
        name_fr,
        name_ar,
        slug,
        description_fr: finalDescFr,
        description_ar: finalDescAr,
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

    // Keep store settings pack 3/5/10% in sync if matching bottle count
    await syncTierDiscountToStoreSettings(required_bottles_count, discount_percentage);

    revalidateAllBundlePaths();
    const tiers = await getAdminCustomRules();
    return { success: true, tiers };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur de sauvegarde de la règle" };
  }
}

/**
 * Quick inline update of a custom pack tier's discount percentage (remise %).
 */
export async function updateCustomTierDiscountAction(
  tierId: string,
  discountPercentage: number,
  locale: string = "fr"
) {
  try {
    await requireStaff(locale);

    const pct = Number(discountPercentage);
    if (!Number.isFinite(pct) || pct < 0 || pct > 90) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "نسبة التخفيض يجب أن تكون بين 0% و 90%"
            : "La remise doit être comprise entre 0% et 90%",
      };
    }

    const admin = createAdminClient();
    const { data: updated, error } = await (admin.from("bundles") as any)
      .update({
        discount_percentage: pct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tierId)
      .eq("type", "custom")
      .select("id, required_bottles_count, discount_percentage")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    if (!updated) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "تعذر العثور على القاعدة لتحديثها."
            : "Palier introuvable dans la base de données.",
      };
    }

    await syncTierDiscountToStoreSettings(
      Number(updated.required_bottles_count),
      Number(updated.discount_percentage)
    );

    revalidateAllBundlePaths();
    const tiers = await getAdminCustomRules();
    return { success: true, tiers };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Erreur lors de la mise à jour de la remise",
    };
  }
}
