"use client";

import React from "react";
import { PerfumeVariant } from "@/lib/data/mock-perfumes";
import { formatBottleSize, cn } from "@/lib/utils";

interface SizePickerProps {
  variants: PerfumeVariant[];
  selectedVariantId: string;
  onSelectVariant: (variant: PerfumeVariant) => void;
  className?: string;
  compact?: boolean;
}

export function SizePicker({
  variants,
  selectedVariantId,
  onSelectVariant,
  className,
  compact = false,
}: SizePickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {variants.map((v) => {
        const isSelected = v.id === selectedVariantId;
        return (
          <button
            key={v.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectVariant(v);
            }}
            className={cn(
              "transition-all duration-150 select-none font-medium",
              compact
                ? "text-[10px] px-2 py-0.5 rounded-[3px]"
                : "text-xs px-3 py-1.5 rounded-[4px]",
              isSelected
                ? "bg-luxury-text text-white shadow-subtle"
                : "bg-luxury-secondary text-luxury-text-secondary hover:bg-luxury-surface hover:text-luxury-text"
            )}
            title={`${formatBottleSize(v.size)} - ${v.stock > 0 ? "En stock" : "Rupture"}`}
          >
            {formatBottleSize(v.size)}
          </button>
        );
      })}
    </div>
  );
}
