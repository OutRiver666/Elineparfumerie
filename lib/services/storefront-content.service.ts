import fs from "fs";
import path from "path";
import { StorefrontContent } from "@/types/storefront-content";
import { DEFAULT_STOREFRONT_CONTENT } from "@/lib/data/storefront-content.default";

const CONTENT_FILE_PATH = path.join(process.cwd(), "lib", "data", "storefront-content.json");

/**
 * Retrieve storefront content with automatic fallback to defaults
 */
export async function getStorefrontContent(): Promise<StorefrontContent> {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const raw = await fs.promises.readFile(CONTENT_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_STOREFRONT_CONTENT, parsed);
    }
  } catch (error) {
    console.error("[getStorefrontContent] Failed to read content file, using defaults:", error);
  }
  return DEFAULT_STOREFRONT_CONTENT;
}

/**
 * Persist updated storefront content to disk
 */
export async function saveStorefrontContent(
  newContent: StorefrontContent
): Promise<{ success: boolean; error?: string }> {
  try {
    const merged = deepMerge(DEFAULT_STOREFRONT_CONTENT, newContent);
    merged.updatedAt = new Date().toISOString();

    const dir = path.dirname(CONTENT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(CONTENT_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
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
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      await fs.promises.unlink(CONTENT_FILE_PATH);
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
