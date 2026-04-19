import * as React from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className={cn("max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950", className)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
