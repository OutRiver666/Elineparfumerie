/**
 * WhatsApp Notification Service via Green API
 *
 * Sends automated WhatsApp alerts to store administrators whenever a new order is received.
 * Credentials are read securely from server-side environment variables:
 * - GREEN_API_URL
 * - GREEN_API_ID_INSTANCE
 * - GREEN_API_TOKEN_INSTANCE
 * - WHATSAPP_ADMIN_PHONE
 */

export interface OrderNotificationItem {
  name: string;
  size?: string | null;
  quantity: number;
  totalPrice: number;
}

export interface OrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  alternatePhone?: string | null;
  wilayaName: string;
  communeName: string;
  deliveryAddress?: string | null;
  totalDZD: number;
  deliveryFeeDZD?: number;
  items: OrderNotificationItem[];
}

/**
 * Normalizes an Algerian or international phone number into Green API chatId format (e.g., 213555204591@c.us).
 */
function formatChatId(phone: string): string {
  const cleaned = phone.trim().replace(/[^\d@a-z._-]/gi, "");
  if (cleaned.includes("@")) {
    return cleaned;
  }
  // Convert Algerian local 05/06/07 to 213
  let digits = cleaned;
  if (digits.startsWith("0") && digits.length === 10) {
    digits = "213" + digits.slice(1);
  }
  return `${digits}@c.us`;
}

/**
 * Sends a WhatsApp notification for a new order.
 * Safe to call: will catch any internal errors and never throw or interrupt checkout.
 */
export async function sendWhatsAppOrderNotification(
  payload: OrderNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const apiUrl = (process.env.GREEN_API_URL || "https://7107.api.greenapi.com").replace(/\/+$/, "");
  const idInstance = process.env.GREEN_API_ID_INSTANCE?.trim();
  const apiToken = process.env.GREEN_API_TOKEN_INSTANCE?.trim();
  const rawAdminPhones = process.env.WHATSAPP_ADMIN_PHONE?.trim();

  if (!idInstance || !apiToken || !rawAdminPhones) {
    console.warn(
      "[WhatsApp] Skipping notification: GREEN_API_ID_INSTANCE, GREEN_API_TOKEN_INSTANCE, or WHATSAPP_ADMIN_PHONE not configured."
    );
    return { success: false, error: "Credentials not configured" };
  }

  // Format the WhatsApp message with clear Markdown formatting
  const itemsList = payload.items
    .map(
      (item) =>
        `• ${item.quantity}x *${item.name}*${item.size ? ` (${item.size})` : ""} — ${item.totalPrice.toLocaleString("fr-FR")} DZD`
    )
    .join("\n");

  const addressLine = payload.deliveryAddress
    ? payload.deliveryAddress.trim()
    : `${payload.communeName}, ${payload.wilayaName}`;

  const message = [
    `🛍️ *NOUVELLE COMMANDE REÇUE !*`,
    `━━━━━━━━━━━━━━━━━━`,
    `📦 *Commande :* #${payload.orderNumber}`,
    `👤 *Client :* ${payload.customerName}`,
    `📞 *Téléphone :* ${payload.customerPhone}`,
    payload.alternatePhone ? `📱 *Tél alt :* ${payload.alternatePhone}` : null,
    `📍 *Wilaya :* ${payload.wilayaName}`,
    `🏘️ *Commune :* ${payload.communeName}`,
    `🏠 *Adresse :* ${addressLine}`,
    ``,
    `📋 *Articles commandés :*`,
    itemsList || "• Aucun article répertorié",
    ``,
    typeof payload.deliveryFeeDZD === "number"
      ? `🚚 *Frais de livraison :* ${payload.deliveryFeeDZD.toLocaleString("fr-FR")} DZD`
      : null,
    `💵 *TOTAL À ENCAISSER :* *${payload.totalDZD.toLocaleString("fr-FR")} DZD*`,
    `━━━━━━━━━━━━━━━━━━`,
    `👉 Voir la commande sur votre dashboard admin.`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  // Support multiple recipients separated by comma
  const adminPhones = rawAdminPhones
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const endpoint = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiToken}`;

  for (const phone of adminPhones) {
    const chatId = formatChatId(phone);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message,
        }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `[WhatsApp] Failed to send message to ${chatId}. Status: ${res.status}. Body: ${errorText}`
        );
      } else {
        const data = await res.json().catch(() => ({}));
        console.log(`[WhatsApp] Order notification sent to ${chatId}. MsgId:`, data?.idMessage);
      }
    } catch (err: any) {
      console.error(`[WhatsApp] Error sending notification to ${chatId}:`, err?.message || err);
    }
  }

  return { success: true };
}
