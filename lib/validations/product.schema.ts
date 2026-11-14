import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.enum(["25ml", "30ml", "50ml", "80ml", "100ml"]),
  sku: z.string().min(3, "Le SKU doit contenir au moins 3 caractères"),
  priceDZD: z.number().positive("Le prix doit être strictement supérieur à 0"),
  compareAtPriceDZD: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0, "Le stock ne peut pas être négatif"),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  nameFr: z.string().min(2, "Le nom français est requis"),
  nameAr: z.string().min(2, "الاسم العربي مطلوب"),
  slug: z.string().min(2, "Le slug URL est requis"),
  descriptionFr: z.string().min(10, "La description française est requise"),
  descriptionAr: z.string().min(10, "الوصف العربي مطلوب"),
  gender: z.enum(["men", "women", "unisex"]),
  seasons: z.array(z.enum(["spring", "summer", "autumn", "winter"])).min(1),
  fragranceFamilyId: z.string().uuid().optional().nullable(),
  classification: z.enum(["standard", "X2", "X3", "X4", "X5", "X6", "X7", "X8"]).default("standard"),
  topNotesFr: z.array(z.string()).default([]),
  topNotesAr: z.array(z.string()).default([]),
  heartNotesFr: z.array(z.string()).default([]),
  heartNotesAr: z.array(z.string()).default([]),
  baseNotesFr: z.array(z.string()).default([]),
  baseNotesAr: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1, "Au moins une image est requise"),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  variants: z.array(productVariantSchema).min(1, "Au moins un format/taille de flacon est requis"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;
