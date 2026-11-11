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
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "xs";
  asChild?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const variantStyles: Record<string, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring shadow-xs",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 shadow-xs",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring shadow-xs",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring shadow-xs",
  ghost:
    "text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:ring-ring",
  link: "text-brand underline-offset-4 hover:underline",
  brand:
    "bg-brand text-white hover:bg-brand-deep focus-visible:ring-brand shadow-xs",
  brandDeep:
    "bg-brand-deep text-white hover:bg-brand focus-visible:ring-brand-deep shadow-xs",
};

const sizeStyles: Record<string, string> = {
  default: "h-9 px-4 py-2",
  xs: "h-7 px-2.5 text-xs rounded-md",
  sm: "h-8 px-3 text-xs rounded-md",
  lg: "h-11 px-6 text-base rounded-xl",
  icon: "h-9 w-9 p-0",
  "icon-sm": "h-7 w-7 p-0",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const combinedClassName = buttonVariants({ variant, size, className });

    if (asChild && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(combinedClassName, child.props.className),
      });
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
