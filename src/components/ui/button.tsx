import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "brand"
    | "brandDeep";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles: Record<string, string> = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
      outline:
        "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-white focus-visible:ring-slate-700",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-800",
      ghost:
        "text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-700",
      link: "text-sky-400 underline-offset-4 hover:underline",
      brand:
        "bg-brand text-white hover:bg-brand-deep focus-visible:ring-brand",
      brandDeep:
        "bg-brand-deep text-white hover:bg-brand focus-visible:ring-brand-deep",
    };

    const sizeStyles: Record<string, string> = {
      default: "h-9 px-4 py-2",
      xs: "h-7 px-2.5 text-xs rounded-md",
      sm: "h-8 px-3 text-xs rounded-md",
      lg: "h-11 px-6 text-base rounded-xl",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
