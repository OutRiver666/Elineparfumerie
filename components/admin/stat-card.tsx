import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendType?: "positive" | "neutral" | "negative";
  variant?: "default" | "highlight" | "accent";
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "positive",
  variant = "default",
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white p-5 transition-all duration-200",
        "border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-zinc-300/90",
        variant === "highlight" && "border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/30",
        variant === "accent" && "border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30",
        className
      )}
    >
      {/* Subtle top accent bar for highlighted variants */}
      {variant === "highlight" && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
      )}
      {variant === "accent" && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
      )}

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-outfit text-xs font-medium text-zinc-500 tracking-wide">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-outfit text-[11px] font-semibold px-2 py-0.5 rounded-full tracking-tight",
                trendType === "positive" && "text-emerald-700 bg-emerald-50 border border-emerald-100",
                trendType === "negative" && "text-rose-700 bg-rose-50 border border-rose-100",
                trendType === "neutral" && "text-zinc-600 bg-zinc-100 border border-zinc-200"
              )}
            >
              {trend}
            </span>
          )}
          {Icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-200">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      <div className="font-outfit text-2xl sm:text-[26px] font-bold text-zinc-900 tracking-tight leading-none mb-1.5">
        {value}
      </div>

      {subtitle && (
        <p className="font-outfit text-xs text-zinc-400 leading-normal line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
