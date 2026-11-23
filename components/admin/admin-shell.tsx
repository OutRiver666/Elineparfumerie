"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { SimulationBanner } from "@/components/admin/simulation-banner";
import { Locale } from "@/lib/i18n";
import { AdminPermissions } from "@/types/admin-role";
import { createClient } from "@/lib/supabase/client";
import { fetchLiveOrderCountsAction } from "@/lib/actions/orders";
import { toast } from "sonner";

interface AdminShellProps {
  children: React.ReactNode;
  locale: Locale;
  ordersCount: number;
  newOrdersCount: number;
  permissions: AdminPermissions;
  userRole: string;
  userEmail?: string;
  userName?: string;
  isSimulating: boolean;
  simulatedRole: string | null;
  isRealOwner: boolean;
}

export function AdminShell({
  children,
  locale,
  ordersCount,
  newOrdersCount,
  permissions,
  userRole,
  userEmail,
  userName,
  isSimulating,
  simulatedRole,
  isRealOwner,
}: AdminShellProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveOrdersCount, setLiveOrdersCount] = useState(ordersCount);
  const [liveNewOrdersCount, setLiveNewOrdersCount] = useState(newOrdersCount);
  const liveOrdersCountRef = useRef(ordersCount);
  const prevNewCountRef = useRef(newOrdersCount);
  const canViewOrders = userRole === "owner" || Boolean(permissions?.orders_view);

  // Sync with server-rendered props on navigation
  useEffect(() => {
    setLiveOrdersCount(ordersCount);
    setLiveNewOrdersCount(newOrdersCount);
    liveOrdersCountRef.current = ordersCount;
    prevNewCountRef.current = newOrdersCount;
  }, [ordersCount, newOrdersCount]);

  // Helper to apply incoming counts & notify on brand-new incoming order
  const applyCounts = useCallback(
    (nextTotal: number, nextNew: number, notifyOnIncrease: boolean) => {
      if (notifyOnIncrease && nextNew > prevNewCountRef.current) {
        const diff = nextNew - prevNewCountRef.current;
        toast.success(
          locale === "ar"
            ? diff > 1
              ? `🔔 وصلت ${diff} طلبيات جديدة الآن!`
              : "🔔 وصلت طلبية جديدة الآن!"
            : diff > 1
            ? `🔔 ${diff} nouvelles commandes reçues !`
            : "🔔 Nouvelle commande reçue !",
          {
            duration: 5000,
            action: {
              label: locale === "ar" ? "عرض" : "Voir",
              onClick: () => router.push(`/${locale}/admin/orders`),
            },
          }
        );
      }
      liveOrdersCountRef.current = nextTotal;
      prevNewCountRef.current = nextNew;
      setLiveOrdersCount(nextTotal);
      setLiveNewOrdersCount(nextNew);
    },
    [locale, router]
  );

  // Live Real-Time Sync for Sidebar & Header New Orders Badge
  useEffect(() => {
    if (!canViewOrders) return;

    let isMounted = true;
    let isFetching = false;

    const refreshCounts = async () => {
      if (isFetching || document.visibilityState !== "visible") return;
      isFetching = true;
      try {
        const res = await fetchLiveOrderCountsAction();
        if (isMounted && res.success) {
          applyCounts(res.total, res.newOrders, true);
        }
      } catch {
        // Ignore transient network errors
      } finally {
        isFetching = false;
      }
    };

    // 1. Instant local sync from OrdersManagerClient (e.g. when confirming/cancelling an order)
    const handleLocalSync = (ev: Event) => {
      const detail = (ev as CustomEvent<{ total?: number; newOrders: number }>).detail;
      if (detail && typeof detail.newOrders === "number") {
        applyCounts(
          typeof detail.total === "number" ? detail.total : liveOrdersCountRef.current,
          detail.newOrders,
          false
        );
      }
    };
    window.addEventListener("eline:orders-count-sync", handleLocalSync);

    // 2. Supabase Realtime WebSocket push (fires instantaneously when Realtime is enabled)
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("admin-sidebar-orders-live")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            refreshCounts();
          }
        )
        .subscribe();
    } catch {
      // Fallback polling below handles environments without Realtime
    }

    // 3. Lightweight 6-second visible-tab fallback + instant refresh on window focus
    const intervalId = window.setInterval(refreshCounts, 6000);
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        refreshCounts();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("eline:orders-count-sync", handleLocalSync);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.clearInterval(intervalId);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [canViewOrders, applyCounts]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#F8F9FB] font-outfit text-zinc-900 antialiased selection:bg-luxury-accent/20 selection:text-luxury-accent">
      {/* Desktop persistent sidebar (lg+) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar
          locale={locale}
          ordersCount={liveOrdersCount}
          newOrdersCount={liveNewOrdersCount}
          permissions={permissions}
          userRole={userRole}
        />
      </div>

      {/* Mobile & Tablet slide-over sidebar drawer (< lg) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
        />

        {/* Drawer Panel (slides from left in LTR, right in RTL) */}
        <div
          className={`fixed inset-y-0 start-0 z-50 w-[280px] max-w-[85vw] transform transition-transform duration-200 ease-out shadow-2xl ${
            mobileMenuOpen
              ? "translate-x-0"
              : locale === "ar"
              ? "translate-x-full"
              : "-translate-x-full"
          }`}
        >
          <AdminSidebar
            locale={locale}
            ordersCount={liveOrdersCount}
            newOrdersCount={liveNewOrdersCount}
            permissions={permissions}
            userRole={userRole}
            isMobileDrawer
            onNavigate={() => setMobileMenuOpen(false)}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
        <AdminHeader
          locale={locale}
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          isSimulating={isSimulating}
          simulatedRole={simulatedRole}
          isRealOwner={isRealOwner}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          newOrdersCount={liveNewOrdersCount}
        />
        {isSimulating && (
          <SimulationBanner locale={locale} simulatedRole={simulatedRole} />
        )}
        <main className="flex-1 px-3.5 py-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
