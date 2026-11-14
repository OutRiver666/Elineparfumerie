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
    className: "bg-blue-50 text-blue-800 border-blue-200",
    stepIndex: 1,
    icon: Clock,
  },
  confirmed: {
    labelFr: "Confirmée",
    labelAr: "مؤكدة",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    stepIndex: 2,
    icon: CheckCircle2,
  },
  preparing: {
    labelFr: "En préparation",
    labelAr: "قيد التحضير",
    className: "bg-indigo-50 text-indigo-800 border-indigo-200",
    stepIndex: 3,
    icon: Package,
  },
  shipped: {
    labelFr: "Expédiée",
    labelAr: "مشحونة",
    className: "bg-purple-50 text-purple-800 border-purple-200",
    stepIndex: 4,
    icon: Truck,
  },
  delivered: {
    labelFr: "Livrée",
    labelAr: "تم التسليم",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    stepIndex: 5,
    icon: CheckCircle2,
  },
  cancelled: {
    labelFr: "Annulée",
    labelAr: "ملغاة",
    className: "bg-red-50 text-red-800 border-red-200",
    stepIndex: -1,
    icon: XCircle,
  },
  returned: {
    labelFr: "Retournée",
    labelAr: "مرتجعة",
    className: "bg-gray-50 text-gray-800 border-gray-200",
    stepIndex: -1,
    icon: RotateCcw,
  },
  failed_delivery: {
    labelFr: "Échec livraison",
    labelAr: "فشل التسليم",
    className: "bg-red-50 text-red-800 border-red-200",
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

export function OrdersManagerClient({
  initialOrders,
  locale,
}: OrdersManagerClientProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const expandAll = () => {
    setExpandedIds(new Set(filteredOrders.map((o) => o.id)));
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

  return (
    <div className="space-y-6">
      {/* Top Notification / Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { key: "all", count: orders.length, labelFr: "Toutes", labelAr: "الكل" },
          { key: "new", count: newCount, labelFr: "Nouvelles", labelAr: "جديدة" },
          { key: "confirmed", count: confirmedCount, labelFr: "Confirmées", labelAr: "مؤكدة" },
          { key: "preparing", count: preparingCount, labelFr: "Préparation", labelAr: "تحضير" },
          { key: "shipped", count: shippedCount, labelFr: "Expédiées", labelAr: "مشحونة" },
          { key: "delivered", count: deliveredCount, labelFr: "Livrées", labelAr: "مسلمة" },
          { key: "cancelled", count: cancelledCount, labelFr: "Annulées", labelAr: "ملغاة" },
        ].map((s) => {
          const isSelected = selectedStatus === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSelectedStatus(s.key)}
              className={`p-3 text-center rounded-[4px] border transition-all cursor-pointer ${
                isSelected
                  ? "bg-luxury-text text-white border-luxury-text shadow-sm"
                  : "bg-white border-luxury-border/30 hover:border-luxury-accent/50 text-luxury-text"
              }`}
            >
              <p
                className={`text-lg font-bold leading-tight ${
                  isSelected ? "text-white" : "text-luxury-text"
                }`}
              >
                {s.count}
              </p>
              <p
                className={`text-[10px] uppercase tracking-wider mt-0.5 ${
                  isSelected ? "text-white/80" : "text-luxury-text-muted"
                }`}
              >
                {locale === "ar" ? s.labelAr : s.labelFr}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Bulk Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-luxury-border/30">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-luxury-text-muted absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === "ar"
                ? "بحث بالمرجع (CMD-...)، الزبون، الهاتف أو الولاية..."
                : "Rechercher par référence (CMD-...), nom du client, téléphone, wilaya..."
            }
            className="w-full text-xs pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 border border-luxury-border/40 rounded-[3px] bg-luxury-secondary/20 focus:bg-white focus:outline-none focus:border-luxury-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-luxury-text-muted hover:text-luxury-text px-2 py-1"
            >
              {locale === "ar" ? "مسح البحث" : "Effacer"}
            </button>
          )}

          <button
            onClick={expandedIds.size === filteredOrders.length ? collapseAll : expandAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-luxury-border/40 rounded-[3px] text-xs text-luxury-text-secondary hover:bg-luxury-secondary transition-colors"
          >
            {expandedIds.size === filteredOrders.length ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>{locale === "ar" ? "طي الكل" : "Replier tout"}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{locale === "ar" ? "توسيع الكل" : "Déplier tout"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Professional Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[4px] border border-luxury-border/30 p-12 text-center text-luxury-text-muted text-xs">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-luxury-border" />
          <p className="font-medium text-luxury-text text-sm">
            {locale === "ar" ? "لا توجد طلبيات مطابقة" : "Aucune commande trouvée"}
          </p>
          <p className="text-xs text-luxury-text-muted mt-1 max-w-sm mx-auto">
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
              }}
              className="mt-4 px-3 py-1.5 text-xs bg-luxury-secondary text-luxury-text rounded-[3px] hover:bg-luxury-border/30 transition-colors"
            >
              {locale === "ar" ? "إظهار كل الطلبيات" : "Afficher toutes les commandes"}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-luxury-border/30 rounded-[4px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-luxury-secondary/70 border-b border-luxury-border/40 text-luxury-text-muted uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4">{locale === "ar" ? "المرجع" : "Référence"}</th>
                  <th className="py-3 px-4">{locale === "ar" ? "التاريخ" : "Date & Heure"}</th>
                  <th className="py-3 px-4">{locale === "ar" ? "الزبون والهاتف" : "Client & Téléphone"}</th>
                  <th className="py-3 px-4">{locale === "ar" ? "الولاية / البلدية" : "Wilaya & Commune"}</th>
                  <th className="py-3 px-4">{locale === "ar" ? "المحتوى" : "Articles"}</th>
                  <th className="py-3 px-4">{locale === "ar" ? "المبلغ COD" : "Total COD"}</th>
                  <th className="py-3 px-4">{locale === "ar" ? "الحالة" : "Statut"}</th>
                  <th className="py-3 px-4 text-center">{locale === "ar" ? "التفاصيل" : "Détails"}</th>
                </tr>
              </thead>

              {/* Table Body with Expandable Rows */}
              <tbody className="divide-y divide-luxury-border/20 text-luxury-text">
                {filteredOrders.map((order, index) => {
                  const isExpanded = expandedIds.has(order.id);
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
                  const StatusIcon = config.icon;
                  const isUpdating = updatingId === order.id;

                  const totalItemsCount = order.items.reduce(
                    (sum, it) => sum + (it.qty || 1),
                    0
                  );

                  return (
                    <React.Fragment key={order.id}>
                      {/* Summary Row (Clickable) */}
                      <tr
                        onClick={() => toggleExpand(order.id)}
                        className={`transition-colors cursor-pointer select-none ${
                          isExpanded
                            ? "bg-luxury-secondary/35 border-l-4 border-l-luxury-accent"
                            : "hover:bg-luxury-secondary/20"
                        }`}
                      >
                        {/* Expand Chevron */}
                        <td className="py-3.5 px-3 text-center text-luxury-text-muted">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className="p-1 rounded-[3px] hover:bg-luxury-secondary text-luxury-text-muted hover:text-luxury-text transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-luxury-accent" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Order Reference */}
                        <td className="py-3.5 px-4 font-mono font-bold text-luxury-text text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{order.reference || order.id}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(order.reference || order.id, order.id);
                              }}
                              title="Copier la référence"
                              className="p-0.5 text-luxury-text-muted hover:text-luxury-accent"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 text-luxury-text-secondary whitespace-nowrap text-[11px]">
                          <div>
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-DZ" : "fr-DZ",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-[10px] text-luxury-text-muted font-mono">
                            {new Date(order.createdAt).toLocaleTimeString(
                              locale === "ar" ? "ar-DZ" : "fr-DZ",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                        </td>

                        {/* Customer & Phone */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-luxury-text">
                            {order.customer.name}
                          </p>
                          <a
                            href={`tel:${order.customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            dir="ltr"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-luxury-text-secondary hover:text-luxury-accent hover:underline mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-luxury-accent shrink-0" />
                            <span>{order.customer.phone}</span>
                          </a>
                        </td>

                        {/* Wilaya & Commune */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-medium text-luxury-text">
                            <MapPin className="w-3 h-3 text-luxury-accent shrink-0" />
                            <span>{getWilayaLabel(order.wilaya, locale)}</span>
                          </div>
                          <p className="text-[10px] text-luxury-text-muted truncate max-w-[160px]">
                            {order.commune}
                          </p>
                        </td>

                        {/* Items Summary */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-luxury-secondary text-luxury-text text-[11px] font-medium">
                            <ShoppingBag className="w-3 h-3 text-luxury-accent" />
                            <span>
                              {totalItemsCount}{" "}
                              {locale === "ar"
                                ? totalItemsCount > 1
                                  ? "عطور"
                                  : "عطر"
                                : totalItemsCount > 1
                                ? "articles"
                                : "article"}
                            </span>
                          </span>
                        </td>

                        {/* Total Amount & Paid Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-luxury-text text-sm">
                            {formatPrice(order.total, locale)}
                          </p>
                          <div className="mt-0.5">
                            {order.isPaid ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                ✓ {locale === "ar" ? "محصلة" : "Encaissé"}
                              </span>
                            ) : order.status !== "cancelled" ? (
                              <span className="inline-flex items-center text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                COD {locale === "ar" ? "غير محصل" : "À percevoir"}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Status Badge & Navex Tracking */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border ${config.className}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              <span>{locale === "ar" ? config.labelAr : config.labelFr}</span>
                            </span>

                            {order.status === "new" && order.callAttempts && order.callAttempts > 0 ? (
                              <span
                                title={
                                  order.lastAttemptAt
                                    ? `Dernier appel: ${new Date(order.lastAttemptAt).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}`
                                    : undefined
                                }
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  order.callAttempts === 3
                                    ? "bg-red-50 text-red-700 border-red-300 animate-pulse"
                                    : order.callAttempts === 2
                                    ? "bg-orange-50 text-orange-700 border-orange-300"
                                    : "bg-amber-50 text-amber-800 border-amber-300"
                                }`}
                              >
                                <PhoneCall className="w-2.5 h-2.5" />
                                <span>
                                  {order.callAttempts === 3
                                    ? locale === "ar"
                                      ? "3/3 غير مجيب"
                                      : "3/3 Injoignable"
                                    : locale === "ar"
                                    ? `محاولة ${order.callAttempts}/3`
                                    : `Tentative ${order.callAttempts}/3`}
                                </span>
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
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-2xs ${
                                      isAnderson
                                        ? "bg-[#251406] text-[#fb923c] border border-[#ea580c]/50"
                                        : "bg-[#171717] text-[#e8c872] border border-[#c8a870]/40"
                                    }`}
                                  >
                                    {isAnderson ? (
                                      <Package className="w-2.5 h-2.5 text-[#fb923c]" />
                                    ) : (
                                      <Truck className="w-2.5 h-2.5 text-[#e8c872]" />
                                    )}
                                    <span>{carrierLabel}: {order.trackingCode.slice(0, 8)}...</span>
                                  </span>
                                  {order.shippingLabelUrl && (
                                    <a
                                      href={order.shippingLabelUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      title={locale === "ar" ? "طباعة بوليصة الشحن (PDF)" : `Imprimer bordereau PDF (${carrierLabel})`}
                                      className="p-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
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
                                    className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
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
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#c8a870] hover:bg-[#d8b880] text-[#1a1a1a] transition-all cursor-pointer disabled:opacity-50"
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
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ea580c] hover:bg-[#f97316] text-white transition-all cursor-pointer disabled:opacity-50"
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

                        {/* Open Button */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-[3px] font-medium border transition-colors inline-flex items-center gap-1 ${
                              isExpanded
                                ? "bg-luxury-text text-white border-luxury-text"
                                : "bg-white text-luxury-text border-luxury-border/40 hover:bg-luxury-secondary hover:border-luxury-accent"
                            }`}
                          >
                            <span>{isExpanded ? (locale === "ar" ? "إغلاق" : "Fermer") : (locale === "ar" ? "عرض" : "Détails")}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Content */}
                      {isExpanded && (
                        <tr className="bg-luxury-secondary/15">
                          <td colSpan={9} className="p-4 sm:p-6 border-b-2 border-luxury-border/40">
                            <div className="space-y-6">
                              {/* 1. Interactive Lifecycle Timeline Stepper */}
                              <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 shadow-xs">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-luxury-border/20">
                                  <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-bold flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-luxury-accent" />
                                    <span>
                                      {locale === "ar"
                                        ? "مسار تقدم الطلبية (Lifecycle)"
                                        : "Évolution & Traitement Logistique"}
                                    </span>
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handlePrintSlip(order)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-luxury-secondary hover:bg-luxury-secondary/80 text-luxury-text text-xs rounded-[3px] border border-luxury-border/40 transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-luxury-accent" />
                                    <span>{locale === "ar" ? "طباعة وصل التسليم" : "Imprimer Bon de Livraison"}</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                  {LIFECYCLE_STEPS.map((step, idx) => {
                                    const stepNum = idx + 1;
                                    const currentStepIndex = config.stepIndex;
                                    const isDone = currentStepIndex > stepNum;
                                    const isCurrent = currentStepIndex === stepNum;

                                    return (
                                      <div
                                        key={step.key}
                                        className={`p-2.5 rounded-[3px] border text-center transition-all ${
                                          isCurrent
                                            ? "bg-luxury-accent text-white border-luxury-accent shadow-xs font-semibold"
                                            : isDone
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                            : "bg-gray-50 text-gray-400 border-gray-200"
                                        }`}
                                      >
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                          {isDone ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : isCurrent ? (
                                            <Clock className="w-3.5 h-3.5 text-white" />
                                          ) : (
                                            <span className="w-3.5 h-3.5 inline-block text-[10px]">○</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] leading-tight">
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
                                <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 space-y-3 shadow-xs">
                                  <div className="flex items-center gap-2 pb-2 border-b border-luxury-border/20">
                                    <User className="w-4 h-4 text-luxury-accent" />
                                    <h4 className="font-semibold text-xs text-luxury-text uppercase tracking-wider">
                                      {locale === "ar" ? "معلومات الزبون والتوصيل" : "Destinataire & Adresse"}
                                    </h4>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div>
                                      <p className="text-[10px] text-luxury-text-muted uppercase">
                                        {locale === "ar" ? "الاسم الكامل" : "Nom & Prénom"}
                                      </p>
                                      <p className="font-bold text-luxury-text text-sm mt-0.5">
                                        {order.customer.name}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[10px] text-luxury-text-muted uppercase">
                                        {locale === "ar" ? "رقم الهاتف" : "Téléphone Principal"}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <a
                                          href={`tel:${order.customer.phone}`}
                                          dir="ltr"
                                          className="font-mono font-bold text-luxury-accent text-sm hover:underline"
                                        >
                                          {order.customer.phone}
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(order.customer.phone, `phone-${order.id}`)}
                                          title="Copier le numéro"
                                          className="p-1 text-luxury-text-muted hover:text-luxury-text"
                                        >
                                          {copiedId === `phone-${order.id}` ? (
                                            <Check className="w-3 h-3 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {order.customer.alternatePhone && (
                                      <div>
                                        <p className="text-[10px] text-luxury-text-muted uppercase">
                                          {locale === "ar" ? "رقم بديل" : "Téléphone Secondaire"}
                                        </p>
                                        <a
                                          href={`tel:${order.customer.alternatePhone}`}
                                          dir="ltr"
                                          className="font-mono text-luxury-text font-medium text-xs hover:underline block mt-0.5"
                                        >
                                          {order.customer.alternatePhone}
                                        </a>
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-luxury-border/20">
                                      <p className="text-[10px] text-luxury-text-muted uppercase">
                                        {locale === "ar" ? "الولاية والبلدية" : "Localisation"}
                                      </p>
                                      <p className="font-semibold text-luxury-text mt-0.5">
                                        {getWilayaLabel(order.wilaya, locale)} — {order.commune}
                                      </p>
                                      <p className="text-luxury-text-secondary mt-1 text-[11px] leading-relaxed bg-luxury-secondary/40 p-2 rounded-[3px]">
                                        {order.address}
                                      </p>
                                    </div>

                                    {order.callAttempts && order.callAttempts > 0 ? (
                                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-[3px] border border-amber-200">
                                        <PhoneCall className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                        <span>
                                          {locale === "ar"
                                            ? `محاولات الاتصال للتأكيد: ${order.callAttempts}/3 مسجلة`
                                            : `Tentatives d'appel : ${order.callAttempts}/3 effectuées`}
                                          {order.lastAttemptAt && (
                                            <span className="text-luxury-text-muted font-mono ml-1">
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
                                        <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-[3px] border border-amber-200">
                                          <span className="font-bold">💬 Note du client:</span> {cleanUserNotes}
                                        </div>
                                      );
                                    })()}

                                    <div className="pt-2 border-t border-luxury-border/20 text-[11px]">
                                      <span className="text-luxury-text-muted">Transporteur : </span>
                                      <span className="font-semibold text-luxury-text">{order.deliveryService || "Yalitec Express"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* CARD B: Articles & Facturation */}
                                <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 space-y-3 shadow-xs">
                                  <div className="flex items-center gap-2 pb-2 border-b border-luxury-border/20">
                                    <ShoppingBag className="w-4 h-4 text-luxury-accent" />
                                    <h4 className="font-semibold text-xs text-luxury-text uppercase tracking-wider">
                                      {locale === "ar" ? "المنتجات وتفاصيل الفاتورة" : "Articles & Facturation"}
                                    </h4>
                                  </div>

                                  {/* Items Mini-Table */}
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 rounded-[3px] bg-luxury-secondary/30 flex items-start justify-between gap-2 text-xs"
                                      >
                                        <div>
                                          <p className="font-bold text-luxury-text">
                                            {item.name}
                                          </p>
                                          <p className="text-luxury-text-muted text-[11px] mt-0.5">
                                            Volume: <span className="font-semibold text-luxury-text">{item.size}</span>
                                            <span className="mx-1">•</span>
                                            Qté: <span className="font-semibold text-luxury-text">×{item.qty}</span>
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-luxury-text">
                                            {formatPrice(item.unitPrice * item.qty, locale)}
                                          </p>
                                          <p className="text-[10px] text-luxury-text-muted">
                                            {formatPrice(item.unitPrice, locale)} / u
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Pricing Breakdown */}
                                  <div className="pt-2 border-t border-luxury-border/20 space-y-1.5 text-xs text-luxury-text-secondary">
                                    <div className="flex justify-between">
                                      <span>{locale === "ar" ? "المجموع الفرعي" : "Sous-total articles"} :</span>
                                      <span className="font-medium text-luxury-text">{formatPrice(order.subtotal, locale)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{locale === "ar" ? "تكلفة التوصيل" : "Frais de livraison (Wilaya)"} :</span>
                                      <span className="font-medium text-luxury-text">{formatPrice(order.deliveryFee, locale)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-luxury-text border-t border-luxury-border/30 pt-2 mt-1">
                                      <span>{locale === "ar" ? "المجموع المطلوب (COD)" : "Total Net à Encaisser"} :</span>
                                      <span className="text-luxury-accent">{formatPrice(order.total, locale)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* CARD C: Actions & Traitement Opérationnel */}
                                <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 space-y-3 shadow-xs flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 pb-2 border-b border-luxury-border/20">
                                      <Package className="w-4 h-4 text-luxury-accent" />
                                      <h4 className="font-semibold text-xs text-luxury-text uppercase tracking-wider">
                                        {locale === "ar" ? "معالجة الحالة وتحديث الطلبية" : "Actions sur le Statut"}
                                      </h4>
                                    </div>

                                    <div className="space-y-3 pt-2 text-xs">
                                      <div className="bg-luxury-secondary/30 p-2.5 rounded-[3px]">
                                        <p className="text-[10px] uppercase tracking-wider text-luxury-text-muted font-semibold">
                                          {locale === "ar" ? "الحالة الحالية" : "Statut actuel de la commande"}
                                        </p>
                                        <p className="text-sm font-bold text-luxury-text mt-0.5 flex items-center gap-1.5">
                                          <StatusIcon className="w-4 h-4 text-luxury-accent" />
                                          <span>{locale === "ar" ? config.labelAr : config.labelFr}</span>
                                        </p>
                                      </div>

                                      {/* Action Buttons depending on status */}
                                      <div className="space-y-2">
                                        <p className="text-[10px] uppercase tracking-wider text-luxury-text-muted font-semibold">
                                          {locale === "ar" ? "الانتقال إلى المرحلة التالية:" : "Passer à l'étape suivante :"}
                                        </p>

                                        {isUpdating ? (
                                          <div className="flex items-center justify-center gap-2 p-3 bg-luxury-secondary rounded-[3px] text-luxury-text">
                                            <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                                            <span className="text-xs font-medium">
                                              {locale === "ar" ? "جاري التحديث في قاعدة البيانات..." : "Mise à jour en cours..."}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col gap-2">
                                            {order.status === "new" && (
                                              <>
                                                {/* Tentatives d'appel (1, 2, 3) */}
                                                <div className="p-2.5 rounded-[4px] bg-luxury-secondary/40 border border-luxury-border/40 space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-luxury-text font-semibold text-[11px]">
                                                      <PhoneCall className="w-3.5 h-3.5 text-luxury-accent" />
                                                      <span>
                                                        {locale === "ar"
                                                          ? "محاولات الاتصال للتأكيد :"
                                                          : "Tentatives d'appel :"}
                                                      </span>
                                                    </div>
                                                    {order.callAttempts && order.callAttempts > 0 ? (
                                                      <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                                                      <span className="text-[10px] text-luxury-text-muted">
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
                                                          className={`py-1.5 px-1.5 rounded-[3px] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                                                            isExact
                                                              ? num === 3
                                                                ? "bg-red-600 text-white border-red-600 shadow-xs ring-1 ring-red-400"
                                                                : num === 2
                                                                ? "bg-orange-500 text-white border-orange-500 shadow-xs ring-1 ring-orange-400"
                                                                : "bg-amber-500 text-white border-amber-500 shadow-xs ring-1 ring-amber-400"
                                                              : isReached
                                                              ? "bg-amber-100/80 text-amber-900 border-amber-300 font-medium"
                                                              : "bg-white text-luxury-text hover:bg-luxury-secondary/80 border-luxury-border/60 hover:border-luxury-accent/60"
                                                          }`}
                                                        >
                                                          {isThisPending ? (
                                                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                                          ) : (
                                                            <Phone className="w-2.5 h-2.5 shrink-0" />
                                                          )}
                                                          <span className="whitespace-nowrap">
                                                            {locale === "ar" ? `محاولة ${num}` : `Tentative ${num}`}
                                                          </span>
                                                        </button>
                                                      );
                                                    })}
                                                  </div>

                                                  {/* Timestamp + Reset Option */}
                                                  <div className="flex items-center justify-between text-[10px] text-luxury-text-muted pt-0.5">
                                                    <span>
                                                      {order.lastAttemptAt ? (
                                                        <>
                                                          {locale === "ar" ? "آخر محاولة: " : "Dernier appel: "}
                                                          <span className="font-mono text-luxury-text font-semibold">
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
                                                        className="text-luxury-text-muted hover:text-luxury-accent underline transition-colors"
                                                      >
                                                        {locale === "ar" ? "إلغاء (0)" : "Effacer"}
                                                      </button>
                                                    ) : null}
                                                  </div>

                                                  {/* Quick Cancel Button if 3 attempts reached */}
                                                  {order.callAttempts === 3 && (
                                                    <div className="p-2 bg-red-50 border border-red-200 rounded-[3px] text-xs text-red-800 space-y-1.5 mt-1">
                                                      <p className="font-semibold flex items-center gap-1 text-[11px] text-red-700">
                                                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
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
                                                        className="w-full py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-[3px] text-[11px] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                                                      >
                                                        <XCircle className="w-3 h-3" />
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
                                                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-[3px] text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                                >
                                                  <CheckCircle2 className="w-3.5 h-3.5" />
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
                                                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[3px] text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                              >
                                                <Package className="w-3.5 h-3.5" />
                                                <span>{locale === "ar" ? "🔧 إرسال للورشة (بدء التحضير)" : "🔧 Mettre en préparation à l'atelier"}</span>
                                              </button>
                                            )}

                                            {order.status === "preparing" && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "shipped")}
                                                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-[3px] text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                              >
                                                <Truck className="w-3.5 h-3.5" />
                                                <span>{locale === "ar" ? "📦 تسليم لشركة الشحن (شحن)" : "📦 Remettre au livreur (Expédier)"}</span>
                                              </button>
                                            )}

                                            {order.status === "shipped" && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "delivered", true)}
                                                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[3px] text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                              >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>{locale === "ar" ? "✓ تأكيد التسليم والتحصيل Cash" : "✓ Marquer Livrée & Encaissée"}</span>
                                              </button>
                                            )}

                                            {order.status === "delivered" && !order.isPaid && (
                                              <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, "delivered", true)}
                                                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[3px] text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
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
                                                className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-[3px] text-xs transition-colors"
                                              >
                                                {locale === "ar" ? "✕ إلغاء الطلبية" : "✕ Annuler la commande"}
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-luxury-border/20 text-[10px] text-luxury-text-muted flex justify-between items-center font-mono">
                                    <span>UUID: {order.id.slice(0, 13)}...</span>
                                    <span>COD Algérie</span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Navex & Anderson Multi-Carrier Logistics & WhatsApp Hub */}
                              <div className="bg-gradient-to-br from-[#171717] via-[#1f1d1b] to-[#141414] border border-[#c8a870]/40 rounded-[6px] p-4 sm:p-5 shadow-sm text-white">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-[4px] bg-[#c8a870]/20 border border-[#c8a870]/40 flex items-center justify-center text-[#c8a870] shrink-0">
                                      <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-serif font-bold text-sm tracking-wide text-[#fdfbf7]">
                                          {locale === "ar"
                                            ? "مركز الشحن والتوصيل (Navex & Anderson Logistique)"
                                            : "Centre d'Expédition Multi-Transporteurs (Navex & Anderson)"}
                                        </h4>
                                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#c8a870]/20 text-[#e8c872] border border-[#c8a870]/30 font-mono">
                                          EcoTrack API
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-gray-400 mt-0.5">
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
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                                              isAnderson
                                                ? "bg-orange-950/70 text-orange-300 border-orange-700/50"
                                                : "bg-emerald-950/70 text-emerald-300 border-emerald-700/50"
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
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 text-gray-300 border border-white/10 text-xs">
                                        <Clock className="w-3.5 h-3.5 text-[#c8a870]" />
                                        <span>{locale === "ar" ? "في انتظار الإرسال" : "Non transmis au transporteur"}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Active Notification Banner if any */}
                                {shippingMessage && shippingMessage.id === order.id && (
                                  <div
                                    className={`mt-3 p-2.5 rounded-[4px] text-xs flex items-center justify-between ${
                                      shippingMessage.type === "success"
                                        ? "bg-emerald-950/80 text-emerald-200 border border-emerald-700/60"
                                        : "bg-red-950/80 text-red-200 border border-red-700/60"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {shippingMessage.type === "success" ? (
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                      )}
                                      <span>{shippingMessage.text}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShippingMessage(null)}
                                      className="text-gray-400 hover:text-white font-bold ml-2 cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}

                                {/* Body Content */}
                                <div className="mt-4">
                                  {!order.trackingCode ? (
                                    /* State A: Ready to Dispatch */
                                    <div className="bg-white/5 rounded-[4px] p-4 border border-white/10 space-y-4">
                                      {/* Carrier Selection Switcher */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded bg-black/40 border border-white/10">
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-xs font-semibold text-gray-200">
                                            {locale === "ar" ? "شركة الشحن :" : "Transporteur :"}
                                          </span>
                                          <div className="inline-flex rounded-[4px] p-0.5 bg-black/60 border border-white/15">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSelectedCarrierMap((prev) => ({
                                                  ...prev,
                                                  [order.id]: "navex",
                                                }))
                                              }
                                              className={`px-3 py-1 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                (selectedCarrierMap[order.id] || "navex") === "navex"
                                                  ? "bg-[#c8a870] text-[#1a1a1a] shadow-xs"
                                                  : "text-gray-400 hover:text-white"
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
                                              className={`px-3 py-1 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                selectedCarrierMap[order.id] === "anderson"
                                                  ? "bg-[#ea580c] text-white shadow-xs"
                                                  : "text-gray-400 hover:text-white"
                                              }`}
                                            >
                                              <Package className="w-3.5 h-3.5" />
                                              <span>Anderson Logistique</span>
                                            </button>
                                          </div>
                                        </div>

                                        <span className="text-[11px] text-gray-400 font-mono">
                                          {(selectedCarrierMap[order.id] || "navex") === "anderson"
                                            ? "anderson-ecommerce.ecotrack.dz"
                                            : "navexdelivery.ecotrack.dz"}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                                            {locale === "ar" ? "المبلغ المستحق (COD)" : "Montant à Encaisser"}
                                          </span>
                                          <span className="font-bold text-sm text-[#e8c872] mt-0.5 block">
                                            {formatPrice(order.total, locale)}
                                          </span>
                                        </div>
                                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                                            {locale === "ar" ? "الولاية والبلدية" : "Destination"}
                                          </span>
                                          <span className="font-semibold text-xs text-gray-200 mt-0.5 block truncate">
                                            {getWilayaLabel(order.wilaya, locale)} — {order.commune}
                                          </span>
                                        </div>
                                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                                            {locale === "ar" ? "طريقة التسليم" : "Mode de Livraison"}
                                          </span>
                                          <label className="flex items-center gap-2 mt-1 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={!!stopDeskMap[order.id]}
                                              onChange={(e) =>
                                                setStopDeskMap((prev) => ({
                                                  ...prev,
                                                  [order.id]: e.target.checked,
                                                }))
                                              }
                                              className="rounded border-gray-600 text-[#c8a870] focus:ring-[#c8a870]"
                                            />
                                            <span className="text-xs text-gray-300">
                                              {locale === "ar" ? "Stop Desk (المكتب)" : "Stop Desk (Bureau)"}
                                            </span>
                                          </label>
                                        </div>
                                      </div>

                                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                        <p className="text-[11px] text-gray-400">
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
                                          className={`w-full sm:w-auto px-5 py-2.5 font-bold rounded-[3px] text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 ${
                                            selectedCarrierMap[order.id] === "anderson"
                                              ? "bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#f97316] hover:to-[#ea580c] text-white"
                                              : "bg-gradient-to-r from-[#c8a870] to-[#b89358] hover:from-[#d8b880] hover:to-[#c8a870] text-[#1a1a1a]"
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
                                          <div className="bg-black/40 rounded-[4px] p-3.5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="space-y-1">
                                              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                                                {locale === "ar"
                                                  ? `رقم التتبع الرسمي (${carrierName})`
                                                  : `Numéro de Suivi Officiel (${carrierName})`}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <span
                                                  className={`font-mono text-base font-bold tracking-wider ${
                                                    isAnderson ? "text-[#fb923c]" : "text-[#e8c872]"
                                                  }`}
                                                >
                                                  {order.trackingCode}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => handleCopy(order.trackingCode!, `track-${order.id}`)}
                                                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
                                                  className="text-[11px] text-gray-400 hover:text-white inline-flex items-center gap-0.5 ml-1 transition-colors"
                                                >
                                                  <span>{locale === "ar" ? "بوابة التتبع" : "Portail Suivi"}</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              </div>
                                            </div>

                                            {/* Quick status info */}
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-300">
                                                {locale === "ar" ? "الناقل والحالة :" : "Transporteur & Statut :"}
                                              </span>
                                              <span
                                                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                                  isAnderson
                                                    ? "bg-orange-950/60 text-orange-300 border-orange-800/40"
                                                    : "bg-white/10 text-[#e8c872] border-white/15"
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
                                            className="p-2.5 rounded-[3px] bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all group"
                                          >
                                            <FileText className="w-4 h-4 text-[#e8c872] group-hover:scale-110 transition-transform" />
                                            <span>{locale === "ar" ? `📄 بوليصة الشحن (${isAnderson ? "Anderson" : "Navex"})` : `📄 Bordereau ${isAnderson ? "Anderson" : "Navex"} (PDF)`}</span>
                                          </a>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handlePrintSlip(order)}
                                            className="p-2.5 rounded-[3px] bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                          >
                                            <Printer className="w-4 h-4 text-[#e8c872]" />
                                            <span>{locale === "ar" ? "طباعة الوصل" : "Imprimer le Bon"}</span>
                                          </button>
                                        )}

                                        {/* Button 2: WhatsApp Buyer Notification */}
                                        <button
                                          type="button"
                                          onClick={() => handleOpenWhatsApp(order)}
                                          className="p-2.5 rounded-[3px] bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer group"
                                        >
                                          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                          <span>{locale === "ar" ? "💬 إشعار الزبون (WhatsApp)" : "💬 Notifier Client (WhatsApp)"}</span>
                                        </button>

                                        {/* Button 3: Sync Status from Navex */}
                                        <button
                                          type="button"
                                          disabled={shippingLoadingId === order.id}
                                          onClick={() => handleSyncEcoTrack(order)}
                                          className="p-2.5 rounded-[3px] bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                          {shippingLoadingId === order.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-[#e8c872]" />
                                          ) : (
                                            <RefreshCw className="w-4 h-4 text-[#e8c872]" />
                                          )}
                                          <span>{locale === "ar" ? "🔄 تحديث التتبع المباشر" : "🔄 Actualiser le Suivi (Sync)"}</span>
                                        </button>

                                        {/* Button 4: Cancel Shipment */}
                                        <button
                                          type="button"
                                          disabled={shippingLoadingId === order.id}
                                          onClick={() => handleCancelEcoTrack(order)}
                                          className="p-2.5 rounded-[3px] bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
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

          {/* Table Footer */}
          <div className="p-3 bg-luxury-secondary/30 border-t border-luxury-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-luxury-text-muted">
            <p>
              {locale === "ar"
                ? `عرض ${filteredOrders.length} من إجمالي ${orders.length} طلبية`
                : `Affichage de ${filteredOrders.length} sur ${orders.length} commande(s)`}
            </p>
            <p className="text-[11px] font-medium text-luxury-text-secondary">
              {locale === "ar"
                ? "انقر على أي سطر لعرض كامل التفاصيل والتحكم في حالة الطلب"
                : "Cliquez sur une ligne pour afficher l'ensemble des détails et gérer le statut"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
