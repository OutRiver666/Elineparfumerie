import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center rounded-[6px] bg-luxury-secondary/50",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-luxury-surface text-luxury-accent mb-4">
        {icon || <Sparkles className="h-5 w-5 opacity-80" />}
      </div>
      <h3 className="font-serif text-lg font-medium text-luxury-text mb-1.5">{title}</h3>
      <p className="text-xs text-luxury-text-secondary max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction} variant="secondary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
