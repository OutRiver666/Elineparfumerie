"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { Locale } from "@/lib/i18n";
import { deleteProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteProductButtonProps {
  productId: string;
  productNameFr: string;
  productNameAr: string;
  productSlug: string;
  variantsCount: number;
  locale: Locale;
  size?: "mobile" | "desktop";
}

export function DeleteProductButton({
  productId,
  productNameFr,
  productNameAr,
  productSlug,
  variantsCount,
  locale,
  size = "desktop",
}: DeleteProductButtonProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayName = isAr ? productNameAr || productNameFr : productNameFr || productNameAr;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setErrorMsg(null);
    }
  };

  const handleConfirmDelete = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await deleteProduct(productId, locale);
      if (result.success) {
        toast.success(
          isAr
            ? `تم حذف العطر "${displayName}" بنجاح`
            : `Le parfum « ${displayName} » a été supprimé`
        );
        setOpen(false);
        router.refresh();
      } else {
        const message =
          result.error ||
          (isAr
            ? "تعذر حذف العطر. يرجى المحاولة مرة أخرى."
            : "Impossible de supprimer ce parfum.");
        setErrorMsg(message);
        toast.error(message);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMsg(null);
          setOpen(true);
        }}
        title={isAr ? "حذف العطر" : "Supprimer le parfum"}
        aria-label={isAr ? `حذف ${displayName}` : `Supprimer ${displayName}`}
        className={
          size === "mobile"
            ? "p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
            : "p-1.5 rounded-lg hover:bg-rose-50 text-zinc-500 hover:text-rose-600 transition-colors"
        }
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md rounded-2xl border-zinc-200/90 p-0 overflow-hidden font-outfit"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

          <div className="p-6 space-y-5">
            <DialogHeader className="space-y-3 text-start">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center shrink-0 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <DialogTitle className="text-base sm:text-lg font-bold text-zinc-950">
                    {isAr ? "تأكيد حذف العطر" : "Supprimer ce parfum ?"}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                    {isAr
                      ? "هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم إزالة العطر وجميع أحجامه من المتجر."
                      : "Cette action est irréversible. Le parfum et toutes ses variantes seront définitivement retirés de la boutique."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Target Perfume Summary Card */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-center shrink-0 text-zinc-700 shadow-sm">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-zinc-900 truncate">{displayName}</p>
                <p className="text-[11px] text-zinc-500 font-mono truncate">
                  /{productSlug}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600">
                {variantsCount}{" "}
                {isAr
                  ? variantsCount === 1
                    ? "حجم"
                    : "أحجام"
                  : variantsCount > 1
                  ? "variantes"
                  : "variante"}
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {isAr
                ? "ملاحظة: ستبقى الطلبات السابقة للعملاء محفوظة في سجل الطلبات ولن تتأثر."
                : "Note : L'historique des commandes passées par vos clients reste intact et préservé."}
            </p>

            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              >
                {isAr ? "إلغاء" : "Annuler"}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? "جاري الحذف..." : "Suppression..."}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{isAr ? "تأكيد الحذف" : "Supprimer définitivement"}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
