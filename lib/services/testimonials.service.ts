import fs from "fs";
import path from "path";
import { Testimonial, CreateTestimonialInput } from "@/types/testimonial";
import { DEFAULT_TESTIMONIALS } from "@/lib/data/testimonials.default";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const TESTIMONIALS_FILE_PATH = path.join(process.cwd(), "lib", "data", "testimonials.json");

/**
 * Fetch all published testimonials with Supabase database & local JSON fallback
 */
export async function getTestimonials(includeUnpublished = false): Promise<Testimonial[]> {
  // 1. Try Supabase
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeUnpublished) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        author: row.author,
        city: row.city,
        quote: row.quote,
        perfume: row.perfume,
        rating: Number(row.rating) || 5,
        createdAt: row.created_at || new Date().toISOString(),
        isVerified: row.is_verified ?? true,
        isPublished: row.is_published ?? true,
      }));
    }
  } catch (dbErr) {
    // Supabase table may not exist yet, fallback gracefully to JSON
  }

  // 2. Fallback to local JSON storage
  try {
    if (fs.existsSync(TESTIMONIALS_FILE_PATH)) {
      const raw = await fs.promises.readFile(TESTIMONIALS_FILE_PATH, "utf-8");
      const parsed: Testimonial[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return includeUnpublished ? parsed : parsed.filter((t) => t.isPublished !== false);
      }
    }
  } catch (fileErr) {
    console.error("[getTestimonials] Error reading local testimonials file:", fileErr);
  }

  // 3. Fallback to hardcoded defaults
  return DEFAULT_TESTIMONIALS;
}

/**
 * Add a new testimonial from a customer
 */
export async function addTestimonial(
  input: CreateTestimonialInput
): Promise<{ success: boolean; testimonial?: Testimonial; error?: string }> {
  try {
    // Validate
    const author = input.author?.trim();
    const city = input.city?.trim();
    const quote = input.quote?.trim();
    const perfume = input.perfume?.trim();
    const rating = Math.min(5, Math.max(1, Number(input.rating) || 5));

    if (!author || author.length < 2) {
      return { success: false, error: "Veuillez renseigner votre nom (au moins 2 caractères)." };
    }
    if (!city || city.length < 2) {
      return { success: false, error: "Veuillez renseigner votre ville ou wilaya." };
    }
    if (!quote || quote.length < 6) {
      return { success: false, error: "Votre avis doit contenir au moins 6 caractères." };
    }
    if (!perfume) {
      return { success: false, error: "Veuillez spécifier le parfum concerné." };
    }

    const newTestimonial: Testimonial = {
      id: `testi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author,
      city,
      quote,
      perfume,
      rating,
      createdAt: new Date().toISOString(),
      isVerified: true,
      isPublished: true,
    };

    // 1. Save to local JSON file
    try {
      let currentList: Testimonial[] = [];
      if (fs.existsSync(TESTIMONIALS_FILE_PATH)) {
        const raw = await fs.promises.readFile(TESTIMONIALS_FILE_PATH, "utf-8");
        currentList = JSON.parse(raw);
      } else {
        currentList = [...DEFAULT_TESTIMONIALS];
      }

      currentList = [newTestimonial, ...currentList];

      const dir = path.dirname(TESTIMONIALS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }

      await fs.promises.writeFile(TESTIMONIALS_FILE_PATH, JSON.stringify(currentList, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("[addTestimonial] File write error:", fsErr);
    }

    // 2. Try saving to Supabase if table exists
    try {
      const supabase = await createServerSupabaseClient();
      await (supabase.from("testimonials") as any).insert({
        id: newTestimonial.id,
        author: newTestimonial.author,
        city: newTestimonial.city,
        quote: newTestimonial.quote,
        perfume: newTestimonial.perfume,
        rating: newTestimonial.rating,
        is_verified: true,
        is_published: true,
        created_at: newTestimonial.createdAt,
      });
    } catch {
      // Ignored if table not created yet
    }

    return { success: true, testimonial: newTestimonial };
  } catch (error: any) {
    console.error("[addTestimonial] Unexpected error:", error);
    return { success: false, error: error?.message || "Erreur lors de l'enregistrement de l'avis." };
  }
}

/**
 * Delete a testimonial by ID (for admin moderation)
 */
export async function deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete from local JSON
    if (fs.existsSync(TESTIMONIALS_FILE_PATH)) {
      const raw = await fs.promises.readFile(TESTIMONIALS_FILE_PATH, "utf-8");
      const list: Testimonial[] = JSON.parse(raw);
      const filtered = list.filter((t) => t.id !== id);
      await fs.promises.writeFile(TESTIMONIALS_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    }

    // 2. Delete from Supabase if present
    try {
      const supabase = await createServerSupabaseClient();
      await (supabase.from("testimonials") as any).delete().eq("id", id);
    } catch {
      // Ignore
    }

    return { success: true };
  } catch (error: any) {
    console.error("[deleteTestimonial] Error:", error);
    return { success: false, error: error?.message || "Erreur lors de la suppression." };
  }
}
