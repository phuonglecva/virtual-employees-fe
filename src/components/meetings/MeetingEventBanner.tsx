import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetingBanner } from "@/app/store";

export function MeetingEventBanner({ banner }: { banner: MeetingBanner | null }) {
  if (!banner) return null;

  const toneClasses = {
    default: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    destructive: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  } as const;

  const Icon = banner.tone === "success" ? CheckCircle2 : banner.tone === "warning" ? AlertTriangle : banner.tone === "destructive" ? AlertTriangle : Sparkles;

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm", toneClasses[banner.tone || "default"])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">{banner.title}</p>
        {banner.description ? <p className="mt-0.5 opacity-80">{banner.description}</p> : null}
      </div>
    </div>
  );
}
