import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "destructive" | "blue" | "slate" }) {
  const toneClasses: Record<NonNullable<typeof tone>, string> = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    destructive: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
