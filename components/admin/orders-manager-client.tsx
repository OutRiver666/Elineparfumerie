"use client";

import React, { useState, useTransition } from "react";
import { Locale } from "@/lib/i18n";
import { AdminOrder } from "@/lib/services/orders.service";
import { OrderStatus } from "@/types/database.types";
import { getWilayaByCode } from "@/lib/data/algeria-locations";
import { updateOrderStatusAction, updateOrderCallAttemptsAction } from "@/lib/actions/orders";
import {
  sendOrderToEcoTrackAction,
  syncEcoTrackStatusAction,
  cancelEcoTrackShipmentAction,
} from "@/lib/actions/shipping";
import { formatPrice } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  RotateCcw,
  Phone,
  PhoneCall,
  MapPin,
  Search,
  Filter,
  Copy,
  Check,
  Loader2,
  Inbox,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Printer,
  ExternalLink,
  User,
  ShoppingBag,
  ArrowRight,
  Maximize2,
  Minimize2,
  Send,
  RefreshCw,
  MessageCircle,
  FileText,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface OrdersManagerClientProps {
  initialOrders: AdminOrder[];
  locale: Locale;
}

const STATUS_CONFIG: Record<
  string,
  {
    labelFr: string;
    labelAr: string;
    className: string;
    stepIndex: number;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  new: {
    labelFr: "Nouvelle",
    labelAr: "جديدة",
    className: "bg-blue-50 text-blue-700 border-blue-200/80",
    stepIndex: 1,
    icon: Clock,
  },
  confirmed: {
    labelFr: "Confirmée",
    labelAr: "مؤكدة",
    className: "bg-amber-50 text-amber-800 border-amber-200/80",
    stepIndex: 2,
    icon: CheckCircle2,
  },
  preparing: {
    labelFr: "En préparation",
    labelAr: "قيد التحضير",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    stepIndex: 3,
    icon: Package,
  },
  shipped: {
    labelFr: "Expédiée",
    labelAr: "مشحونة",
    className: "bg-purple-50 text-purple-700 border-purple-200/80",
    stepIndex: 4,
    icon: Truck,
  },
  delivered: {
    labelFr: "Livrée",
    labelAr: "تم التسليم",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    stepIndex: 5,
    icon: CheckCircle2,
  },
  cancelled: {
    labelFr: "Annulée",
    labelAr: "ملغاة",
    className: "bg-rose-50 text-rose-700 border-rose-200/80",
    stepIndex: -1,
    icon: XCircle,
  },
  returned: {
    labelFr: "Retournée",
    labelAr: "مرتجعة",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
    stepIndex: -1,
    icon: RotateCcw,
  },
  failed_delivery: {
    labelFr: "Échec livraison",
    labelAr: "فشل التسليم",
    className: "bg-rose-50 text-rose-700 border-rose-200/80",
    stepIndex: -1,
    icon: XCircle,
  },
};

const LIFECYCLE_STEPS = [
  { key: "new", labelFr: "1. Nouvelle", labelAr: "1. جديدة" },
  { key: "confirmed", labelFr: "2. Confirmée", labelAr: "2. مؤكدة" },
  { key: "preparing", labelFr: "3. Préparation", labelAr: "3. تحضير" },
  { key: "shipped", labelFr: "4. Expédiée", labelAr: "4. مشحونة" },
  { key: "delivered", labelFr: "5. Livrée & Encaissée", labelAr: "5. مسلّمة ومحصلة" },
];

function getWilayaLabel(code: string, loc: Locale = "fr"): string {
  const w = getWilayaByCode(code);
  if (!w) return `Wilaya ${code}`;
  const name = loc === "ar" ? w.name_ar : w.name_fr;
  return loc === "ar" ? `ولاية ${w.code} (${name})` : `Wilaya ${w.code} (${name})`;
}

