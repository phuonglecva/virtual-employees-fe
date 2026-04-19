import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "default" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700 shadow-glow",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  destructive: "bg-rose-600 text-white hover:bg-rose-700",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  default: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
