"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { calculateServerOrderQuote } from "@/lib/services/orders.service";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import { resolveEcoTrackCommune } from "@/lib/services/ecotrack.service";
import {
  placeOrderPayloadSchema,
  PlaceOrderPayload,
} from "@/lib/validations/checkout.schema";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { revalidatePath } from "next/cache";
import { sendWhatsAppOrderNotification } from "@/lib/services/whatsapp.service";

interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  totalDZD?: number;
  error?: string;
}

/**
 * Server Action: Place a COD Order
 *
 * Security:
 *  - All prices are recalculated server-side. Client-submitted prices are IGNORED.
 *  - Input is validated with Zod before any DB write.
 *  - Supabase RLS is in effect.
 */
export async function placeOrder(
  rawPayload: unknown
): Promise<PlaceOrderResult> {
  // 1. Validate payload schema
  const parsed = placeOrderPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error:
        "Données invalides: " +
        parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  const payload: PlaceOrderPayload = parsed.data;

  // 1b. Rate limiting check (max 5 orders per 10 minutes per customer phone)
  const rateLimit = await checkRateLimit(`order:${payload.customer.phone}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Trop de commandes récentes associées à ce numéro. Veuillez patienter quelques minutes.",
    };
  }

  // 2. Server-side price recalculation (never trust client prices!)
  let quote;
  try {
    quote = await calculateServerOrderQuote(payload);
  } catch (err) {
    return {
      success: false,
      error: "Erreur lors du calcul du devis. Veuillez réessayer.",
    };
  }

  if (quote.verifiedItems.length === 0) {
    return {
      success: false,
      error: "Aucun article valide dans votre commande.",
    };
  }

  // 3. Generate a human-readable order reference
  const now = new Date();
  const year = now.getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const orderId = `CMD-${year}-${timestamp}`;

  // 4. Persist to Supabase (with graceful fallback for unconfigured environments)
  try {
    const supabase = createAdminClient();

    // Ensure the wilaya exists in wilaya_delivery_rates (FK requirement) WITHOUT overwriting saved admin rates
    const wilayaFromClient = ALGERIA_WILAYAS.find(
      (w) => w.code === payload.customer.wilayaCode
    );
    if (wilayaFromClient) {
      await (supabase.from("wilaya_delivery_rates") as any).upsert(
        {
          wilaya_code: wilayaFromClient.code,
          name_fr: wilayaFromClient.name_fr,
          name_ar: wilayaFromClient.name_ar,
          delivery_fee_dzd: wilayaFromClient.deliveryFeeDZD,
          estimated_days: "24h - 48h",
          is_active: true,
        },
        { onConflict: "wilaya_code", ignoreDuplicates: true }
      );
    }

    const canonicalCommune = resolveEcoTrackCommune(
      payload.customer.wilayaCode,
      payload.customer.communeName
    );

    const { data: orderRow, error: orderError } = await (
      supabase.from("orders") as any
    )
      .insert({
        order_number: orderId,
        customer_name: payload.customer.fullName,
        customer_phone: payload.customer.phone,
        wilaya_code: payload.customer.wilayaCode,
        commune_name: canonicalCommune || payload.customer.communeName,
        delivery_address:
          payload.customer.deliveryAddress?.trim() ||
          canonicalCommune ||
          payload.customer.communeName ||
          "Livraison à domicile",
        delivery_notes: payload.customer.deliveryNotes
          ? `${payload.customer.deliveryNotes}${payload.customer.alternatePhone ? ` (Tél alt: ${payload.customer.alternatePhone})` : ""}`
          : payload.customer.alternatePhone
          ? `Tél alt: ${payload.customer.alternatePhone}`
          : null,
        subtotal_dzd: quote.subtotalDZD,
        delivery_fee_dzd: quote.deliveryFeeDZD,
        discount_dzd: quote.discountDZD,
        total_dzd: quote.totalDZD,
        status: "new",
        payment_method: "COD",
        is_paid: false,
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("[placeOrder] Supabase insert error:", orderError.message);
      return {
        success: false,
        error: "Erreur lors de l'enregistrement de votre commande. Veuillez réessayer.",
      };
    }

    if (orderRow?.id && quote.verifiedItems.length > 0) {
      const itemsToInsert = quote.verifiedItems.map((vi) => ({
        order_id: orderRow.id,
        item_type: vi.bundleId ? "predefined_bundle" : "single_product",
        product_id: vi.productId || null,
        variant_id: vi.variantId || null,
        bundle_id: vi.bundleId || null,
        quantity: vi.quantity,
        unit_price_snapshot: vi.unitPrice,
        total_price_snapshot: vi.totalPrice,
        product_name_snapshot: vi.productName,
        size_snapshot: vi.size,
      }));

      await (supabase.from("order_items") as any).insert(itemsToInsert);
    }

    // Trigger WhatsApp admin alert asynchronously without blocking checkout
    sendWhatsAppOrderNotification({
      orderNumber: orderId,
      customerName: payload.customer.fullName,
      customerPhone: payload.customer.phone,
      alternatePhone: payload.customer.alternatePhone,
      wilayaName: wilayaFromClient?.name_fr || payload.customer.wilayaCode,
      communeName: canonicalCommune || payload.customer.communeName,
      deliveryAddress: payload.customer.deliveryAddress,
      totalDZD: quote.totalDZD,
      deliveryFeeDZD: quote.deliveryFeeDZD,
      items: quote.verifiedItems.map((vi) => ({
        name: vi.productName,
        size: vi.size,
        quantity: vi.quantity,
        totalPrice: vi.totalPrice,
      })),
    }).catch((err) => {
      console.error("[placeOrder] WhatsApp notification error:", err);
    });

    try {
      revalidatePath("/[locale]/admin", "layout");
      revalidatePath("/[locale]/admin/orders", "page");
      revalidatePath("/[locale]/admin", "page");
      revalidatePath("/[locale]/admin/sales", "page");
    } catch {
      // Ignore cache revalidation errors if outside request context
    }
  } catch (dbError: any) {
    console.error("[placeOrder] DB error:", dbError?.message);
    return {
      success: false,
      error: "Erreur de connexion à la base de données. Veuillez réessayer.",
    };
  }

  return {
    success: true,
    orderId,
    totalDZD: quote.totalDZD,
  };
}
