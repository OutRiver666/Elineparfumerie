"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  height?: number | string;
  children: React.ReactElement;
}

/**
 * ReUI / Shadcn-compatible Chart Container wrapping Recharts ResponsiveContainer
 * with consistent CSS color variables and crisp typography tokens.
 */
export function ChartContainer({
  config,
  height = 280,
  className,
  children,
  style,
  ...props
}: ChartContainerProps) {
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, item] of Object.entries(config)) {
      vars[`--color-${key}`] = item.color;
    }
    return vars;
  }, [config]);

  return (
    <div
      className={cn(
        "w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-400 [&_.recharts-cartesian-grid_line]:stroke-zinc-200/70 [&_.recharts-tooltip-cursor]:stroke-zinc-300 [&_.recharts-surface]:outline-none",
        className
      )}
      style={{ height, ...cssVars, ...style } as React.CSSProperties}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

interface ReuiTooltipItem {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
}

interface ReuiTooltipProps {
  active?: boolean;
  payload?: readonly ReuiTooltipItem[];
  label?: string | number;
  valueFormatter?: (value: number, dataKey: string) => string;
  labelMap?: Record<string, string>;
  titleFormatter?: (label: string | number) => string;
}

/**
 * Sleek ReUI-styled floating Tooltip card for Recharts visualizations.
 */
export function ReuiChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelMap,
  titleFormatter,
}: ReuiTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-[175px] rounded-xl border border-zinc-200/90 bg-white/95 backdrop-blur-md p-3 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.14)] text-xs font-outfit">
      {label !== undefined && label !== "" && (
        <div className="mb-2 pb-1.5 border-b border-zinc-100 font-bold text-zinc-900 text-[11px]">
          {titleFormatter ? titleFormatter(label) : String(label)}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const key = String(entry.dataKey || entry.name || index);
          const color = entry.color || entry.stroke || entry.fill || "#18181b";
          const numericVal = Number(entry.value ?? 0);
          const displayLabel = labelMap?.[key] || entry.name || key;
          const displayValue = valueFormatter
            ? valueFormatter(numericVal, key)
            : numericVal.toLocaleString();

          return (
            <div key={`${key}-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-zinc-500 font-medium truncate">{displayLabel}</span>
              </div>
              <span className="font-bold text-zinc-900 tabular-nums shrink-0">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
