"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  createEcoTrackShipment,
  buildEcoTrackLabelUrl,
  getEcoTrackTrackingInfo,
  fetchEcoTrackBulkStatuses,
  deleteEcoTrackShipment,
  mapEcoTrackStatusToOrder,
  ShippingCarrierId,
  resolveCarrierConfig,
  resolveEcoTrackCommune,
} from "@/lib/services/ecotrack.service";
import { getOrders, AdminOrder } from "@/lib/services/orders.service";
import { getEcoTrackWilayaCode } from "@/lib/data/algeria-locations";
import { requireAdminPermission } from "@/lib/security/auth-guard";

function upsertShippingStatusInNotes(
  existingNotes: string | null | undefined,
  shippingStatus: string,
  syncedAt: string
): string {
  const cleaned = (existingNotes || "").replace(/\[SHIP_STATUS:[^\]]+\]/gi, "").trim();
  const tag = `[SHIP_STATUS:${shippingStatus}:${syncedAt}]`;
  return cleaned ? `${cleaned} ${tag}` : tag;
}

/**
 * Dispatches an order to Navex Delivery or Anderson Logistique (EcoTrack)
 */
export async function sendOrderToEcoTrackAction(
  orderId: string,
  options?: { carrier?: ShippingCarrierId; stopDesk?: boolean; customNotes?: string }
) {
  try {
    await requireAdminPermission("orders_manage");
    const supabase = createAdminClient();
    const carrierId: ShippingCarrierId = options?.carrier || "navex";
    const carrier = await resolveCarrierConfig(carrierId);

    // 1. Fetch order and item snapshots
    const { data: order, error } = await (supabase.from("orders") as any)
      .select(`
        *,
        order_items (
          product_name_snapshot,
          quantity,
          size_snapshot
        )
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { success: false, error: "Commande introuvable dans la base de données" };
    }

    // 2. Parse and map wilaya code (maps 1-69 down to canonical 1-58)
    const rawWilaya = parseInt(String(order.wilaya_code), 10);
    const wilayaCode = getEcoTrackWilayaCode(rawWilaya);
    if (isNaN(wilayaCode) || wilayaCode < 1 || wilayaCode > 58) {
      return {
        success: false,
        error: `Code Wilaya invalide (${order.wilaya_code}). Doit être compris entre 1 et 58.`,
      };
    }

    // Resolve canonical EcoTrack commune name
    const resolvedCommune = resolveEcoTrackCommune(wilayaCode, order.commune_name);

    // 3. Prepare product description
    let productsSummary = "Créations Éline Parfumerie";
    if (order.order_items && order.order_items.length > 0) {
      const itemsList = order.order_items
        .map((it: any) => `${it.product_name_snapshot || "Parfum"} (${it.size_snapshot || "50ml"} ×${it.quantity})`)
        .join(", ");
      productsSummary = itemsList.length > 120 ? `${itemsList.slice(0, 117)}...` : itemsList;
    }

    // 4. Send shipment to chosen carrier (Navex or Anderson)
    const res = await createEcoTrackShipment(
      {
        reference: order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
        nom_client: order.customer_name || "Client Éline",
        telephone: order.customer_phone,
        adresse: order.delivery_address || resolvedCommune || "Adresse Client",
        commune: resolvedCommune,
        code_wilaya: wilayaCode,
        montant: Number(order.total_dzd || 0),
        remarque:
          options?.customNotes ||
          (order.delivery_notes
            ? `Note: ${order.delivery_notes} | Fragile`
            : "Fragile - Flacons de Haute Parfumerie"),
        produit: productsSummary,
        type: 1, // 1 = Livraison standard
        stop_desk: options?.stopDesk ? 1 : 0,
        fragile: 1,
      },
      carrierId
    );

    if (!res.success || !res.tracking) {
      return {
        success: false,
        error: res.error || `Impossible d'enregistrer le colis chez ${carrier.name}`,
      };
    }

    const trackingNumber = res.tracking;
    const labelUrl = buildEcoTrackLabelUrl(trackingNumber, carrier.baseUrl, carrier.token);

    // 5. Update Order in Supabase (including canonical commune if it was corrected)
    const syncedAt = new Date().toISOString();
    const updatePayload: any = {
      status: "shipped",
      tracking_number: trackingNumber,
      shipping_provider: carrier.name,
      shipping_label_url: labelUrl,
      shipping_status: "prete_a_expedier",
      shipping_synced_at: syncedAt,
      updated_at: syncedAt,
    };
    if (res.resolvedCommune && order.commune_name !== res.resolvedCommune) {
      updatePayload.commune_name = res.resolvedCommune;
    }

    const { error: updateErr } = await (supabase.from("orders") as any)
      .update(updatePayload)
      .eq("id", orderId);

    if (updateErr) {
      // Fallback: Embed structured token with carrier id and status into delivery_notes
      const cleanNotes = (order.delivery_notes || "")
        .replace(/\[ECOTRACK:[^\]]+\]/gi, "")
        .replace(/\[SHIP_STATUS:[^\]]+\]/gi, "")
        .trim();
      const updatedNotes = `${cleanNotes} [ECOTRACK:${carrierId}:${trackingNumber}] [SHIP_STATUS:prete_a_expedier:${syncedAt}]`.trim();
      await (supabase.from("orders") as any)
        .update({
          status: "shipped",
          delivery_notes: updatedNotes,
          updated_at: syncedAt,
        })
        .eq("id", orderId);
    }

    // 6. Record status history entry if table exists
    try {
      await (supabase.from("order_status_history") as any).insert({
        order_id: orderId,
        from_status: order.status,
        to_status: "shipped",
        notes: `Colis expédié via ${carrier.name} (N° de suivi: ${trackingNumber})`,
      });
    } catch {
      // Ignore if table does not exist
    }

    // 7. Revalidate cached pages
    revalidatePath("/[locale]/admin", "layout");
    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin", "page");
    revalidatePath("/[locale]/admin/sales", "page");

    return {
      success: true,
      tracking: trackingNumber,
      labelUrl,
      carrier: carrier.id,
      carrierName: carrier.name,
      resolvedCommune,
      shippingStatus: "prete_a_expedier",
      shippingSyncedAt: syncedAt,
      portalUrl: `${carrier.portalUrl}${trackingNumber}`,
    };
  } catch (err: any) {
    console.error("[sendOrderToEcoTrackAction] Error:", err);
    return {
      success: false,
      error: err?.message || "Erreur inattendue lors de l'expédition",
    };
  }
}

