import { createAdminClient } from "@/lib/supabase/admin";

const CONFIG_BUCKET = "storefront";

/**
 * Reads a JSON configuration file directly from Supabase Storage with strict cache-busting.
 * Uses a unique timestamp query param + no-store fetch so Vercel / Cloudflare / Next.js
 * NEVER serve a stale cached version after an overwrite.
 */
export async function readJsonFromSupabaseStorage<T = any>(
  storagePath: string
): Promise<T | null> {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // 1. Direct cache-busted authenticated GET to Supabase Storage origin
  if (supabaseUrl && serviceRoleKey) {
    try {
      const cleanPath = storagePath.replace(/^\/+/, "");
      const url = `${supabaseUrl}/storage/v1/object/authenticated/${CONFIG_BUCKET}/${cleanPath}?t=${Date.now()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        cache: "no-store",
        next: { revalidate: 0 },
      } as RequestInit);

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          return JSON.parse(text) as T;
        }
      }
    } catch {
      // Fall through to SDK download
    }
  }

  // 2. Fallback via Supabase SDK (createAdminClient now enforces cache: "no-store")
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
