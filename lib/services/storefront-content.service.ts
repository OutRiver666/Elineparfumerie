import fs from "fs";
import path from "path";
import { cache } from "react";
import { StorefrontContent } from "@/types/storefront-content";
import { DEFAULT_STOREFRONT_CONTENT } from "@/lib/data/storefront-content.default";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  readJsonFromSupabaseStorage,
  writeJsonToSupabaseStorage,
  deleteJsonFromSupabaseStorage,
} from "@/lib/supabase/storage-json";

const CONTENT_FILE_PATH = path.join(process.cwd(), "lib", "data", "storefront-content.json");
const STORAGE_CONFIG_PATH = "config/storefront-content.json";

async function loadStorefrontContentUncached(): Promise<StorefrontContent> {
  // 1. Primary: Supabase Postgres table `storefront_content` (instant ACID strong consistency)
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("storefront_content") as any)
      .select("content")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data?.content && typeof data.content === "object") {
      return deepMerge(DEFAULT_STOREFRONT_CONTENT, data.content);
    }
  } catch {
    // Table not created yet — fall through cleanly to cache-busted Supabase Storage
  }

  // 2. Cloud fallback: Cache-busted Supabase Storage JSON (works on Vercel with zero SQL)
  const cloudData = await readJsonFromSupabaseStorage<Partial<StorefrontContent>>(
    STORAGE_CONFIG_PATH
  );
  if (cloudData) {
    return deepMerge(DEFAULT_STOREFRONT_CONTENT, cloudData);
  }

  // 3. Local disk fallback (dev only)
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
 * Per-request memoized getter so storefront layout.tsx & page.tsx ALWAYS see
 * the exact same theme & content in a single request (no split renders).
 */
export const getStorefrontContent = cache(loadStorefrontContentUncached);

/**
 * Uncached direct read for server actions before writing (never reads stale request cache).
 */
export async function getStorefrontContentFresh(): Promise<StorefrontContent> {
  return loadStorefrontContentUncached();
}

/**
 * Persist updated storefront content & active theme to Postgres (if table exists)
 * AND Supabase Storage (always works on Vercel read-only filesystem).
 */
export async function saveStorefrontContent(
  newContent: StorefrontContent
): Promise<{ success: boolean; error?: string }> {
  try {
    const merged = deepMerge(DEFAULT_STOREFRONT_CONTENT, newContent);
    merged.updatedAt = new Date().toISOString();

    let dbSaved = false;
    try {
      const admin = createAdminClient();
      const { error } = await (admin.from("storefront_content") as any).upsert(
        {
          id: "default",
          content: merged,
          updated_at: merged.updatedAt,
        },
        { onConflict: "id" }
      );
      if (!error) {
        dbSaved = true;
      }
    } catch {
      // Table not migrated yet — Supabase Storage below persists it
    }

    // Always write to Supabase Storage as well (cache-busted reads, zero SQL needed)
    const cloudRes = await writeJsonToSupabaseStorage(STORAGE_CONFIG_PATH, merged);

    // Best-effort mirror to local disk in dev (safely skipped on Vercel EROFS)
    let localSaved = false;
    try {
      const dir = path.dirname(CONTENT_FILE_PATH);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(CONTENT_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
      localSaved = true;
    } catch {
      // Expected EROFS on Vercel serverless
    }

    if (!dbSaved && !cloudRes.success && !localSaved) {
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
    try {
      const admin = createAdminClient();
      await (admin.from("storefront_content") as any).delete().eq("id", "default");
    } catch {
      // Safe ignore if table doesn't exist
    }

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