/**
 * Synchronizes real-time delivery status from Navex or Anderson EcoTrack
 * When status is delivered/encaissed, updates order to 'delivered' and is_paid to true
 */
export async function syncEcoTrackStatusAction(
  orderId: string,
  tracking: string,
  carrierId?: ShippingCarrierId
) {
  try {
    if (!tracking) {
      return { success: false, error: "Numéro de suivi manquant" };
    }

    const carrier = await resolveCarrierConfig(carrierId || "navex");
    const info = await getEcoTrackTrackingInfo(tracking, carrier.id);
    if (!info.success) {
      return { success: false, error: info.error || `Impossible de contacter ${carrier.name}` };
    }

    const latestStatus = info.latestStatus || "prete_a_expedier";
    const mapping = mapEcoTrackStatusToOrder(latestStatus);
    const syncedAt = new Date().toISOString();

    const supabase = createAdminClient();

    // Update status and is_paid in orders table
    const updates: any = {
      status: mapping.internalStatus,
      shipping_status: latestStatus,
      shipping_synced_at: syncedAt,
      updated_at: syncedAt,
    };

    if (mapping.isPaid) {
      updates.is_paid = true;
    }

    const { error: updateErr } = await (supabase.from("orders") as any)
      .update(updates)
      .eq("id", orderId);

    if (updateErr) {
      // Fallback without extra schema columns: store live shipping status tag inside delivery_notes
      const { data: existingRow } = await (supabase.from("orders") as any)
        .select("delivery_notes")
        .eq("id", orderId)
        .maybeSingle();

      await (supabase.from("orders") as any)
        .update({
          status: mapping.internalStatus,
          ...(mapping.isPaid ? { is_paid: true } : {}),
          delivery_notes: upsertShippingStatusInNotes(
            existingRow?.delivery_notes,
            latestStatus,
            syncedAt
          ),
          updated_at: syncedAt,
        })
        .eq("id", orderId);
    }

    revalidatePath("/[locale]/admin", "layout");
    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin", "page");
    revalidatePath("/[locale]/admin/sales", "page");

    return {
      success: true,
      latestStatus,
      stageKey: mapping.stageKey,
      labelFr: mapping.labelFr,
      labelAr: mapping.labelAr,
      internalStatus: mapping.internalStatus,
      isPaid: mapping.isPaid,
      syncedAt,
      activity: info.activity || [],
      carrierName: carrier.name,
    };
  } catch (err: any) {
    console.error("[syncEcoTrackStatusAction] Error:", err);
    return { success: false, error: err?.message || "Erreur lors de la synchronisation" };
  }
}

