import { createAdminClient } from "@/lib/supabase/admin";
import { ALGERIA_WILAYAS, getWilayaByCode } from "@/lib/data/algeria-locations";
import { PlaceOrderPayload } from "@/lib/validations/checkout.schema";
import { OrderStatus } from "@/types/database.types";
import { buildEcoTrackLabelUrl } from "@/lib/services/ecotrack.service";
import { getAllCarriersServer } from "@/lib/services/carriers.service";

export interface ServerOrderQuote {
  subtotalDZD: number;
  deliveryFeeDZD: number;
  discountDZD: number;
  totalDZD: number;
  verifiedItems: {
    productId?: string;
    variantId?: string;
    bundleId?: string;
    productName: string;
    size: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
}

/**
 * Server-Side Order Recalculator:
 * Never trusts prices or shipping rates sent from client browser!
 * Queries live Supabase database for verified variant and bundle pricing.
 */
export async function calculateServerOrderQuote(
  payload: PlaceOrderPayload
): Promise<ServerOrderQuote> {
  const supabase = createAdminClient();
  let subtotalDZD = 0;
  const verifiedItems: ServerOrderQuote["verifiedItems"] = [];

  // 1. Gather all variant IDs from single products & custom bundles
  const variantIds: string[] = [];
  const bundleIds: string[] = [];

  for (const item of payload.items) {
    if (item.itemType === "single_product" && item.variantId) {
      variantIds.push(item.variantId);
    } else if (item.itemType === "predefined_bundle" && item.bundleId) {
      bundleIds.push(item.bundleId);
    } else if (item.itemType === "custom_bundle" && item.customSelections) {
      for (const sel of item.customSelections) {
        if (sel.variantId) variantIds.push(sel.variantId);
      }
    }
  }

  // Fetch verified product variants from Supabase
  let variantMap = new Map<string, { id: string; size: string; priceDZD: number; productId: string; nameFr: string }>();
  if (variantIds.length > 0) {
    const { data: dbVariants } = await (supabase.from("product_variants") as any)
      .select(`
        id,
        size,
        price_dzd,
        product_id,
        products (id, name_fr, name_ar)
      `)
      .in("id", variantIds);

    if (dbVariants) {
      for (const v of dbVariants) {
        variantMap.set(v.id, {
          id: v.id,
          size: v.size,
          priceDZD: Number(v.price_dzd),
          productId: v.product_id,
          nameFr: v.products?.name_fr || "Parfum Éline",
        });
      }
    }
  }

  // Fetch verified bundles from Supabase
  let bundleMap = new Map<string, { id: string; nameFr: string; priceDZD: number }>();
  if (bundleIds.length > 0) {
    const { data: dbBundles } = await (supabase.from("bundles") as any)
      .select("id, name_fr, fixed_price_dzd")
      .in("id", bundleIds);

    if (dbBundles) {
      for (const b of dbBundles) {
        bundleMap.set(b.id, {
          id: b.id,
          nameFr: b.name_fr,
          priceDZD: Number(b.fixed_price_dzd || 0),
        });
      }
    }
  }

  // 2. Calculate verified item totals
  for (const item of payload.items) {
    if (item.itemType === "single_product" && item.variantId) {
      const v = variantMap.get(item.variantId);
      if (v) {
        const lineTotal = v.priceDZD * item.quantity;
        subtotalDZD += lineTotal;
        verifiedItems.push({
          productId: v.productId,
          variantId: v.id,
          productName: v.nameFr,
          size: v.size,
          unitPrice: v.priceDZD,
          quantity: item.quantity,
          totalPrice: lineTotal,
        });
      }
    } else if (item.itemType === "predefined_bundle" && item.bundleId) {
      const b = bundleMap.get(item.bundleId);
      if (b) {
        const lineTotal = b.priceDZD * item.quantity;
        subtotalDZD += lineTotal;
        verifiedItems.push({
          bundleId: b.id,
          productName: b.nameFr,
          size: "Pack",
          unitPrice: b.priceDZD,
          quantity: item.quantity,
          totalPrice: lineTotal,
        });
      }
    } else if (item.itemType === "custom_bundle" && item.customSelections) {
      let bundleSubtotal = 0;
      for (const sel of item.customSelections) {
        const v = variantMap.get(sel.variantId);
        if (v) {
          bundleSubtotal += v.priceDZD;
          verifiedItems.push({
            productId: v.productId,
            variantId: v.id,
            productName: `[Pack] ${v.nameFr}`,
            size: v.size,
            unitPrice: v.priceDZD,
            quantity: 1,
            totalPrice: v.priceDZD,
          });
        }
      }
      // Dynamically look up custom bundle tier discount from Supabase based on bottle count
      const bottleCount = item.customSelections.length;
      let tierDiscountPct = 15;
      try {
        const { data: matchedTier } = await (supabase.from("bundles") as any)
          .select("discount_percentage")
          .eq("type", "custom")
          .eq("required_bottles_count", bottleCount)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (matchedTier?.discount_percentage !== undefined && matchedTier?.discount_percentage !== null) {
          tierDiscountPct = Number(matchedTier.discount_percentage);
        }
      } catch {
        // Fallback default tier
      }
      const discount = Math.round((bundleSubtotal * tierDiscountPct) / 100);
      subtotalDZD += bundleSubtotal - discount;
    }
  }

  // 3. Lookup exact Wilaya delivery fee from Supabase or fallback list
  let deliveryFeeDZD = 600;
  const { data: dbWilaya } = await (supabase.from("wilaya_delivery_rates") as any)
    .select("delivery_fee_dzd")
    .eq("wilaya_code", payload.customer.wilayaCode)
    .single();

  if (dbWilaya && dbWilaya.delivery_fee_dzd !== null && dbWilaya.delivery_fee_dzd !== undefined) {
    deliveryFeeDZD = Number(dbWilaya.delivery_fee_dzd);
  } else {
    const matched = ALGERIA_WILAYAS.find((w) => w.code === payload.customer.wilayaCode);
    if (matched) deliveryFeeDZD = matched.deliveryFeeDZD;
  }

  const discountDZD = 0;
  const totalDZD = subtotalDZD + deliveryFeeDZD - discountDZD;

  return {
    subtotalDZD,
    deliveryFeeDZD,
    discountDZD,
    totalDZD,
    verifiedItems,
  };
}

export interface RevenueBreakdown {
  orderedRevenueDZD: number;
  confirmedRevenueDZD: number;
  deliveredRevenueDZD: number;
  collectedRevenueDZD: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
}

/**
 * Revenue Analytics separating ordered, confirmed, delivered, and collected funds
 * Cancelled and returned orders are excluded from revenue
 */
export async function getRevenueAnalytics(): Promise<RevenueBreakdown> {
  try {
    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total_dzd, is_paid");

    if (error) {
      console.error("[getRevenueAnalytics] Supabase query error:", error.message);
      return {
        orderedRevenueDZD: 0,
        confirmedRevenueDZD: 0,
        deliveredRevenueDZD: 0,
        collectedRevenueDZD: 0,
        totalOrdersCount: 0,
        pendingOrdersCount: 0,
        deliveredOrdersCount: 0,
        cancelledOrdersCount: 0,
      };
    }

    if (!orders || orders.length === 0) {
      return {
        orderedRevenueDZD: 0,
        confirmedRevenueDZD: 0,
        deliveredRevenueDZD: 0,
        collectedRevenueDZD: 0,
        totalOrdersCount: 0,
        pendingOrdersCount: 0,
        deliveredOrdersCount: 0,
        cancelledOrdersCount: 0,
      };
    }

    let orderedRevenueDZD = 0;
    let confirmedRevenueDZD = 0;
    let deliveredRevenueDZD = 0;
    let collectedRevenueDZD = 0;
    let pendingOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let cancelledOrdersCount = 0;

    const orderList = (orders || []) as any[];

    for (const o of orderList) {
      const amount = Number(o.total_dzd);

      if (o.status === "cancelled" || o.status === "returned") {
        cancelledOrdersCount++;
        continue;
      }

      orderedRevenueDZD += amount;

      if (["confirmed", "preparing", "shipped", "delivered"].includes(o.status)) {
        confirmedRevenueDZD += amount;
      }

      if (o.status === "delivered") {
        deliveredRevenueDZD += amount;
        deliveredOrdersCount++;
      }

      if (o.is_paid) {
        collectedRevenueDZD += amount;
      }

      if (o.status === "new" || o.status === "confirmed") {
        pendingOrdersCount++;
      }
    }

    return {
      orderedRevenueDZD,
      confirmedRevenueDZD,
      deliveredRevenueDZD,
      collectedRevenueDZD,
      totalOrdersCount: orders.length,
      pendingOrdersCount,
      deliveredOrdersCount,
      cancelledOrdersCount,
    };
  } catch (err: any) {
    console.error("[getRevenueAnalytics] Unexpected error:", err?.message);
    return {
      orderedRevenueDZD: 0,
      confirmedRevenueDZD: 0,
      deliveredRevenueDZD: 0,
      collectedRevenueDZD: 0,
      totalOrdersCount: 0,
      pendingOrdersCount: 0,
      deliveredOrdersCount: 0,
      cancelledOrdersCount: 0,
    };
  }
}

export interface AdminOrder {
  id: string;
  reference: string;
  customer: { name: string; phone: string; alternatePhone?: string };
  wilaya: string;
  wilayaNameFr?: string;
  wilayaNameAr?: string;
  commune: string;
  address: string;
  items: { name: string; size: string; classification?: string | null; qty: number; unitPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  isPaid: boolean;
  deliveryService?: string | null;
  trackingCode?: string | null;
  shippingLabelUrl?: string | null;
  shippingPortalUrl?: string | null;
  shippingStatus?: string | null;
  shippingSyncedAt?: string | null;
  shippingCarrier?: string;
  createdAt: string;
  notes?: string | null;
  callAttempts?: number;
  lastAttemptAt?: string | null;
}

export async function getOrders(): Promise<AdminOrder[]> {
  try {
    const supabase = createAdminClient();
    const { data: dbOrders, error } = await (supabase.from("orders") as any)
      .select(`
        *,
        order_items (
          id,
          product_name_snapshot,
          size_snapshot,
          quantity,
          unit_price_snapshot
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getOrders] Supabase query error:", error.message);
      return [];
    }

    if (!dbOrders || dbOrders.length === 0) {
      return [];
    }

    const allCarriers = await getAllCarriersServer();
    const defaultCarrier = allCarriers.find((c) => c.isActive) || allCarriers[0];

    return (dbOrders as any[]).map((o) => {
      const items = (o.order_items && o.order_items.length > 0)
        ? o.order_items.map((oi: any) => ({
            name: oi.product_name_snapshot,
            size: oi.size_snapshot || "50ml",
            classification: null,
            qty: oi.quantity,
            unitPrice: Number(oi.unit_price_snapshot),
          }))
        : [
            {
              name: "Articles Parfumerie Éline",
              size: "50ml",
              classification: null,
              qty: 1,
              unitPrice: Number(o.subtotal_dzd),
            },
          ];

      // Parse tracking number and carrier from column or delivery_notes
      let tracking = o.tracking_number || o.tracking_code || null;
      let carrierIdRaw: string = "";

      let callAttempts = 0;
      let lastAttemptAt: string | null = null;
      let shippingStatus: string | null = o.shipping_status || null;
      let shippingSyncedAt: string | null = o.shipping_synced_at || null;

      if (o.delivery_notes) {
        const matchWithCarrier = o.delivery_notes.match(/\[ECOTRACK:([a-z0-9_-]+):([A-Za-z0-9_-]+)\]/i);
        if (matchWithCarrier) {
          carrierIdRaw = matchWithCarrier[1].toLowerCase();
          tracking = matchWithCarrier[2];
        } else {
          const matchSimple = o.delivery_notes.match(/\[ECOTRACK:([A-Za-z0-9_-]+)\]/);
          if (matchSimple) {
            tracking = matchSimple[1];
          }
        }

        // Parse embedded carrier sync status fallback: [SHIP_STATUS:vers_hub:2026-11-23T...]
        if (!shippingStatus) {
          const matchShipStatus = o.delivery_notes.match(/\[SHIP_STATUS:([^:\]]+)(?::([^\]]+))?\]/i);
          if (matchShipStatus) {
            shippingStatus = matchShipStatus[1].trim();
            if (!shippingSyncedAt && matchShipStatus[2]) {
              shippingSyncedAt = matchShipStatus[2].trim();
            }
          }
        }

        // Parse call confirmation attempts: [TENTATIVE:1:2026-11-12T...] or [TENTATIVE:1]
        const matchAttempts = o.delivery_notes.match(/\[TENTATIVE:([0-3])(?::([^\]]+))?\]/i);
        if (matchAttempts) {
          callAttempts = parseInt(matchAttempts[1], 10);
          lastAttemptAt = matchAttempts[2] || null;
        }
      }

      // Resolve carrier record from dynamic registry
      const providerNeedle = (o.shipping_provider || "").toLowerCase();
      const matchedCarrier =
        (carrierIdRaw && allCarriers.find((c) => c.id.toLowerCase() === carrierIdRaw)) ||
        (providerNeedle &&
          allCarriers.find(
            (c) =>
              c.id.toLowerCase() === providerNeedle ||
              c.name.toLowerCase() === providerNeedle ||
              providerNeedle.includes(c.id.toLowerCase()) ||
              providerNeedle.includes(c.shortName.toLowerCase())
          )) ||
        defaultCarrier;

      const shippingCarrier = carrierIdRaw || matchedCarrier?.id || "navex";

      const shippingLabelUrl =
        o.shipping_label_url ||
        (tracking && matchedCarrier
          ? buildEcoTrackLabelUrl(tracking, matchedCarrier.baseUrl, matchedCarrier.apiToken)
          : null);
      const shippingPortalUrl =
        tracking && matchedCarrier
          ? `${matchedCarrier.portalUrl}${encodeURIComponent(tracking)}`
          : null;
      const deliveryService =
        o.shipping_provider ||
        matchedCarrier?.name ||
        "Navex Delivery";

      const wilayaData = getWilayaByCode(o.wilaya_code);
      const wilayaNameFr = wilayaData?.name_fr || o.wilaya_code;
      const wilayaNameAr = wilayaData?.name_ar || o.wilaya_code;

      return {
        id: o.id,
        reference: o.order_number,
        customer: {
          name: o.customer_name,
          phone: o.customer_phone,
          alternatePhone: "",
        },
        wilaya: o.wilaya_code,
        wilayaNameFr,
        wilayaNameAr,
        commune: o.commune_name,
        address: o.delivery_address,
        items,
        subtotal: Number(o.subtotal_dzd),
        deliveryFee: Number(o.delivery_fee_dzd),
        total: Number(o.total_dzd),
        status: o.status,
        isPaid: o.is_paid,
        deliveryService,
        trackingCode: tracking,
        shippingLabelUrl,
        shippingPortalUrl,
        shippingStatus,
        shippingSyncedAt,
        shippingCarrier,
        createdAt: o.created_at,
        notes: o.delivery_notes,
        callAttempts,
        lastAttemptAt,
      };
    });
  } catch (err: any) {
    console.error("[getOrders] Unexpected error:", err?.message);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  isPaid?: boolean,
  cancelReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (typeof isPaid === "boolean") {
      updates.is_paid = isPaid;
    } else if (status === "delivered") {
      updates.is_paid = true;
    }

    if (cancelReason && status === "cancelled") {
      const { data: o } = await (supabase.from("orders") as any)
        .select("delivery_notes")
        .eq("id", orderId)
        .single();
      const baseNotes = (o?.delivery_notes || "").trim();
      const reasonTag = `[ANNULATION: ${cancelReason}]`;
      updates.delivery_notes = baseNotes ? `${baseNotes} ${reasonTag}` : reasonTag;
    }

    const { error } = await (supabase.from("orders") as any)
      .update(updates)
      .eq("id", orderId);

    if (error) {
      console.error("[updateOrderStatus] Error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[updateOrderStatus] Unexpected error:", err?.message);
    return { success: false, error: err?.message || "Failed to update order" };
  }
}

export async function updateOrderCallAttempts(
  orderId: string,
  attempts: number
): Promise<{ success: boolean; attempts?: number; lastAttemptAt?: string; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data: order, error: fetchErr } = await (supabase.from("orders") as any)
      .select("delivery_notes, status")
      .eq("id", orderId)
      .single();

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    let notes = (order?.delivery_notes || "").replace(/\[TENTATIVE:[^\]]+\]/gi, "").trim();
    const timestamp = new Date().toISOString();

    if (attempts > 0) {
      const tag = `[TENTATIVE:${attempts}:${timestamp}]`;
      notes = notes ? `${notes} ${tag}` : tag;
    }

    const { error: updateErr } = await (supabase.from("orders") as any)
      .update({
        delivery_notes: notes || null,
        updated_at: timestamp,
      })
      .eq("id", orderId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    try {
      if (attempts > 0) {
        await (supabase.from("order_status_history") as any).insert({
          order_id: orderId,
          from_status: order?.status || "new",
          to_status: order?.status || "new",
          notes: `Tentative d'appel #${attempts} enregistrée`,
        });
      }
    } catch {
      // ignore table absence
    }

    return { success: true, attempts, lastAttemptAt: timestamp };
  } catch (err: any) {
    console.error("[updateOrderCallAttempts] Unexpected error:", err?.message);
    return { success: false, error: err?.message || "Erreur de mise à jour des tentatives" };
  }
}

export async function getOrderCounts(): Promise<{ total: number; newOrders: number }> {
  try {
    const supabase = createAdminClient();
    const [{ count: total, error: totalErr }, { count: newOrders, error: newErr }] = await Promise.all([
      (supabase.from("orders") as any).select("*", { count: "exact", head: true }),
      (supabase.from("orders") as any).select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

    if (totalErr) {
      console.error("[getOrderCounts] Error fetching total orders:", totalErr.message);
    }

    return {
      total: total || 0,
      newOrders: newOrders || 0,
    };
  } catch (err: any) {
    console.error("[getOrderCounts] Unexpected error:", err?.message);
    return { total: 0, newOrders: 0 };
  }
}

