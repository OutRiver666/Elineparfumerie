import fs from "fs";
import path from "path";
import { StorefrontContent } from "@/types/storefront-content";
import { DEFAULT_STOREFRONT_CONTENT } from "@/lib/data/storefront-content.default";
import {
  readJsonFromSupabaseStorage,
  writeJsonToSupabaseStorage,
  deleteJsonFromSupabaseStorage,
} from "@/lib/supabase/storage-json";

const CONTENT_FILE_PATH = path.join(process.cwd(), "lib", "data", "storefront-content.json");
const STORAGE_CONFIG_PATH = "config/storefront-content.json";

/**
 * Retrieve storefront content (including active themeId) from Supabase Storage first,
 * falling back cleanly to local JSON (dev) and official defaults.
 */
export async function getStorefrontContent(): Promise<StorefrontContent> {
  // 1. Primary cloud store (works on Vercel serverless & local dev)
  const cloudData = await readJsonFromSupabaseStorage<Partial<StorefrontContent>>(
    STORAGE_CONFIG_PATH
  );
  if (cloudData) {
    return deepMerge(DEFAULT_STOREFRONT_CONTENT, cloudData);
  }

  // 2. Local disk fallback (for local development if cloud config hasn't been written yet)
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const raw = await fs.promises.readFile(CONTENT_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_STOREFRONT_CONTENT, parsed);
    }
  } catch (error) {
    console.error("[getStorefrontContent] Failed to read local file, using defaults:", error);
  }

  return DEFAULT_STOREFRONT_CONTENT;
}

/**
 * Persist updated storefront content & active theme to Supabase Storage
 * (and best-effort local file in dev; never fails on read-only Vercel /var/task).
 */
export async function saveStorefrontContent(
  newContent: StorefrontContent
): Promise<{ success: boolean; error?: string }> {
  try {
    const merged = deepMerge(DEFAULT_STOREFRONT_CONTENT, newContent);
    merged.updatedAt = new Date().toISOString();

    // 1. Persist to Supabase Storage (production-safe on Vercel)
    const cloudRes = await writeJsonToSupabaseStorage(STORAGE_CONFIG_PATH, merged);

    // 2. Best-effort mirror to local disk (works in local dev, safely skipped on Vercel EROFS)
    let localSaved = false;
    try {
      const dir = path.dirname(CONTENT_FILE_PATH);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(CONTENT_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
      localSaved = true;
    } catch {
      // Expected EROFS on Vercel serverless — cloudRes already persisted it
    }

    if (!cloudRes.success && !localSaved) {
      return {
        success: false,
        error: cloudRes.error || "Impossible d'enregistrer la configuration de la vitrine.",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[saveStorefrontContent] Error saving storefront content:", error);
    return { success: false, error: error?.message || "Failed to save storefront content" };
  }
}

/**
 * Reset storefront content back to official defaults
 */
export async function resetStorefrontContentToDefault(): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteJsonFromSupabaseStorage(STORAGE_CONFIG_PATH);

    try {
      if (fs.existsSync(CONTENT_FILE_PATH)) {
        await fs.promises.unlink(CONTENT_FILE_PATH);
      }
    } catch {
      // Expected EROFS on Vercel serverless
    }

    return { success: true };
  } catch (error: any) {
    console.error("[resetStorefrontContentToDefault] Error:", error);
    return { success: false, error: error?.message || "Failed to reset storefront content" };
  }
}

/**
 * Simple deep merge for configuration objects
 */
function deepMerge<T extends Record<string, any>>(base: T, update: Partial<T>): T {
  const result: any = { ...base };
  for (const key of Object.keys(update)) {
    const val = (update as any)[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      result[key] = deepMerge(result[key] || {}, val);
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}
