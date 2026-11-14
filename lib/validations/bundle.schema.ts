import { z } from "zod";

export const bundleSchema = z.object({
  nameFr: z.string().min(2, "Le nom français est requis"),
  nameAr: z.string().min(2, "الاسم العربي مطلوب"),
  slug: z.string().min(2, "Le slug URL est requis"),
  descriptionFr: z.string().min(10, "La description française est requise"),
  descriptionAr: z.string().min(10, "الوصف العربي مطلوب"),
  type: z.enum(["predefined", "custom"]).default("predefined"),
  fixedPriceDZD: z.number().positive().optional().nullable(),
  discountPercentage: z.number().min(0).max(100).optional().nullable(),
  requiredBottlesCount: z.number().int().min(1).default(3),
  allowedSizes: z.array(z.enum(["25ml", "30ml", "50ml", "80ml", "100ml"])).min(1),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  // For predefined packs
  predefinedItems: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  // For custom packs
  allowedProductIds: z.array(z.string().uuid()).optional(),
});

export type BundleFormValues = z.infer<typeof bundleSchema>;
