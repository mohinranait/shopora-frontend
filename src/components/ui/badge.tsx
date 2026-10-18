import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "brand"
    | "purple";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors";

  const variantStyles: Record<string, string> = {
    default: "bg-slate-800 text-slate-100 border border-slate-700",
    secondary: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    destructive: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    outline: "text-slate-300 border border-slate-700",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    brand: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}

export { Badge };
