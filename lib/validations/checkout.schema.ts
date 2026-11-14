import { z } from "zod";

// Algerian phone number regex: starts with 05, 06, or 07, followed by 8 digits (total 10 digits)
// Also supports +213 format
const algerianPhoneRegex = /^(?:(?:\+|00)213|0)[567]\d{8}$/;

export const checkoutFormSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Le nom complet doit contenir au moins 3 caractères" })
    .max(100),
  phone: z
    .string()
    .regex(algerianPhoneRegex, {
      message: "Numéro de téléphone algérien invalide (ex: 0550123456)",
    }),
  alternatePhone: z
    .string()
    .regex(algerianPhoneRegex, {
      message: "Numéro de téléphone secondaire invalide",
    })
    .optional()
    .or(z.literal("")),
  wilayaCode: z
    .string()
    .min(2, { message: "Veuillez sélectionner votre Wilaya" })
    .max(2),
  communeName: z
    .string()
    .min(2, { message: "Veuillez spécifier votre Commune" }),
  deliveryAddress: z.string().optional().or(z.literal("")),
  deliveryNotes: z.string().max(300).optional(),
});

export const cartItemSchema = z.object({
  id: z.string(),
  itemType: z.enum(["single_product", "predefined_bundle", "custom_bundle"]),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  bundleId: z.string().optional(),
  quantity: z.number().int().min(1).max(20),
  // For custom bundle selections
  customSelections: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        size: z.enum(["25ml", "30ml", "50ml", "80ml", "100ml"]),
      })
    )
    .optional(),
});

export const placeOrderPayloadSchema = z.object({
  customer: checkoutFormSchema,
  items: z.array(cartItemSchema).min(1, { message: "Votre panier est vide" }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CartItemPayload = z.infer<typeof cartItemSchema>;
export type PlaceOrderPayload = z.infer<typeof placeOrderPayloadSchema>;
