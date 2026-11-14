"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className:
          "font-sans text-xs bg-white text-luxury-text border border-luxury-border shadow-floating rounded-[4px] p-4",
        descriptionClassName: "text-luxury-text-secondary text-[11px]",
      }}
    />
  );
}
