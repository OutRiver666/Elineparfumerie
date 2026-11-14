import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-luxury-secondary text-luxury-text rounded-[3px]",
        accent:
          "bg-luxury-accent/10 text-luxury-accent rounded-[3px]",
        outline:
          "border border-luxury-border text-luxury-text-secondary rounded-[3px]",
        dark:
          "bg-luxury-text text-white rounded-[3px]",
        x2:
          "bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-semibold rounded-[3px]",
        x3:
          "bg-teal-50 text-teal-900 border border-teal-200/60 font-semibold rounded-[3px]",
        x4:
          "bg-amber-100 text-amber-900 border border-amber-200/60 font-semibold rounded-[3px]",
        x5:
          "bg-amber-100 text-amber-950 border border-amber-300/70 font-semibold rounded-[3px]",
        x6:
          "bg-orange-50 text-orange-900 border border-orange-200/60 font-semibold rounded-[3px]",
        x7:
          "bg-orange-100 text-orange-950 border border-orange-300/70 font-bold rounded-[3px]",
        x8:
          "bg-orange-200/80 text-orange-950 border border-orange-300 font-bold rounded-[3px]",
        inStock:
          "bg-emerald-50 text-emerald-800 rounded-[3px]",
        outOfStock:
          "bg-red-50 text-red-800 rounded-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
