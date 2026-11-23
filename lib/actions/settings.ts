"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/security/auth-guard";
import {
  saveStoreSettings,
  saveWilayaDeliveryRates,
} from "@/lib/services/settings.service";

const generalSettingsSchema = z.object({
  brandName: z.string().min(2, "Nom de marque requis").max(120),
  contactPhone: z.string().min(4, "Téléphone requis").max(40),
  supportEmail: z.string().email("Adresse email invalide").max(120),
  addressFr: z.string().min(2).max(160),
  addressAr: z.string().min(2).max(160),
  currency: z.string().min(2).max(60),
  pack3DiscountPct: z.coerce.number().min(0).max(90),
  pack5DiscountPct: z.coerce.number().min(0).max(90),
  pack10DiscountPct: z.coerce.number().min(0).max(90),
});

const wilayaRateSchema = z.object({
  wilayaCode: z.string().min(1).max(2),
  deliveryFeeDZD: z.coerce.number().min(0).max(50000),
  estimatedDays: z.string().min(1).max(20).optional(),
  isActive: z.boolean().optional(),
});

const wilayaRatesArraySchema = z.array(wilayaRateSchema).min(1).max(100);

function revalidateStoreAndAdminPaths(locale: string) {
  try {
    revalidatePath(`/${locale}/admin/settings`);
    revalidatePath("/fr/admin/settings");
    revalidatePath("/ar/admin/settings");
    revalidatePath("/fr", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/fr/checkout");
    revalidatePath("/ar/checkout");
    revalidatePath("/fr/shop", "layout");
    revalidatePath("/ar/shop", "layout");
    revalidatePath("/fr/packs/builder");
    revalidatePath("/ar/packs/builder");
  } catch {
    // Safe ignore outside request context
  }
}

export async function saveGeneralSettingsAction(
  rawInput: unknown,
  locale: string = "fr"
): Promise<{ success: boolean; persistedToDb?: boolean; error?: string }> {
  await requireAdminPermission("settings_team", locale);

  const parsed = generalSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(" • "),
    };
  }

  const res = await saveStoreSettings(parsed.data);
  if (!res.success) {
    return { success: false, error: res.error || "Erreur lors de l'enregistrement." };
  }

  revalidateStoreAndAdminPaths(locale);
  return { success: true, persistedToDb: res.persistedToDb };
}

export async function saveWilayaRatesAction(
  rawRates: unknown,
  locale: string = "fr"
): Promise<{ success: boolean; count?: number; error?: string }> {
  await requireAdminPermission("settings_team", locale);

  const parsed = wilayaRatesArraySchema.safeParse(rawRates);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(" • "),
    };
  }

  const res = await saveWilayaDeliveryRates(parsed.data);
  if (!res.success) {
    return { success: false, error: res.error || "Erreur lors de l'enregistrement des tarifs." };
  }

  revalidateStoreAndAdminPaths(locale);
  return { success: true, count: res.count };
}

export async function saveAllSettingsAction(
  payload: {
    general: unknown;
    wilayaRates: unknown;
  },
  locale: string = "fr"
): Promise<{
  success: boolean;
  persistedGeneralToDb?: boolean;
  wilayasUpdated?: number;
  error?: string;
}> {
  await requireAdminPermission("settings_team", locale);

  const parsedGeneral = generalSettingsSchema.safeParse(payload.general);
  if (!parsedGeneral.success) {
    return {
      success: false,
      error: parsedGeneral.error.errors.map((e) => e.message).join(" • "),
    };
  }

  const parsedRates = wilayaRatesArraySchema.safeParse(payload.wilayaRates);
  if (!parsedRates.success) {
    return {
      success: false,
      error: parsedRates.error.errors.map((e) => e.message).join(" • "),
    };
  }

  const [generalRes, ratesRes] = await Promise.all([
    saveStoreSettings(parsedGeneral.data),
    saveWilayaDeliveryRates(parsedRates.data),
  ]);

  if (!generalRes.success) {
    return { success: false, error: generalRes.error };
  }
  if (!ratesRes.success) {
    return { success: false, error: ratesRes.error };
  }

  revalidateStoreAndAdminPaths(locale);
  return {
    success: true,
    persistedGeneralToDb: generalRes.persistedToDb,
    wilayasUpdated: ratesRes.count,
  };
}
