"use server";

import {
  updateOrderStatus,
  updateOrderCallAttempts,
  getOrders,
  getOrderCounts,
  AdminOrder,
} from "@/lib/services/orders.service";
import { OrderStatus } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/security/auth-guard";

export async function fetchLiveOrderCountsAction(): Promise<{
  success: boolean;
  total: number;
  newOrders: number;
}> {
  try {
    await requireAdminPermission("orders_view");
    const counts = await getOrderCounts();
    return { success: true, total: counts.total, newOrders: counts.newOrders };
  } catch {
    return { success: false, total: 0, newOrders: 0 };
  }
}

export async function fetchLiveOrdersAction(): Promise<{
  success: boolean;
  orders?: AdminOrder[];
  newOrdersCount?: number;
}> {
  try {
    await requireAdminPermission("orders_view");
    const orders = await getOrders();
    const newOrdersCount = orders.filter((o) => o.status === "new").length;
    return { success: true, orders, newOrdersCount };
  } catch {
    return { success: false };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  isPaid?: boolean,
  cancelReason?: string
) {
  try {
    await requireAdminPermission("orders_manage");
    const result = await updateOrderStatus(orderId, status, isPaid, cancelReason);
    if (result.success) {
      revalidatePath("/[locale]/admin", "layout");
      revalidatePath("/[locale]/admin/orders", "page");
      revalidatePath("/[locale]/admin", "page");
      revalidatePath("/[locale]/admin/sales", "page");
      revalidatePath("/[locale]/admin/statistics", "page");
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err?.message || "Accès refusé" };
  }
}

export async function updateOrderCallAttemptsAction(
  orderId: string,
  attempts: number
): Promise<{ success: boolean; attempts?: number; lastAttemptAt?: string; error?: string }> {
  try {
    await requireAdminPermission("orders_manage");
    const result = await updateOrderCallAttempts(orderId, attempts);
    if (result.success) {
      revalidatePath("/[locale]/admin", "layout");
      revalidatePath("/[locale]/admin/orders", "page");
      revalidatePath("/[locale]/admin", "page");
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err?.message || "Accès refusé" };
  }
}
