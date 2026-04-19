import { useEffect } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/app/store";
import { cn } from "@/lib/utils";

const toneStyles = {
  default: "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  destructive: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100",
} as const;

export function Toaster() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    const id = window.setTimeout(() => dismissToast(toasts[0]!.id), 4500);
    return () => window.clearTimeout(id);
  }, [dismissToast, toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn("pointer-events-auto rounded-2xl border px-4 py-3 shadow-soft", toneStyles[toast.tone || "default"])}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
            </div>
            <button className="rounded-lg p-1 opacity-70 transition hover:opacity-100" onClick={() => dismissToast(toast.id)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
