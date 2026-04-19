import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  accent?: "blue" | "slate" | "cyan" | "emerald" | "violet" | "amber";
  className?: string;
}

export function Avatar({ name, accent = "blue", className }: AvatarProps) {
  const accentClasses: Record<NonNullable<AvatarProps["accent"]>, string> = {
    blue: "from-blue-500 to-sky-500",
    slate: "from-slate-500 to-slate-700",
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    violet: "from-indigo-500 to-violet-500",
    amber: "from-amber-500 to-orange-500",
  };

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white shadow-soft",
        accentClasses[accent],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
