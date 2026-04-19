import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowUpRight, Bot, CalendarClock, Home, MoonStar, SunMedium } from "lucide-react";
import { APP_NAME, FOUNDER_LABEL, FOUNDER_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/app/store";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/meetings/new", label: "Create meeting", icon: CalendarClock },
  { to: "/meetings", label: "Meetings", icon: ArrowUpRight },
  { to: "/agents", label: "Agents", icon: Bot },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const socketStatus = useAppStore((state) => state.socketStatus);

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 flex-col border-r border-slate-200/80 bg-white/70 px-5 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 xl:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-glow">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI meeting orchestration</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow-glow"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-auto space-y-4">
            <Separator />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Avatar name={FOUNDER_NAME} accent="blue" />
                <div>
                  <p className="text-sm font-medium">{FOUNDER_NAME}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{FOUNDER_LABEL}</p>
                </div>
              </div>
              <Badge tone={socketStatus === "connected" ? "success" : socketStatus === "connecting" ? "warning" : "slate"} className="mt-4">
                Socket {socketStatus}
              </Badge>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
            <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
              <div className="flex items-center gap-3 xl:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-glow">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold">{APP_NAME}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{FOUNDER_LABEL}</p>
                </div>
              </div>

              <div className="hidden items-center gap-2 xl:flex">
                <Badge tone="blue">Founder workspace</Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">Orchestrate meetings, capture decisions, and keep execution clear.</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={socketStatus === "connected" ? "success" : socketStatus === "connecting" ? "warning" : "slate"} className="hidden sm:inline-flex">
                  {socketStatus}
                </Badge>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                  {theme === "light" ? "Dark" : "Light"}
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 lg:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
