import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendType?: "positive" | "neutral" | "negative";
  variant?: "default" | "highlight" | "accent";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "positive",
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-[4px] transition-all",
        variant === "default" && "bg-luxury-secondary/70",
        variant === "highlight" && "bg-luxury-surface border-l-2 border-luxury-accent",
        variant === "accent" && "bg-luxury-accent/10 border-l-2 border-luxury-accent",
        className
      )}
    >
      <div className="flex items-center justify-between text-[11px] text-luxury-text-muted uppercase tracking-wider font-medium mb-2">
        <span>{title}</span>
        {trend && (
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-[2px]",
              trendType === "positive" && "text-emerald-700 bg-emerald-50",
              trendType === "negative" && "text-red-700 bg-red-50",
              trendType === "neutral" && "text-luxury-text-secondary bg-white"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="font-serif text-2xl font-medium text-luxury-text tracking-tight mb-1">
        {value}
      </div>

      {subtitle && (
        <p className="text-[11px] text-luxury-text-secondary leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
