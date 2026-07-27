import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Shield, LayoutDashboard, Smartphone, Database, Sparkles, FileText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { CASE } from "@/lib/forensic-data";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Smartphone },
  { to: "/evidence", label: "Evidence", icon: Database },
  { to: "/analysis", label: "AI Analysis", icon: Sparkles },
  { to: "/report", label: "Report", icon: FileText },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex text-foreground">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-sm flex flex-col">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-primary/15 border border-primary/30 grid place-items-center">
              <Shield className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">FORENSIC / IS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Mobile Intelligence</div>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {NAV.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-primary/25"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 m-3 rounded-md bg-card/60 border border-border text-xs">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Active Case</div>
          <div className="font-mono text-primary">{CASE.caseNumber}</div>
          <div className="mt-1 line-clamp-2 text-foreground/80">{CASE.title}</div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background/60 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <Radio className="size-3.5 text-priority-low animate-pulse" />
            <span className="text-muted-foreground">Session secure · Chain-of-custody logging enabled</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">{CASE.investigator}</div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