/**
 * Cancels or deletes a shipment from Navex or Anderson EcoTrack
 */
export async function cancelEcoTrackShipmentAction(
  orderId: string,
  tracking: string,
  carrierId?: ShippingCarrierId
) {
  try {
    if (!tracking) {
      return { success: false, error: "Numéro de suivi manquant" };
    }

    const carrier = await resolveCarrierConfig(carrierId || "navex");
    const delRes = await deleteEcoTrackShipment(tracking, carrier.id);
    if (!delRes.success) {
      return { success: false, error: delRes.error || `Échec d'annulation chez ${carrier.name}` };
    }

    const supabase = createAdminClient();

    // Revert status to 'confirmed' and clear tracking
    const { error: updateErr } = await (supabase.from("orders") as any)
      .update({
        status: "confirmed",
        tracking_number: null,
        shipping_provider: null,
        shipping_label_url: null,
        shipping_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) {
      // Fallback
      const { data: order } = await (supabase.from("orders") as any)
        .select("delivery_notes")
        .eq("id", orderId)
        .single();

      const cleanNotes = (order?.delivery_notes || "")
        .replace(/\[ECOTRACK:[^\]]+\]/gi, "")
        .replace(/\[SHIP_STATUS:[^\]]+\]/gi, "")
        .trim();

      await (supabase.from("orders") as any)
        .update({
          status: "confirmed",
          delivery_notes: cleanNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    revalidatePath("/[locale]/admin", "layout");
    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin", "page");
    revalidatePath("/[locale]/admin/sales", "page");

    return { success: true };
  } catch (err: any) {
    console.error("[cancelEcoTrackShipmentAction] Error:", err);
    return { success: false, error: err?.message || "Erreur inattendue" };
  }
}

/**
 * Automatically synchronizes all orders dispatched from this dashboard
 * across both Navex Delivery and Anderson Logistique (EcoTrack).
 */
export async function syncAllEcoTrackOrdersAction(options?: {
  carrier?: "all" | ShippingCarrierId;
  force?: boolean;
}): Promise<{
  success: boolean;
  checkedCount: number;
  updatedCount: number;
  syncedAt: string;
  orders?: AdminOrder[];
  error?: string;
}> {
  const syncedAt = new Date().toISOString();
  try {
    await requireAdminPermission("orders_view");

    const allOrders = await getOrders();
    const targetCarrier = options?.carrier || "all";
    const force = Boolean(options?.force);

    // Filter to orders dispatched from this dashboard (having a tracking code)
    const dispatched = allOrders.filter((o) => {
      if (!o.trackingCode) return false;

      const carrierId: ShippingCarrierId =
        o.shippingCarrier ||
        (o.deliveryService?.toLowerCase().includes("anderson") ? "anderson" : "navex");

      if (targetCarrier !== "all" && carrierId !== targetCarrier) {
        return false;
      }

      if (force) return true;

      // In automatic background sync: always sync active shipments, unpaid delivered parcels,
      // or any dispatched order that has never been synced yet.
      const isFinalized =
        (o.status === "delivered" && o.isPaid && Boolean(o.shippingStatus)) ||
        ((o.status === "returned" || o.status === "cancelled") && Boolean(o.shippingStatus));

      return !isFinalized;
    });

    if (dispatched.length === 0) {
      return {
        success: true,
        checkedCount: 0,
        updatedCount: 0,
        syncedAt,
        orders: allOrders,
      };
    }

    // Group dispatched orders dynamically by any EcoTrack carrier ID
    const ordersByCarrier = new Map<string, AdminOrder[]>();
    for (const o of dispatched) {
      const carrierId: ShippingCarrierId = o.shippingCarrier || "navex";
      const list = ordersByCarrier.get(carrierId) || [];
      list.push(o);
      ordersByCarrier.set(carrierId, list);
    }

    // Fetch live statuses from ALL active EcoTrack carriers in parallel
    const carrierEntries = Array.from(ordersByCarrier.entries());
    const fetchedMaps = await Promise.all(
      carrierEntries.map(async ([carrierId, list]) => {
        const statusMap = await fetchEcoTrackBulkStatuses(
          list.map((o) => o.trackingCode!).filter(Boolean),
          carrierId
        );
        return { carrierId, list, statusMap };
      })
    );

    const supabase = createAdminClient();
    let updatedCount = 0;

    const persistUpdates = async (
      orderList: AdminOrder[],
      statusMap: Record<string, string>
    ) => {
      const CONCURRENCY = 8;
      for (let i = 0; i < orderList.length; i += CONCURRENCY) {
        const batch = orderList.slice(i, i + CONCURRENCY);
        await Promise.allSettled(
          batch.map(async (order) => {
            const trk = order.trackingCode;
            if (!trk) return;
            const liveRawStatus = statusMap[trk];
            if (!liveRawStatus) return;

            const mapping = mapEcoTrackStatusToOrder(liveRawStatus);
            const nextIsPaid = order.isPaid || mapping.isPaid;

            const statusChanged =
              order.shippingStatus !== liveRawStatus ||
              order.status !== mapping.internalStatus ||
              order.isPaid !== nextIsPaid;

            if (!statusChanged && order.shippingSyncedAt) {
              return;
            }

            const updates: Record<string, any> = {
              status: mapping.internalStatus,
              shipping_status: liveRawStatus,
              shipping_synced_at: syncedAt,
              updated_at: syncedAt,
            };

            if (nextIsPaid) {
              updates.is_paid = true;
            }

            const { error: updateErr } = await (supabase.from("orders") as any)
              .update(updates)
              .eq("id", order.id);

            if (updateErr) {
              // Fallback if shipping_status / shipping_synced_at columns are missing: persist in delivery_notes
              await (supabase.from("orders") as any)
                .update({
                  status: mapping.internalStatus,
                  ...(nextIsPaid ? { is_paid: true } : {}),
                  delivery_notes: upsertShippingStatusInNotes(
                    order.notes,
                    liveRawStatus,
                    syncedAt
                  ),
                  updated_at: syncedAt,
                })
                .eq("id", order.id);
            }

            if (statusChanged) {
              updatedCount++;
            }
          })
        );
      }
    };

    await Promise.all(
      fetchedMaps.map(({ list, statusMap }) => persistUpdates(list, statusMap))
    );

    const freshOrders = updatedCount > 0 ? await getOrders() : allOrders;

    if (updatedCount > 0) {
      revalidatePath("/[locale]/admin", "layout");
      revalidatePath("/[locale]/admin/orders", "page");
      revalidatePath("/[locale]/admin", "page");
      revalidatePath("/[locale]/admin/sales", "page");
    }

    return {
      success: true,
      checkedCount: dispatched.length,
      updatedCount,
      syncedAt,
      orders: freshOrders,
    };
  } catch (err: any) {
    console.error("[syncAllEcoTrackOrdersAction] Error:", err);
    return {
      success: false,
      checkedCount: 0,
      updatedCount: 0,
      syncedAt,
      error: err?.message || "Erreur lors de la synchronisation automatique",
    };
  }
}
