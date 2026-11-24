"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/security/auth-guard";
import {
  CarrierAccentColor,
  EcoTrackCarrierPublic,
} from "@/lib/shipping/carriers-types";
import {
  getAllCarriersPublic,
  getCarrierByIdServer,
  upsertCarrierServer,
  toggleCarrierActiveServer,
  deleteCarrierServer,
  testEcoTrackConnectionServer,
} from "@/lib/services/carriers.service";

const carrierSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Nom de la société requis (min. 2 caractères)").max(80),
  shortName: z.string().trim().max(24).optional(),
  baseUrl: z.string().trim().min(6, "URL EcoTrack requise"),
  apiToken: z.string().trim().optional(),
  accentColor: z
    .enum(["amber", "orange", "blue", "emerald", "violet", "rose", "cyan", "zinc"])
    .default("blue"),
  isActive: z.boolean().default(true),
});

function revalidateCarrierRoutes() {
  revalidatePath("/[locale]/admin/settings", "page");
  revalidatePath("/[locale]/admin/orders", "page");
  revalidatePath("/[locale]/admin", "layout");
}

export async function saveCarrierAction(
  payload: {
    id?: string;
    name: string;
    shortName?: string;
    baseUrl: string;
    apiToken?: string;
    accentColor?: CarrierAccentColor;
    isActive?: boolean;
  },
  locale: string = "fr"
): Promise<{
  success: boolean;
  carriers?: EcoTrackCarrierPublic[];
  carrier?: EcoTrackCarrierPublic;
  persistedToDb?: boolean;
  error?: string;
}> {
  try {
    await requireAdminPermission("settings_team", locale);

    const parsed = carrierSchema.safeParse(payload);
    if (!parsed.success) {
      const firstErr = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      return {
        success: false,
        error:
          firstErr ||
          (locale === "ar"
            ? "يرجى التحقق من بيانات شركة التوصيل."
            : "Veuillez vérifier les informations du transporteur."),
      };
    }

    const res = await upsertCarrierServer(parsed.data);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidateCarrierRoutes();
    const carriers = await getAllCarriersPublic();
    return {
      success: true,
      carrier: res.carrier,
      carriers,
      persistedToDb: res.persistedToDb,
    };
  } catch (err: any) {
    console.error("[saveCarrierAction] Error:", err);
    return {
      success: false,
      error:
        err?.message ||
        (locale === "ar"
          ? "حدث خطأ أثناء حفظ شركة التوصيل."
          : "Erreur lors de l'enregistrement du transporteur."),
    };
  }
}

export async function toggleCarrierActiveAction(
  carrierId: string,
  isActive: boolean,
  locale: string = "fr"
): Promise<{ success: boolean; carriers?: EcoTrackCarrierPublic[]; error?: string }> {
  try {
    await requireAdminPermission("settings_team", locale);
    const res = await toggleCarrierActiveServer(carrierId, isActive);
    if (!res.success) return { success: false, error: res.error };

    revalidateCarrierRoutes();
    const carriers = await getAllCarriersPublic();
    return { success: true, carriers };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la mise à jour" };
  }
}

export async function deleteCarrierAction(
  carrierId: string,
  locale: string = "fr"
): Promise<{ success: boolean; carriers?: EcoTrackCarrierPublic[]; error?: string }> {
  try {
    await requireAdminPermission("settings_team", locale);
    const res = await deleteCarrierServer(carrierId);
    if (!res.success) return { success: false, error: res.error };

    revalidateCarrierRoutes();
    const carriers = await getAllCarriersPublic();
    return { success: true, carriers };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la suppression" };
  }
}

export async function testCarrierConnectionAction(
  payload: { baseUrl: string; apiToken?: string; existingCarrierId?: string },
  locale: string = "fr"
): Promise<{ success: boolean; totalOrders?: number; error?: string }> {
  try {
    await requireAdminPermission("settings_team", locale);

    let tokenToUse = (payload.apiToken || "").trim();
    let urlToUse = (payload.baseUrl || "").trim();

    if ((!tokenToUse || !urlToUse) && payload.existingCarrierId) {
      const existing = await getCarrierByIdServer(payload.existingCarrierId);
      if (existing) {
        if (!tokenToUse) tokenToUse = existing.apiToken;
        if (!urlToUse) urlToUse = existing.baseUrl;
      }
    }

    return await testEcoTrackConnectionServer(urlToUse, tokenToUse);
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Erreur lors du test de connexion EcoTrack.",
    };
  }
}
