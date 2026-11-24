import { createAdminClient } from "@/lib/supabase/admin";

const CONFIG_BUCKET = "storefront";

/**
 * Reads a JSON configuration file directly from Supabase Storage (bypasses public CDN cache).
 * Works reliably on serverless read-only filesystems like Vercel (/var/task).
 */
export async function readJsonFromSupabaseStorage<T = any>(
  storagePath: string
): Promise<T | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(CONFIG_BUCKET).download(storagePath);
    if (error || !data) {
      return null;
    }
    const text = await data.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Writes a JSON configuration file to Supabase Storage (auto-creates bucket if missing).
 */
export async function writeJsonToSupabaseStorage(
  storagePath: string,
  payload: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const buffer = Buffer.from(JSON.stringify(payload, null, 2), "utf-8");

    let { error } = await admin.storage
      .from(CONFIG_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/json",
        cacheControl: "0",
        upsert: true,
      });

    if (error && /bucket|not found/i.test(error.message || "")) {
      await admin.storage.createBucket(CONFIG_BUCKET, {
        public: true,
        fileSizeLimit: 15 * 1024 * 1024,
      });
      const retry = await admin.storage
        .from(CONFIG_BUCKET)
        .upload(storagePath, buffer, {
          contentType: "application/json",
          cacheControl: "0",
          upsert: true,
        });
      error = retry.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Erreur d'écriture Supabase Storage",
    };
  }
}

/**
 * Deletes a JSON configuration file from Supabase Storage.
 */
export async function deleteJsonFromSupabaseStorage(storagePath: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.storage.from(CONFIG_BUCKET).remove([storagePath]);
  } catch {
    // Safe ignore if missing
  }
}
