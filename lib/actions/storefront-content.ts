"use server";

import fs from "fs";
import path from "path";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { StorefrontContent } from "@/types/storefront-content";
import {
  getStorefrontContent,
  saveStorefrontContent,
  resetStorefrontContentToDefault,
} from "@/lib/services/storefront-content.service";
import {
  StorefrontThemeId,
  resolveStorefrontThemeId,
} from "@/lib/themes/storefront-themes";

export async function uploadStorefrontImageAction(
  formData: FormData,
  locale: string = "fr"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireStaff(locale);

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return { success: false, error: "Aucun fichier sélectionné." };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Format de fichier invalide. Veuillez sélectionner une image (JPG, PNG, WEBP).",
      };
    }

    if (file.size > 12 * 1024 * 1024) {
      return { success: false, error: "L'image ne doit pas dépasser 12 Mo." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
    const filename = `storefront_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    // 1. Upload to Supabase Storage "storefront" bucket
    try {
      const admin = createAdminClient();
      const { error: uploadError } = await admin.storage
        .from("storefront")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: pubUrl } = admin.storage.from("storefront").getPublicUrl(filename);
        if (pubUrl?.publicUrl) {
          return { success: true, url: pubUrl.publicUrl };
        }
      }
    } catch (storageErr) {
      console.warn("[uploadStorefrontImageAction] Supabase storage fallback to local:", storageErr);
    }

    // 2. Fallback: Save to public/uploads/
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    return { success: true, url: `/uploads/${filename}` };
  } catch (error: any) {
    console.error("[uploadStorefrontImageAction] Error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors du téléchargement de l'image.",
    };
  }
}

import { requireAdminPermission } from "@/lib/security/auth-guard";

async function requireStaff(locale: string) {
  const { user } = await requireAdminPermission("ui_controller", locale);
  return user;
}

export async function updateStorefrontContentAction(
  content: StorefrontContent,
  locale: string = "fr"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff(locale);

    const result = await saveStorefrontContent(content);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate storefront pages immediately across locales
    revalidatePath("/fr", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/fr");
    revalidatePath("/ar");
    revalidatePath(`/${locale}`);
    revalidatePath("/fr/admin/ui-controller");
    revalidatePath("/ar/admin/ui-controller");

    return { success: true };
  } catch (error: any) {
    console.error("[updateStorefrontContentAction] Error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la sauvegarde du contenu de la vitrine.",
    };
  }
}

export async function setStorefrontThemeAction(
  themeId: StorefrontThemeId,
  locale: string = "fr"
): Promise<{ success: boolean; themeId?: StorefrontThemeId; error?: string }> {
  try {
    await requireStaff(locale);

    const safeThemeId = resolveStorefrontThemeId(themeId);
    const current = await getStorefrontContent();
    const result = await saveStorefrontContent({
      ...current,
      themeId: safeThemeId,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/fr", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/fr");
    revalidatePath("/ar");
    revalidatePath("/fr/admin/ui-controller");
    revalidatePath("/ar/admin/ui-controller");

    return { success: true, themeId: safeThemeId };
  } catch (error: any) {
    console.error("[setStorefrontThemeAction] Error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors du changement de thème.",
    };
  }
}

export async function resetStorefrontContentAction(
  locale: string = "fr"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff(locale);

    const result = await resetStorefrontContentToDefault();
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/fr");
    revalidatePath("/ar");
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/admin/ui-controller`);

    return { success: true };
  } catch (error: any) {
    console.error("[resetStorefrontContentAction] Error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la réinitialisation.",
    };
  }
}