function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function OrdersManagerClient({
  initialOrders,
  locale,
}: OrdersManagerClientProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Automatically expand the first order if available for immediate convenience
    return initialOrders.length > 0 ? new Set([initialOrders[0].id]) : new Set();
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [attemptsUpdatingId, setAttemptsUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shippingLoadingId, setShippingLoadingId] = useState<string | null>(null);
  const [stopDeskMap, setStopDeskMap] = useState<Record<string, boolean>>({});
  const [selectedCarrierMap, setSelectedCarrierMap] = useState<Record<string, "navex" | "anderson">>({});
  const [shippingMessage, setShippingMessage] = useState<{
    id: string;
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = (ids?: string[]) => {
    setExpandedIds(new Set(ids || paginatedOrders.map((o) => o.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintSlip = (order: AdminOrder) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    const itemsRows = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${it.name}</strong> (${it.size})</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${it.qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${it.unitPrice.toLocaleString("fr-DZ")} DZD</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><strong>${(it.unitPrice * it.qty).toLocaleString("fr-DZ")} DZD</strong></td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bon de Livraison - ${order.reference}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1a1a1a; }
            .header { border-bottom: 2px solid #b89358; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand { font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1a1a1a; }
            .ref { font-family: monospace; font-size: 16px; color: #b89358; margin-top: 4px; font-weight: bold; }
            .section { margin-bottom: 24px; }
            .box { background: #fdfbf7; border: 1px solid #ebd9c0; padding: 16px; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { text-align: left; padding: 8px; background: #f5efe6; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .total-row { font-size: 16px; font-weight: bold; color: #b89358; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">ÉLINE PARFUMERIE</div>
              <div style="font-size: 12px; color: #666; margin-top: 2px;">Haute Parfumerie d'Algérie</div>
              <div class="ref">${order.reference}</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #666;">
              <div>Date: ${new Date(order.createdAt).toLocaleDateString("fr-DZ")}</div>
              <div>Mode: Paiement Cash à la Livraison (COD)</div>
              <div>Statut: <strong>${order.status.toUpperCase()}</strong></div>
            </div>
          </div>

          <div class="section box">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777;">Client & Destinataire</h4>
            <div style="font-size: 16px; font-weight: bold;">${order.customer.name}</div>
            <div style="margin-top: 4px; font-size: 14px;"><strong>Tél:</strong> ${order.customer.phone} ${order.customer.alternatePhone ? `| Tél 2: ${order.customer.alternatePhone}` : ""}</div>
            <div style="margin-top: 4px; font-size: 13px;"><strong>Destination:</strong> ${getWilayaLabel(order.wilaya, "fr")} — ${order.commune}</div>
            <div style="margin-top: 2px; font-size: 13px;"><strong>Adresse:</strong> ${order.address}</div>
            ${order.notes ? `<div style="margin-top: 8px; font-size: 12px; color: #9c4221; background: #fff3e6; padding: 6px; border-radius: 2px;">Note: ${order.notes}</div>` : ""}
          </div>

          <div class="section">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777;">Contenu du Colis</h4>
            <table>
              <thead>
                <tr>
                  <th>Article & Format</th>
                  <th style="text-align: center;">Qté</th>
                  <th style="text-align: right;">Prix Unitaire</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; border-top: 1px solid #ddd;">Sous-total :</td>
                  <td style="padding: 8px; text-align: right; border-top: 1px solid #ddd;">${order.subtotal.toLocaleString("fr-DZ")} DZD</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;">Frais de livraison (${getWilayaLabel(order.wilaya, "fr")}) :</td>
                  <td style="padding: 8px; text-align: right;">${order.deliveryFee.toLocaleString("fr-DZ")} DZD</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="padding: 12px 8px; text-align: right; border-top: 2px solid #b89358;">TOTAL À PERCEVOIR (COD) :</td>
                  <td style="padding: 12px 8px; text-align: right; border-top: 2px solid #b89358;">${order.total.toLocaleString("fr-DZ")} DZD</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 48px; display: flex; justify-content: space-between; font-size: 12px; color: #666; border-top: 1px dashed #ccc; pt-4">
            <div>Signature & Cachet Éline Parfumerie</div>
            <div>Signature & Reçu du Client / Transporteur</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleStatusChange = (
    orderId: string,
    newStatus: OrderStatus,
    isPaid?: boolean,
    cancelReason?: string
  ) => {
    setUpdatingId(orderId);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus, isPaid, cancelReason);
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: newStatus,
              isPaid:
                typeof isPaid === "boolean"
                  ? isPaid
                  : newStatus === "delivered"
                  ? true
                  : o.isPaid,
            };
          })
        );
      } else {
        setErrorMessage(
          result.error ||
            (locale === "ar"
              ? "فشل تحديث حالة الطلبية"
              : "Échec de la mise à jour du statut")
        );
      }
      setUpdatingId(null);
    });
  };

  const handleToggleAttempt = async (orderId: string, targetAttempt: number) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;
    const nextAttempts =
      targetAttempt === 0
        ? 0
        : currentOrder.callAttempts === targetAttempt
        ? targetAttempt - 1
        : targetAttempt;

    setAttemptsUpdatingId(`${orderId}-${targetAttempt}`);
    setErrorMessage(null);

    try {
      const res = await updateOrderCallAttemptsAction(orderId, nextAttempts);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  callAttempts: res.attempts,
                  lastAttemptAt: res.lastAttemptAt || null,
                }
              : o
          )
        );
      } else {
        setErrorMessage(
          res.error ||
            (locale === "ar"
              ? "فشل تسجيل محاولة الاتصال"
              : "Échec de l'enregistrement de la tentative d'appel")
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur inattendue");
    } finally {
      setAttemptsUpdatingId(null);
    }
  };

  const formatPhoneForWhatsApp = (phone: string): string => {
    const digits = (phone || "").replace(/[^0-9]/g, "");
    if (digits.startsWith("213") && digits.length >= 11) return digits;
    if (digits.startsWith("0") && digits.length === 10) return "213" + digits.slice(1);
    return digits.length === 9 ? "213" + digits : digits;
  };

  const handleOpenWhatsApp = (order: AdminOrder) => {
    const cleanPhone = formatPhoneForWhatsApp(order.customer.phone);
    const tracking = order.trackingCode || "";
    const isAr = locale === "ar";
    const isAnderson =
      order.shippingCarrier === "anderson" ||
      order.deliveryService?.toLowerCase().includes("anderson");
    const carrierName = isAnderson ? "Anderson Logistique" : "Navex Delivery";
    const trackingPortal = isAnderson
      ? `https://anderson-ecommerce.ecotrack.dz/tracking/info?tracking=${tracking}`
      : `https://navexdelivery.ecotrack.dz/tracking/info?tracking=${tracking}`;

    const msg = isAr
      ? `مرحباً *${order.customer.name}*،\n\nيسعدنا إعلامكم بأنه تم تجهيز وشحن طلبيتكم *${order.reference}* من *إيلين للعطور* عبر شركة *${carrierName}* ! 🌿✨\n\n📦 *رقم التتبع الخاص بكم* : ${tracking}\n🚚 *شركة التوصيل* : ${carrierName} (EcoTrack)\n📍 *الوجهة* : ${getWilayaLabel(order.wilaya, "ar")} (${order.commune})\n💰 *المبلغ المستحق عند الاستلام (COD)* : ${order.total.toLocaleString("fr-DZ")} دج\n\n🔎 *تتبع مسار طردكم في الوقت الفعلي* :\n${trackingPortal}\n\nسيتواصل معكم الموزع هاتفياً قبل موعد التسليم. شكراً لاختياركم إيلين للعطور ! 🌸\n— فريق إيلين للعطور`
      : `Bonjour *${order.customer.name}*,\n\nVotre commande *${order.reference}* chez *Éline Parfumerie* a été expédiée avec succès via *${carrierName}* ! 🌿✨\n\n📦 *Numéro de Suivi* : ${tracking}\n🚚 *Transporteur* : ${carrierName} (EcoTrack)\n📍 *Destination* : ${getWilayaLabel(order.wilaya, "fr")} (${order.commune})\n💰 *Montant à régler à la livraison (COD)* : ${order.total.toLocaleString("fr-DZ")} DZD\n\n🔎 *Suivez votre colis en temps réel ici* :\n${trackingPortal}\n\nNotre livreur prendra contact avec vous par téléphone dès son arrivée. Merci pour votre confiance !\n— L'équipe Éline Parfumerie`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleSendToEcoTrack = async (
    order: AdminOrder,
    specificCarrier?: "navex" | "anderson"
  ) => {
    const carrierToUse: "navex" | "anderson" =
      specificCarrier || selectedCarrierMap[order.id] || "navex";
    const carrierName = carrierToUse === "anderson" ? "Anderson Logistique" : "Navex Delivery";
    setShippingLoadingId(order.id);
    setShippingMessage(null);
    setErrorMessage(null);

    try {
      const isStopDesk = !!stopDeskMap[order.id];
      const res = await sendOrderToEcoTrackAction(order.id, {
        carrier: carrierToUse,
        stopDesk: isStopDesk,
      });

      if (!res.success || !res.tracking) {
        setErrorMessage(res.error || `Échec d'expédition chez ${carrierName}`);
        setShippingMessage({
          id: order.id,
          type: "error",
          text: res.error || `Erreur de création du colis chez ${carrierName}`,
        });
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  trackingCode: res.tracking,
                  shippingLabelUrl: res.labelUrl,
                  shippingCarrier: carrierToUse,
                  deliveryService: res.carrierName || carrierName,
                  commune: (res as any).resolvedCommune || o.commune,
                  status: "shipped",
                }
              : o
          )
        );
        setShippingMessage({
          id: order.id,
          type: "success",
          text:
            locale === "ar"
              ? `✓ تم الشحن بنجاح عبر ${res.carrierName || carrierName}! رقم التتبع: ${res.tracking}`
              : `✓ Expédié avec succès via ${res.carrierName || carrierName} ! N° de suivi : ${res.tracking}`,
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || `Erreur lors de la communication avec ${carrierName}`);
    } finally {
      setShippingLoadingId(null);
    }
  };

  const handleSyncEcoTrack = async (order: AdminOrder) => {
    if (!order.trackingCode) return;
    setShippingLoadingId(order.id);
    setShippingMessage(null);

    const carrierId: "navex" | "anderson" =
      order.shippingCarrier ||
      (order.deliveryService?.toLowerCase().includes("anderson") ? "anderson" : "navex");
    const carrierName = carrierId === "anderson" ? "Anderson Logistique" : "Navex Delivery";

    try {
      const res = await syncEcoTrackStatusAction(order.id, order.trackingCode, carrierId);
      if (!res.success || !res.internalStatus) {
        setErrorMessage(res.error || `Erreur de synchronisation avec ${carrierName}`);
      } else {
        const nextStatus = res.internalStatus as OrderStatus;
        const nextPaid = typeof res.isPaid === "boolean" ? res.isPaid : order.isPaid;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: nextStatus,
                  isPaid: nextPaid,
                  shippingStatus: res.latestStatus || o.shippingStatus,
                }
              : o
          )
        );
        setShippingMessage({
          id: order.id,
          type: "success",
          text:
            locale === "ar"
              ? `✓ تم التحديث عبر ${carrierName}: ${res.labelAr || res.latestStatus} (${nextPaid ? "محصلة" : "قيد التوصيل"})`
              : `✓ Statut actualisé (${carrierName}) : ${res.labelFr || res.latestStatus} (${nextPaid ? "Encaissé ✓" : "En cours"})`,
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || `Erreur lors de la synchronisation avec ${carrierName}`);
    } finally {
      setShippingLoadingId(null);
    }
  };

  const handleCancelEcoTrack = async (order: AdminOrder) => {
    if (!order.trackingCode) return;
    const carrierId: "navex" | "anderson" =
      order.shippingCarrier ||
      (order.deliveryService?.toLowerCase().includes("anderson") ? "anderson" : "navex");
    const carrierName = carrierId === "anderson" ? "Anderson Logistique" : "Navex Delivery";
    const confirmMsg =
      locale === "ar"
        ? `هل أنت متأكد من إلغاء طرد ${carrierName} (رقم التتبع: ${order.trackingCode})؟`
        : `Êtes-vous sûr de vouloir annuler le colis ${carrierName} (Suivi: ${order.trackingCode}) ?`;
    if (!window.confirm(confirmMsg)) return;

    setShippingLoadingId(order.id);
    setShippingMessage(null);

    try {
      const res = await cancelEcoTrackShipmentAction(order.id, order.trackingCode, carrierId);
      if (!res.success) {
        setErrorMessage(res.error || `Impossible d'annuler le colis chez ${carrierName}`);
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  trackingCode: null,
                  shippingLabelUrl: null,
                  shippingCarrier: undefined,
                  status: "confirmed",
                }
              : o
          )
        );
        setShippingMessage({
          id: order.id,
          type: "success",
          text:
            locale === "ar"
              ? `✓ تم إلغاء شحنة ${carrierName} بنجاح وإعادة الطلبية لحالة مؤكدة`
              : `✓ Expédition ${carrierName} annulée avec succès. Commande rétablie à 'Confirmée'.`,
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur lors de l'annulation");
    } finally {
      setShippingLoadingId(null);
    }
  };

  // Pipeline Counts
  const newCount = orders.filter((o) => o.status === "new").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== "all" && o.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = o.reference?.toLowerCase().includes(q);
      const matchCustomer = o.customer.name?.toLowerCase().includes(q);
      const matchPhone = o.customer.phone?.toLowerCase().includes(q);
      const matchWilaya = o.wilaya?.toLowerCase().includes(q);
      const matchCommune = o.commune?.toLowerCase().includes(q);
      const matchTracking = o.trackingCode?.toLowerCase().includes(q);
      if (!matchRef && !matchCustomer && !matchPhone && !matchWilaya && !matchCommune && !matchTracking) {
        return false;
      }
    }
    return true;
  });

  // Pagination (10 orders per page)
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Top Notification / Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-bold p-1 rounded-md hover:bg-rose-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modern Filter Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {[
          { key: "all", count: orders.length, labelFr: "Toutes", labelAr: "الكل" },
          { key: "new", count: newCount, labelFr: "Nouvelles", labelAr: "جديدة", dot: "bg-blue-500", highlight: newCount > 0 },
          { key: "confirmed", count: confirmedCount, labelFr: "Confirmées", labelAr: "مؤكدة", dot: "bg-amber-500" },
          { key: "preparing", count: preparingCount, labelFr: "Préparation", labelAr: "تحضير", dot: "bg-indigo-500" },
          { key: "shipped", count: shippedCount, labelFr: "Expédiées", labelAr: "مشحونة", dot: "bg-purple-500" },
          { key: "delivered", count: deliveredCount, labelFr: "Livrées", labelAr: "مسلمة", dot: "bg-emerald-500" },
          { key: "cancelled", count: cancelledCount, labelFr: "Annulées", labelAr: "ملغاة", dot: "bg-rose-500" },
        ].map((s) => {
          const isSelected = selectedStatus === s.key;
          return (
            <button
              key={s.key}
              onClick={() => {
                setSelectedStatus(s.key);
                setCurrentPage(1);
              }}
              className={`group relative overflow-hidden p-3.5 text-center rounded-xl border transition-all duration-150 cursor-pointer text-left rtl:text-right ${
                isSelected
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                  : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs text-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[11px] font-semibold tracking-wide capitalize ${
                    isSelected ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {locale === "ar" ? s.labelAr : s.labelFr}
                </span>
                {s.dot && (
                  <span
                    className={`h-2 w-2 rounded-full ${s.dot} ${
                      s.highlight && !isSelected ? "animate-ping" : ""
                    }`}
                  />
                )}
              </div>
              <p
                className={`text-xl font-bold tracking-tight leading-none ${
                  isSelected ? "text-white" : "text-zinc-900"
                }`}
              >
                {s.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Bulk Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              locale === "ar"
                ? "بحث بالمرجع (CMD-...)، الزبون، الهاتف أو الولاية..."
                : "Rechercher par référence (CMD-...), nom du client, téléphone, wilaya..."
            }
            className="w-full text-xs pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 border border-zinc-200/80 rounded-lg bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium text-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1 transition-colors"
            >
              {locale === "ar" ? "مسح البحث" : "Effacer"}
            </button>
          )}

          <button
            onClick={expandedIds.size === paginatedOrders.length ? collapseAll : () => expandAll(paginatedOrders.map((o) => o.id))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100/80 text-xs font-semibold text-zinc-700 transition-colors shadow-2xs"
          >
            {expandedIds.size === paginatedOrders.length ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>{locale === "ar" ? "طي الكل" : "Replier tout"}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{locale === "ar" ? "توسيع الصفحة" : "Déplier la page"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Professional Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 p-12 text-center text-zinc-500 text-xs shadow-xs">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="font-semibold text-zinc-900 text-sm">
            {locale === "ar" ? "لا توجد طلبيات مطابقة" : "Aucune commande trouvée"}
          </p>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {selectedStatus !== "all" || searchQuery
              ? locale === "ar"
                ? "جرب تغيير معايير البحث أو اختيار تبويب آخر."
                : "Essayez de modifier votre recherche ou de réinitialiser le filtre de statut."
              : locale === "ar"
              ? "ستظهر الطلبيات هنا مباشرة فور قيام الزبائن بالشراء من الموقع."
              : "Les commandes des clients s'afficheront ici en direct."}
          </p>
          {(selectedStatus !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatus("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              {locale === "ar" ? "إظهار كل الطلبيات" : "Afficher toutes les commandes"}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 px-2 w-9 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[125px]">{locale === "ar" ? "الطلب / التاريخ" : "Commande"}</th>
                  <th className="py-2.5 px-3 min-w-[145px]">{locale === "ar" ? "الزبون والهاتف" : "Client & Contact"}</th>
                  <th className="py-2.5 px-3 min-w-[120px]">{locale === "ar" ? "الوجهة" : "Destination"}</th>
                  <th className="py-2.5 px-2.5 text-center min-w-[70px]">{locale === "ar" ? "القطع" : "Articles"}</th>
                  <th className="py-2.5 px-3 min-w-[105px]">{locale === "ar" ? "المبلغ COD" : "Total COD"}</th>
                  <th className="py-2.5 px-3 min-w-[160px]">{locale === "ar" ? "الحالة والناقل" : "Statut & Suivi"}</th>
                  <th className="py-2.5 px-2.5 text-center w-20">{locale === "ar" ? "تفاصيل" : "Détails"}</th>
                </tr>
              </thead>

              {/* Table Body with Expandable Rows */}
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {paginatedOrders.map((order, index) => {
                  const isExpanded = expandedIds.has(order.id);
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
                  const StatusIcon = config.icon;
                  const isUpdating = updatingId === order.id;

                  const totalItemsCount = order.items.reduce(
                    (sum, it) => sum + (it.qty || 1),
                    0
                  );

                  const initials = order.customer.name
                    ? order.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "CL";

                  return (
                    <React.Fragment key={order.id}>
                      {/* Summary Row (Clickable) */}
                      <tr
                        onClick={() => toggleExpand(order.id)}
                        className={`transition-colors cursor-pointer select-none ${
                          isExpanded
                            ? "bg-amber-50/25 border-l-4 border-l-amber-500"
                            : "hover:bg-zinc-50/70"
                        }`}
                      >
                        {/* 1. Expand Chevron */}
                        <td className="py-3 px-2 text-center text-zinc-400 w-9">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-amber-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* 2. Order Reference & Date */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 font-mono font-bold text-zinc-900 text-xs whitespace-nowrap">
                            <span>{order.reference || order.id.slice(0, 8)}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(order.reference || order.id, order.id);
                              }}
                              title="Copier la référence"
                              className="p-0.5 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-DZ" : "fr-DZ",
                              { day: "2-digit", month: "short" }
                            )}{" "}
                            <span className="font-mono text-[10px] text-zinc-400">
                              {new Date(order.createdAt).toLocaleTimeString(
                                locale === "ar" ? "ar-DZ" : "fr-DZ",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                        </td>

                        {/* 3. Customer & Phone with Avatar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border-none bg-zinc-100 shrink-0">
                              <AvatarFallback className="bg-zinc-100 text-zinc-700 text-[9px] font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-bold text-zinc-900 leading-tight text-xs truncate max-w-[130px]">
                                {order.customer.name}
                              </p>
                              <a
                                href={`tel:${order.customer.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                dir="ltr"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-900 hover:underline mt-0.5 whitespace-nowrap"
                              >
                                <Phone className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>{order.customer.phone}</span>
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* 4. Wilaya & Commune */}
                        <td className="py-3 px-3">
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 whitespace-nowrap">
                            <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            <span>{getWilayaLabel(order.wilaya, locale)}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[120px]">
                            {order.commune}
                          </p>
                        </td>

                        {/* 5. Items Summary */}
                        <td className="py-3 px-2.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-semibold">
                            <ShoppingBag className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>
                              {totalItemsCount}{" "}
                              {locale === "ar"
                                ? totalItemsCount > 1
                                  ? "عطور"
                                  : "عطر"
                                : totalItemsCount > 1
                                ? "pcs"
                                : "pc"}
                            </span>
                          </span>
                        </td>

                        {/* 6. Total Amount & Paid Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="font-bold text-zinc-900 text-xs">
                            {formatPrice(order.total, locale)}
                          </p>
                          <div className="mt-0.5">
                            {order.isPaid ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                                ✓ {locale === "ar" ? "محصلة" : "Payé"}
                              </span>
                            ) : order.status !== "cancelled" ? (
                              <span className="inline-flex items-center text-[9px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                                COD
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* 7. Status Badge & Tracking */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${config.className}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                              <span>{locale === "ar" ? config.labelAr : config.labelFr}</span>
                            </span>

                            {order.status === "new" && order.callAttempts && order.callAttempts > 0 ? (
                              <span
                                title={
                                  order.lastAttemptAt
                                    ? `Dernier appel: ${new Date(order.lastAttemptAt).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}`
                                    : undefined
                                }
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap ${
                                  order.callAttempts === 3
                                    ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                                    : order.callAttempts === 2
                                    ? "bg-amber-50 text-amber-700 border-amber-300"
                                    : "bg-amber-50 text-amber-800 border-amber-300"
                                }`}
                              >
                                <PhoneCall className="w-2.5 h-2.5 shrink-0" />
                                <span>{order.callAttempts}/3</span>
                              </span>
                            ) : null}
                          </div>

                          {order.trackingCode ? (
                            (() => {
                              const isAnderson =
                                order.shippingCarrier === "anderson" ||
                                order.deliveryService?.toLowerCase().includes("anderson");
                              const carrierLabel = isAnderson ? "Anderson" : "Navex";

                              return (
                                <div className="mt-1 flex items-center gap-1 flex-wrap">
                                  <span
                                    title={`${carrierLabel}: ${order.trackingCode}`}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-2xs whitespace-nowrap ${
                                      isAnderson
                                        ? "bg-orange-950 text-orange-300 border border-orange-800/60"
                                        : "bg-zinc-900 text-amber-300 border border-zinc-700"
                                    }`}
                                  >
                                    {isAnderson ? (
                                      <Package className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                                    ) : (
                                      <Truck className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                    )}
                                    <span>{carrierLabel}</span>
                                  </span>
                                  {order.shippingLabelUrl && (
                                    <a
                                      href={order.shippingLabelUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      title={locale === "ar" ? "طباعة بوليصة الشحن (PDF)" : `Imprimer bordereau PDF (${carrierLabel})`}
                                      className="p-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors cursor-pointer"
                                    >
                                      <FileText className="w-3 h-3" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenWhatsApp(order);
                                    }}
                                    title={locale === "ar" ? "إشعار الزبون عبر واتساب" : "Notifier le client via WhatsApp"}
                                    className="p-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors cursor-pointer"
                                  >
                                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  </button>
                                </div>
                              );
                            })()
                          ) : (
                            order.status === "confirmed" && (
                              <div className="mt-1 flex items-center gap-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendToEcoTrack(order, "navex");
                                  }}
                                  disabled={shippingLoadingId === order.id}
                                  title="Expédier avec Navex Delivery en 1-clic"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer disabled:opacity-50 shadow-2xs whitespace-nowrap"
                                >
                                  {shippingLoadingId === order.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Truck className="w-2.5 h-2.5" />
                                  )}
                                  <span>Navex</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendToEcoTrack(order, "anderson");
                                  }}
                                  disabled={shippingLoadingId === order.id}
                                  title="Expédier avec Anderson Logistique en 1-clic"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all cursor-pointer disabled:opacity-50 shadow-2xs whitespace-nowrap"
                                >
                                  {shippingLoadingId === order.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin text-white" />
                                  ) : (
                                    <Package className="w-2.5 h-2.5" />
                                  )}
                                  <span>Anderson</span>
                                </button>
                              </div>
                            )
                          )}
                        </td>

                        {/* 8. Open Button */}
                        <td className="py-3 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                              isExpanded
                                ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                                : "bg-white text-zinc-700 border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900"
                            }`}
                          >
                            <span>{isExpanded ? (locale === "ar" ? "إغلاق" : "Fermer") : (locale === "ar" ? "عرض" : "Détails")}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Content */}
                      {isExpanded && (
                        <tr className="bg-zinc-50/70">
                          <td colSpan={8} className="p-4 sm:p-6 border-b border-zinc-200/80">
                            <div className="space-y-6">
                              {/* 1. Interactive Lifecycle Timeline Stepper */}
                              <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span>
                                      {locale === "ar"
                                        ? "مسار تقدم الطلبية (Lifecycle)"
                                        : "Évolution & Traitement Logistique"}
                                    </span>
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handlePrintSlip(order)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg border border-zinc-200/80 transition-colors cursor-pointer shadow-2xs"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{locale === "ar" ? "طباعة وصل التسليم" : "Imprimer Bon de Livraison"}</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                  {LIFECYCLE_STEPS.map((step, idx) => {
                                    const stepNum = idx + 1;
                                    const currentStepIndex = config.stepIndex;
                                    const isDone = currentStepIndex > stepNum;
                                    const isCurrent = currentStepIndex === stepNum;

                                    return (
                                      <div
                                        key={step.key}
                                        className={`p-3 rounded-lg border text-center transition-all ${
                                          isCurrent
                                            ? "bg-zinc-900 text-white border-zinc-900 shadow-xs font-semibold ring-2 ring-zinc-900/10"
                                            : isDone
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium"
                                            : "bg-zinc-50/80 text-zinc-400 border-zinc-200/60"
                                        }`}
                                      >
                                        <div className="flex items-center justify-center gap-1 mb-1.5">
                                          {isDone ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                              <Check className="w-3 h-3 text-emerald-700" />
                                            </div>
                                          ) : isCurrent ? (
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                              <Clock className="w-3 h-3 text-white" />
                                            </div>
                                          ) : (
                                            <div className="w-5 h-5 rounded-full bg-zinc-200/60 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                                              {stepNum}
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs leading-tight">
                                          {locale === "ar" ? step.labelAr : step.labelFr}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 2. 3-Column Detailed Information Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CARD A: Destinataire & Livraison */}
                                <div className="bg-white p-5 rounded-xl border border-zinc-200/80 space-y-4 shadow-xs">
                                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                                      <User className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                                      {locale === "ar" ? "معلومات الزبون والتوصيل" : "Destinataire & Adresse"}
                                    </h4>
                                  </div>

                                  <div className="space-y-3 text-xs">
                                    <div>
                                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                        {locale === "ar" ? "الاسم الكامل" : "Nom & Prénom"}
                                      </p>
                                      <p className="font-bold text-zinc-900 text-sm mt-0.5">
                                        {order.customer.name}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                        {locale === "ar" ? "رقم الهاتف" : "Téléphone Principal"}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <a
                                          href={`tel:${order.customer.phone}`}
                                          dir="ltr"
                                          className="font-mono font-bold text-amber-700 hover:text-amber-800 text-sm hover:underline bg-amber-50/70 px-2 py-0.5 rounded-md border border-amber-200/50"
                                        >
                                          {order.customer.phone}
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(order.customer.phone, `phone-${order.id}`)}
                                          title="Copier le numéro"
                                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                                        >
                                          {copiedId === `phone-${order.id}` ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {order.customer.alternatePhone && (
                                      <div>
                                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                          {locale === "ar" ? "رقم بديل" : "Téléphone Secondaire"}
                                        </p>
                                        <a
                                          href={`tel:${order.customer.alternatePhone}`}
                                          dir="ltr"
                                          className="font-mono text-zinc-700 font-medium text-xs hover:underline block mt-1"
                                        >
                                          {order.customer.alternatePhone}
                                        </a>
                                      </div>
                                    )}

                                    <div className="pt-3 border-t border-zinc-100">
                                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                        {locale === "ar" ? "الولاية والبلدية" : "Localisation"}
                                      </p>
                                      <p className="font-semibold text-zinc-900 mt-1">
                                        {getWilayaLabel(order.wilaya, locale)} — {order.commune}
                                      </p>
                                      <p className="text-zinc-600 mt-1.5 text-xs leading-relaxed bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg">
                                        {order.address}
                                      </p>
                                    </div>

                                    {order.callAttempts && order.callAttempts > 0 ? (
                                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-900 bg-amber-50/90 px-3 py-2 rounded-lg border border-amber-200/80">
                                        <PhoneCall className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                        <span>
                                          {locale === "ar"
                                            ? `محاولات الاتصال للتأكيد: ${order.callAttempts}/3 مسجلة`
                                            : `Tentatives d'appel : ${order.callAttempts}/3 effectuées`}
                                          {order.lastAttemptAt && (
                                            <span className="text-zinc-500 font-mono ml-1">
                                              ({new Date(order.lastAttemptAt).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })})
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    ) : null}

                                    {order.notes && (() => {
                                      const cleanUserNotes = order.notes.replace(/\[(ECOTRACK|TENTATIVE|ANNULATION):[^\]]+\]/gi, "").trim();
                                      if (!cleanUserNotes) return null;
                                      return (
                                        <div className="mt-2 text-xs text-amber-900 bg-amber-50/90 p-3 rounded-lg border border-amber-200/80">
                                          <span className="font-bold">💬 Note du client:</span> {cleanUserNotes}
                                        </div>
                                      );
                                    })()}

                                    <div className="pt-2.5 border-t border-zinc-100 text-xs flex items-center justify-between">
                                      <span className="text-zinc-400">Transporteur : </span>
                                      <span className="font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md">{order.deliveryService || "Yalitec Express"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* CARD B: Articles & Facturation */}
                                <div className="bg-white p-5 rounded-xl border border-zinc-200/80 space-y-4 shadow-xs">
                                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700">
                                      <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                                      {locale === "ar" ? "المنتجات وتفاصيل الفاتورة" : "Articles & Facturation"}
                                    </h4>
                                  </div>

                                  {/* Items Mini-Table */}
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-start justify-between gap-3 text-xs"
                                      >
                                        <div>
                                          <p className="font-semibold text-zinc-900">
                                            {item.name}
                                          </p>
                                          <div className="flex items-center gap-1.5 mt-1">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-zinc-200 text-zinc-700">
                                              {item.size}
                                            </span>
                                            <span className="text-zinc-400">•</span>
                                            <span className="text-zinc-600 font-medium">Qté: ×{item.qty}</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-zinc-900">
                                            {formatPrice(item.unitPrice * item.qty, locale)}
                                          </p>
                                          <p className="text-[10px] text-zinc-400">
                                            {formatPrice(item.unitPrice, locale)} / u
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Pricing Breakdown */}
                                  <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                                    <div className="flex justify-between">
                                      <span>{locale === "ar" ? "المجموع الفرعي" : "Sous-total articles"} :</span>
                                      <span className="font-semibold text-zinc-900">{formatPrice(order.subtotal, locale)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{locale === "ar" ? "تكلفة التوصيل" : "Frais de livraison (Wilaya)"} :</span>
                                      <span className="font-semibold text-zinc-900">{formatPrice(order.deliveryFee, locale)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-zinc-900 border-t border-zinc-200/80 pt-2.5 mt-1 bg-zinc-50 p-2.5 rounded-lg">
                                      <span>{locale === "ar" ? "المجموع المطلوب (COD)" : "Total Net à Encaisser"} :</span>
                                      <span className="text-base text-amber-700 font-bold">{formatPrice(order.total, locale)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* CARD C: Actions & Traitement Opérationnel */}
                                <div className="bg-white p-5 rounded-xl border border-zinc-200/80 space-y-4 shadow-xs flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                                        <Package className="w-4 h-4" />
                                      </div>
                                      <h4 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                                        {locale === "ar" ? "معالجة الحالة وتحديث الطلبية" : "Actions sur le Statut"}
                                      </h4>
                                    </div>

                                    <div className="space-y-3 pt-2 text-xs">
                                      <div className="bg-zinc-50 border border-zinc-200/60 p-3 rounded-lg">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                                          {locale === "ar" ? "الحالة الحالية" : "Statut actuel de la commande"}
                                        </p>
                                        <p className="text-sm font-bold text-zinc-900 mt-1 flex items-center gap-2">
                                          <StatusIcon className="w-4 h-4 text-amber-600" />
                                          <span>{locale === "ar" ? config.labelAr : config.labelFr}</span>
                                        </p>
                                      </div>

                                      {/* Action Buttons depending on status */}
                                      <div className="space-y-2">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                                          {locale === "ar" ? "الانتقال إلى المرحلة التالية:" : "Passer à l'étape suivante :"}
                                        </p>

                                        {isUpdating ? (
                                          <div className="flex items-center justify-center gap-2 p-3 bg-zinc-100 rounded-lg text-zinc-700">
                                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                            <span className="text-xs font-semibold">
                                              {locale === "ar" ? "جاري التحديث في قاعدة البيانات..." : "Mise à jour en cours..."}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col gap-2">
                                            {order.status === "new" && (
                                              <>
                                                {/* Tentatives d'appel (1, 2, 3) */}
                                                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-zinc-800 font-semibold text-xs">
                                                      <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                                                      <span>
                                                        {locale === "ar"
                                                          ? "محاولات الاتصال للتأكيد :"
                                                          : "Tentatives d'appel :"}
                                                      </span>
                                                    </div>
                                                    {order.callAttempts && order.callAttempts > 0 ? (
                                                      <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                          order.callAttempts === 3
                                                            ? "bg-red-100 text-red-800 border border-red-300"
                                                            : order.callAttempts === 2
                                                            ? "bg-orange-100 text-orange-800 border border-orange-300"
                                                            : "bg-amber-100 text-amber-800 border border-amber-300"
                                                        }`}
                                                      >
                                                        {order.callAttempts}/3{" "}
                                                        {locale === "ar"
                                                          ? "محاولات"
                                                          : order.callAttempts > 1
                                                          ? "appels"
                                                          : "appel"}
                                                      </span>
                                                    ) : (
                                                      <span className="text-[10px] text-zinc-400 font-medium">
                                                        {locale === "ar" ? "لم يُتصل بعد" : "Non appelé"}
                                                      </span>
                                                    )}
                                                  </div>

                                                  {/* 3 Buttons: Tentative 1, Tentative 2, Tentative 3 */}
                                                  <div className="grid grid-cols-3 gap-1.5">
                                                    {[1, 2, 3].map((num) => {
                                                      const isReached = (order.callAttempts || 0) >= num;
                                                      const isExact = (order.callAttempts || 0) === num;
                                                      const isThisPending = attemptsUpdatingId === `${order.id}-${num}`;

                                                      return (
                                                        <button
                                                          key={num}
                                                          type="button"
                                                          disabled={isThisPending || isUpdating}
                                                          onClick={() => handleToggleAttempt(order.id, num)}
                                                          title={locale === "ar" ? `تسجيل المحاولة ${num}` : `Enregistrer la tentative ${num}`}
                                                          className={`py-1.5 px-1 sm:px-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                                                            isExact
                                                              ? num === 3
                                                                ? "bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-300"
                                                                : num === 2
                                                                ? "bg-orange-500 text-white border-orange-500 shadow-xs ring-2 ring-orange-300"
                                                                : "bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-300"
                                                              : isReached
                                                              ? "bg-amber-100 text-amber-900 border-amber-300 font-medium"
                                                              : "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                                                          }`}
                                                        >
                                                          {isThisPending ? (
                                                            <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                                                          ) : (
                                                            <Phone className="w-2.5 h-2.5 shrink-0" />
                                                          )}
                                                          <span className="whitespace-nowrap tracking-tight">
                                                            {locale === "ar" ? `محاولة ${num}` : `Tentative ${num}`}
                                                          </span>
                                                        </button>
                                                      );
                                                    })}
                                                  </div>

                                                  {/* Timestamp + Reset Option */}
                                                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                                                    <span>
                                                      {order.lastAttemptAt ? (
                                                        <>
                                                          {locale === "ar" ? "آخر محاولة: " : "Dernier appel: "}
                                                          <span className="font-mono text-zinc-900 font-semibold">
                                                            {new Date(order.lastAttemptAt).toLocaleTimeString(
                                                              locale === "ar" ? "ar-DZ" : "fr-DZ",
                                                              { hour: "2-digit", minute: "2-digit" }
                                                            )}
                                                          </span>
                                                        </>
                                                      ) : (
                                                        locale === "ar"
                                                          ? "اضغط لتسجيل محاولة الاتصال"
                                                          : "Cliquer pour noter un appel sans réponse"
                                                      )}
                                                    </span>

                                                    {order.callAttempts && order.callAttempts > 0 ? (
                                                      <button
                                                        type="button"
                                                        onClick={() => handleToggleAttempt(order.id, 0)}
                                                        className="text-zinc-500 hover:text-amber-700 underline transition-colors cursor-pointer"
                                                      >
                                                        {locale === "ar" ? "إلغاء (0)" : "Effacer"}
                                                      </button>
                                                    ) : null}
                                                  </div>

                                                  {/* Quick Cancel Button if 3 attempts reached */}
                                                  {order.callAttempts === 3 && (
                                                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-2 mt-1">
                                                      <p className="font-semibold flex items-center gap-1.5 text-xs text-red-700">
                                                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                                        <span>
                                                          {locale === "ar"
                                                            ? "3 محاولات اتصال دون رد (الزبون غير متاح)"
                                                            : "3 tentatives sans réponse (Client injoignable)"}
                                                        </span>
                                                      </p>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          if (
                                                            window.confirm(
                                                              locale === "ar"
                                                                ? "هل أنت متأكد من إلغاء الطلبية بسبب عدم رد الزبون بعد 3 محاولات؟"
                                                                : "Annuler cette commande pour motif 'Injoignable après 3 tentatives d'appel' ?"
                                                            )
                                                          ) {
                                                            handleStatusChange(
                                                              order.id,
                                                              "cancelled",
                                                              false,
                                                              "Injoignable après 3 tentatives d'appel"
                                                            );
                                                          }
                                                        }}
                                                        className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                                      >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        <span>
                                                          {locale === "ar"
                                                            ? "إلغاء الطلبية (غير متاح بعد 3 محاولات)"
                                                            : "Annuler la commande (Injoignable 3 tentatives)"}
                                                        </span>
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Confirmer la commande button */}
                                                <button
                                                  type="button"
                                                  onClick={() => handleStatusChange(order.id, "confirmed")}
                                                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                                >
                                                  <CheckCircle2 className="w-4 h-4" />
                                                  <span>
                                                    {locale === "ar"
                                                      ? "✓ تأكيد الطلبية (اتصال هاتفي)"
                                                      : "✓ Confirmer la commande (Appel client)"}
                                                  </span>
                                                </button>
                                              </>
                                            )}

                                            {order.status === "confirmed" && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "preparing")}
                                                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                              >
                                                <Package className="w-4 h-4" />
                                                <span>{locale === "ar" ? "🔧 إرسال للورشة (بدء التحضير)" : "🔧 Mettre en préparation à l'atelier"}</span>
                                              </button>
                                            )}

                                            {order.status === "preparing" && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "shipped")}
                                                className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                              >
                                                <Truck className="w-4 h-4" />
                                                <span>{locale === "ar" ? "📦 تسليم لشركة الشحن (شحن)" : "📦 Remettre au livreur (Expédier)"}</span>
                                              </button>
                                            )}

                                            {order.status === "shipped" && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "delivered", true)}
                                                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                              >
                                                <Check className="w-4 h-4" />
                                                <span>{locale === "ar" ? "✓ تأكيد التسليم والتحصيل Cash" : "✓ Marquer Livrée & Encaissée"}</span>
                                              </button>
                                            )}

                                            {order.status === "delivered" && !order.isPaid && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "delivered", true)}
                                                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                              >
                                                <span>💰 Encaisser les fonds COD</span>
                                              </button>
                                            )}

                                            {!["cancelled", "returned", "delivered"].includes(order.status) && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (
                                                    window.confirm(
                                                      locale === "ar"
                                                        ? "هل أنت متأكد من إلغاء هذه الطلبية؟"
                                                        : "Êtes-vous sûr de vouloir annuler cette commande ?"
                                                    )
                                                  ) {
                                                    handleStatusChange(order.id, "cancelled", false);
                                                  }
                                                }}
                                                className="w-full py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                              >
                                                {locale === "ar" ? "✕ إلغاء الطلبية" : "✕ Annuler la commande"}
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-zinc-100 text-[10px] text-zinc-400 flex justify-between items-center font-mono">
                                    <span>UUID: {order.id.slice(0, 13)}...</span>
                                    <span className="font-semibold text-zinc-600">COD Algérie</span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Navex & Anderson Multi-Carrier Logistics & WhatsApp Hub */}
                              <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg text-zinc-100">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                      <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm tracking-wide text-white">
                                          {locale === "ar"
                                            ? "مركز الشحن والتوصيل (Navex & Anderson Logistique)"
                                            : "Centre d'Expédition Multi-Transporteurs (Navex & Anderson)"}
                                        </h4>
                                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                                          EcoTrack API
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-zinc-400 mt-0.5">
                                        {locale === "ar"
                                          ? "توليد بوليصة الشحن (PDF)، التتبع الآلي وإشعار الزبون عبر واتساب بضغطة زر"
                                          : "Bordereau PDF officiel, génération du code de suivi et notification WhatsApp en 1-clic"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status Badge */}
                                  <div>
                                    {order.trackingCode ? (
                                      (() => {
                                        const isAnderson =
                                          order.shippingCarrier === "anderson" ||
                                          order.deliveryService?.toLowerCase().includes("anderson");
                                        return (
                                          <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                                              isAnderson
                                                ? "bg-orange-950/80 text-orange-300 border-orange-700/60"
                                                : "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                                            }`}
                                          >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>
                                              {isAnderson ? "Colis Anderson Logistique" : "Colis Navex Delivery"}
                                            </span>
                                          </span>
                                        );
                                      })()
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700 text-xs font-medium">
                                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{locale === "ar" ? "في انتظار الإرسال" : "Non transmis au transporteur"}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Active Notification Banner if any */}
                                {shippingMessage && shippingMessage.id === order.id && (
                                  <div
                                    className={`mt-3 p-3 rounded-lg text-xs flex items-center justify-between ${
                                      shippingMessage.type === "success"
                                        ? "bg-emerald-950/80 text-emerald-200 border border-emerald-700/60"
                                        : "bg-rose-950/80 text-rose-200 border border-rose-700/60"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {shippingMessage.type === "success" ? (
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                      )}
                                      <span className="font-medium">{shippingMessage.text}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShippingMessage(null)}
                                      className="text-zinc-400 hover:text-white font-bold ml-2 cursor-pointer p-0.5"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}

                                {/* Body Content */}
                                <div className="mt-4">
                                  {!order.trackingCode ? (
                                    /* State A: Ready to Dispatch */
                                    <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800 space-y-4">
                                      {/* Carrier Selection Switcher */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs font-semibold text-zinc-300">
                                            {locale === "ar" ? "شركة الشحن :" : "Transporteur :"}
                                          </span>
                                          <div className="inline-flex rounded-lg p-1 bg-zinc-900 border border-zinc-800">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSelectedCarrierMap((prev) => ({
                                                  ...prev,
                                                  [order.id]: "navex",
                                                }))
                                              }
                                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                (selectedCarrierMap[order.id] || "navex") === "navex"
                                                  ? "bg-amber-600 text-white shadow-xs"
                                                  : "text-zinc-400 hover:text-white"
                                              }`}
                                            >
                                              <Truck className="w-3.5 h-3.5" />
                                              <span>Navex Delivery</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSelectedCarrierMap((prev) => ({
                                                  ...prev,
                                                  [order.id]: "anderson",
                                                }))
                                              }
                                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                selectedCarrierMap[order.id] === "anderson"
                                                  ? "bg-orange-600 text-white shadow-xs"
                                                  : "text-zinc-400 hover:text-white"
                                              }`}
                                            >
                                              <Package className="w-3.5 h-3.5" />
                                              <span>Anderson Logistique</span>
                                            </button>
                                          </div>
                                        </div>

                                        <span className="text-[11px] text-zinc-400 font-mono">
                                          {(selectedCarrierMap[order.id] || "navex") === "anderson"
                                            ? "anderson-ecommerce.ecotrack.dz"
                                            : "navexdelivery.ecotrack.dz"}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                                            {locale === "ar" ? "المبلغ المستحق (COD)" : "Montant à Encaisser"}
                                          </span>
                                          <span className="font-bold text-sm text-amber-400 mt-1 block">
                                            {formatPrice(order.total, locale)}
                                          </span>
                                        </div>
                                        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                                            {locale === "ar" ? "الولاية والبلدية" : "Destination"}
                                          </span>
                                          <span className="font-semibold text-xs text-zinc-200 mt-1 block truncate">
                                            {getWilayaLabel(order.wilaya, locale)} — {order.commune}
                                          </span>
                                        </div>
                                        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                                            {locale === "ar" ? "طريقة التسليم" : "Mode de Livraison"}
                                          </span>
                                          <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={!!stopDeskMap[order.id]}
                                              onChange={(e) =>
                                                setStopDeskMap((prev) => ({
                                                  ...prev,
                                                  [order.id]: e.target.checked,
                                                }))
                                              }
                                              className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                                            />
                                            <span className="text-xs text-zinc-300">
                                              {locale === "ar" ? "Stop Desk (المكتب)" : "Stop Desk (Bureau)"}
                                            </span>
                                          </label>
                                        </div>
                                      </div>

                                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                        <p className="text-[11px] text-zinc-400">
                                          {selectedCarrierMap[order.id] === "anderson"
                                            ? (locale === "ar"
                                                ? "سيتم إرسال الطلبية لمنصة Anderson Logistique وتوليد البوليصة فوراً"
                                                : "Envoi immédiat vers l'API Anderson Logistique avec génération du bordereau")
                                            : (locale === "ar"
                                                ? "سيتم إرسال الطلبية لمنصة Navex Delivery وتوليد البوليصة فوراً"
                                                : "Envoi immédiat vers l'API Navex Delivery avec génération du bordereau")}
                                        </p>
                                        <button
                                          type="button"
                                          disabled={shippingLoadingId === order.id}
                                          onClick={() => handleSendToEcoTrack(order)}
                                          className={`w-full sm:w-auto px-5 py-2.5 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 ${
                                            selectedCarrierMap[order.id] === "anderson"
                                              ? "bg-orange-600 hover:bg-orange-700 text-white"
                                              : "bg-amber-600 hover:bg-amber-700 text-white"
                                          }`}
                                        >
                                          {shippingLoadingId === order.id ? (
                                            <>
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span>{locale === "ar" ? "جاري الإرسال والتسجيل..." : "Transmission API en cours..."}</span>
                                            </>
                                          ) : (
                                            <>
                                              <Send className="w-4 h-4" />
                                              <span>
                                                {selectedCarrierMap[order.id] === "anderson"
                                                  ? (locale === "ar" ? "🚀 إرسال عبر Anderson Logistique" : "🚀 Expédier avec Anderson Logistique (1-Clic)")
                                                  : (locale === "ar" ? "🚀 إرسال عبر Navex Delivery" : "🚀 Expédier avec Navex Delivery (1-Clic)")}
                                              </span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* State B: Order Dispatched with Live Tracking */
                                    (() => {
                                      const isAnderson =
                                        order.shippingCarrier === "anderson" ||
                                        order.deliveryService?.toLowerCase().includes("anderson");
                                      const carrierName = isAnderson ? "Anderson Logistique" : "Navex Delivery";
                                      const portalUrl = isAnderson
                                        ? `https://anderson-ecommerce.ecotrack.dz/tracking/info?tracking=${order.trackingCode}`
                                        : `https://navexdelivery.ecotrack.dz/tracking/info?tracking=${order.trackingCode}`;

                                      return (
                                        <div className="space-y-4">
                                          {/* Tracking Details Banner */}
                                          <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="space-y-1">
                                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                                                {locale === "ar"
                                                  ? `رقم التتبع الرسمي (${carrierName})`
                                                  : `Numéro de Suivi Officiel (${carrierName})`}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <span
                                                  className={`font-mono text-base font-bold tracking-wider ${
                                                    isAnderson ? "text-orange-400" : "text-amber-400"
                                                  }`}
                                                >
                                                  {order.trackingCode}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => handleCopy(order.trackingCode!, `track-${order.id}`)}
                                                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                                  title="Copier le code de suivi"
                                                >
                                                  {copiedId === `track-${order.id}` ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                  ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                  )}
                                                </button>
                                                <a
                                                  href={portalUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-[11px] text-zinc-400 hover:text-white inline-flex items-center gap-1 ml-1 transition-colors font-medium underline"
                                                >
                                                  <span>{locale === "ar" ? "بوابة التتبع" : "Portail Suivi"}</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              </div>
                                            </div>

                                            {/* Quick status info */}
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-zinc-400">
                                                {locale === "ar" ? "الناقل والحالة :" : "Transporteur & Statut :"}
                                              </span>
                                              <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                                  isAnderson
                                                    ? "bg-orange-950/70 text-orange-300 border-orange-800/60"
                                                    : "bg-zinc-800 text-amber-300 border-zinc-700"
                                                }`}
                                              >
                                                {carrierName} • {order.shippingStatus || (order.status === "delivered" ? "Livré" : "En cours")}
                                              </span>
                                            </div>
                                          </div>

                                          {/* 4 Interactive Operations Buttons */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            {/* Button 1: Official PDF Shipping Label */}
                                            {order.shippingLabelUrl ? (
                                              <a
                                                href={order.shippingLabelUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all group"
                                              >
                                                <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                                                <span>{locale === "ar" ? `📄 بوليصة الشحن (${isAnderson ? "Anderson" : "Navex"})` : `📄 Bordereau ${isAnderson ? "Anderson" : "Navex"} (PDF)`}</span>
                                              </a>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handlePrintSlip(order)}
                                                className="p-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                              >
                                                <Printer className="w-4 h-4 text-amber-400" />
                                                <span>{locale === "ar" ? "طباعة الوصل" : "Imprimer le Bon"}</span>
                                              </button>
                                            )}

                                            {/* Button 2: WhatsApp Buyer Notification */}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenWhatsApp(order)}
                                              className="p-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer group"
                                            >
                                              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                              <span>{locale === "ar" ? "💬 إشعار الزبون (WhatsApp)" : "💬 Notifier Client (WhatsApp)"}</span>
                                            </button>

                                            {/* Button 3: Sync Status from Navex */}
                                            <button
                                              type="button"
                                              disabled={shippingLoadingId === order.id}
                                              onClick={() => handleSyncEcoTrack(order)}
                                              className="p-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                              {shippingLoadingId === order.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                              ) : (
                                                <RefreshCw className="w-4 h-4 text-amber-400" />
                                              )}
                                              <span>{locale === "ar" ? "🔄 تحديث التتبع المباشر" : "🔄 Actualiser le Suivi (Sync)"}</span>
                                            </button>

                                            {/* Button 4: Cancel Shipment */}
                                            <button
                                              type="button"
                                              disabled={shippingLoadingId === order.id}
                                              onClick={() => handleCancelEcoTrack(order)}
                                              className="p-3 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>{locale === "ar" ? "✕ إلغاء الطرد" : "✕ Annuler l'expédition"}</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="px-5 py-3.5 bg-zinc-50/90 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 font-medium">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>
                {locale === "ar"
                  ? `عرض ${filteredOrders.length > 0 ? startIndex + 1 : 0} إلى ${endIndex} من إجمالي ${filteredOrders.length} طلبية`
                  : `Affichage de ${filteredOrders.length > 0 ? startIndex + 1 : 0} à ${endIndex} sur ${filteredOrders.length} commande(s)`}
              </span>
              {filteredOrders.length !== orders.length && (
                <span className="text-zinc-400 text-[11px]">
                  ({locale === "ar" ? `مفلترة من ${orders.length}` : `filtré sur ${orders.length}`})
                </span>
              )}
            </div>

            {/* Pagination Controls (Displayed when more than 10 orders) */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 select-none" dir="ltr">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-zinc-200/90 bg-white hover:bg-zinc-100 text-zinc-700 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed text-xs font-semibold transition-all shadow-2xs gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{locale === "ar" ? "السابق" : "Précédent"}</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationRange(safePage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-7 h-8 flex items-center justify-center text-zinc-400 text-xs font-bold"
                        >
                          ...
                        </span>
                      );
                    }
                    const pageNum = p as number;
                    const isActive = pageNum === safePage;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={isActive ? "page" : undefined}
                        className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-zinc-900 text-white shadow-xs border border-zinc-900"
                            : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/90 hover:text-zinc-900 shadow-2xs"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-zinc-200/90 bg-white hover:bg-zinc-100 text-zinc-700 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed text-xs font-semibold transition-all shadow-2xs gap-1 cursor-pointer"
                >
                  <span className="hidden sm:inline">{locale === "ar" ? "التالي" : "Suivant"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
