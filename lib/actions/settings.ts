"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/security/auth-guard";
import {
  getStoreSettings,
  getWilayaDeliveryRates,
  saveStoreSettings,
  saveWilayaDeliveryRates,
} from "@/lib/services/settings.service";
import { fetchEcoTrackCarrierFees } from "@/lib/services/ecotrack.service";
import { DeliveryPricingTariffType, WilayaDeliveryRateRecord } from "@/types/settings";

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
  deliveryPricingMode: z.enum(["manual", "carrier"]).optional(),
  deliveryPricingCarrierId: z.string().nullable().optional(),
  deliveryPricingTariffType: z.enum(["home", "stop_desk"]).optional(),
  deliveryPricingSyncedAt: z.string().nullable().optional(),
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

/**
 * Fetches live delivery fees per wilaya from the selected EcoTrack carrier
 * (Navex, Anderson, or any custom EcoTrack carrier) and applies them across all 69 wilayas.
 */
export async function syncWilayaRatesFromCarrierAction(
  payload: {
    carrierId: string;
    tariffType: DeliveryPricingTariffType;
  },
  locale: string = "fr"
): Promise<{
  success: boolean;
  carrierName?: string;
  syncedAt?: string;
  updatedCount?: number;
  wilayaRates?: WilayaDeliveryRateRecord[];
  error?: string;
}> {
  try {
    await requireAdminPermission("settings_team", locale);

    if (!payload.carrierId) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "يرجى اختيار شركة توصيل أولاً."
            : "Veuillez sélectionner un transporteur EcoTrack.",
      };
    }

    const tariffType: DeliveryPricingTariffType =
      payload.tariffType === "stop_desk" ? "stop_desk" : "home";

    const feesRes = await fetchEcoTrackCarrierFees(payload.carrierId);
    if (!feesRes.success || !feesRes.ratesByWilayaCode) {
      return {
        success: false,
        error:
          feesRes.error ||
          (locale === "ar"
            ? "تعذر جلب أسعار التوصيل من شركة الشحن."
            : "Impossible de récupérer les tarifs depuis EcoTrack."),
      };
    }

    const currentRates = await getWilayaDeliveryRates();
    const syncedAt = new Date().toISOString();
    let updatedCount = 0;

    const mergedRates: WilayaDeliveryRateRecord[] = currentRates.map((w) => {
      const carrierFee = feesRes.ratesByWilayaCode![w.wilayaCode];
      if (!carrierFee) return w;
      const nextFee =
        tariffType === "stop_desk" ? carrierFee.stopDeskFeeDZD : carrierFee.homeFeeDZD;
      updatedCount++;
      return {
        ...w,
        deliveryFeeDZD: nextFee,
      };
    });

    // Persist updated rates directly to Supabase wilaya_delivery_rates
    const saveRes = await saveWilayaDeliveryRates(
      mergedRates.map((w) => ({
        wilayaCode: w.wilayaCode,
        deliveryFeeDZD: w.deliveryFeeDZD,
        estimatedDays: w.estimatedDays,
        isActive: w.isActive,
      }))
    );

    if (!saveRes.success) {
      return {
        success: false,
        error: saveRes.error || "Erreur lors de l'enregistrement des tarifs synchronisés.",
      };
    }

    // Remember the active pricing mode & carrier in store settings
    const currentSettings = await getStoreSettings();
    await saveStoreSettings({
      ...currentSettings,
      deliveryPricingMode: "carrier",
      deliveryPricingCarrierId: feesRes.carrierId || payload.carrierId,
      deliveryPricingTariffType: tariffType,
      deliveryPricingSyncedAt: syncedAt,
    });

    revalidateStoreAndAdminPaths(locale);

    return {
      success: true,
      carrierName: feesRes.carrierName,
      syncedAt,
      updatedCount,
      wilayaRates: mergedRates,
    };
  } catch (err: any) {
    console.error("[syncWilayaRatesFromCarrierAction] Error:", err);
    return {
      success: false,
      error:
        err?.message ||
        (locale === "ar"
          ? "حدث خطأ أثناء مزامنة أسعار التوصيل."
          : "Erreur inattendue lors de la synchronisation des tarifs."),
    };
  }
}

/**
 * Switches delivery pricing mode back to manual editing.
 */
export async function setDeliveryPricingModeManualAction(
  locale: string = "fr"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminPermission("settings_team", locale);
    const currentSettings = await getStoreSettings();
    const res = await saveStoreSettings({
      ...currentSettings,
      deliveryPricingMode: "manual",
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    revalidateStoreAndAdminPaths(locale);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors du changement de mode." };
  }
}
