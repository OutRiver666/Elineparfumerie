import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs uppercase tracking-wider font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luxury-accent disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-luxury-text text-white hover:bg-black shadow-subtle",
        secondary:
          "bg-luxury-surface text-luxury-text hover:bg-[#EBE8E1]",
        accent:
          "bg-luxury-accent text-white hover:bg-luxury-accent-hover shadow-subtle",
        outline:
          "border border-luxury-border bg-transparent text-luxury-text hover:bg-luxury-surface",
        ghost:
          "text-luxury-text hover:bg-luxury-secondary hover:text-black",
        link:
          "text-luxury-text underline-offset-4 hover:underline lowercase tracking-normal text-sm font-normal",
        gold:
          "bg-[#9A7655] text-white hover:bg-[#836446]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-subtle",
      },
      size: {
        default: "h-10 px-5 rounded-[4px]",
        sm: "h-8 px-3.5 text-[11px] rounded-[4px]",
        lg: "h-12 px-7 text-xs rounded-[4px]",
        icon: "h-9 w-9 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
