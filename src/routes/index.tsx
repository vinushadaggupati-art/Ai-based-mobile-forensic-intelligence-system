import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CASE, DEVICES, SMS, CALLS, GPS, APPS, BROWSER, MEDIA } from "@/lib/forensic-data";
import { analyze } from "@/lib/ai-analyzer";
import { PriorityBadge } from "@/components/PriorityBadge";
import {
  Smartphone,
  MessageSquare,
  Phone,
  MapPin,
  Globe,
  AppWindow,
  Image as ImageIcon,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Forensic Intelligence System" },
      {
        name: "description",
        content:
          "Overview of active forensic case, connected devices, and AI-prioritized suspicious findings.",
      },
      { property: "og:title", content: "Forensic Intelligence Dashboard" },
      {
        property: "og:description",
        content: "Case overview, device acquisition status, and AI-prioritized findings.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ),
});

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="p-4 bg-card/70 border-border">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="size-4 text-primary/70" />
      </div>
      <div className="mt-2 text-2xl font-semibold font-mono">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}

function Dashboard() {
  const { findings, stats } = analyze();
  const top = findings.filter((f) => f.priority === "high").slice(0, 3);
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="grid-forensic rounded-lg border border-border p-6 bg-card/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-primary">Case File</div>
            <h1 className="text-2xl font-semibold mt-1">{CASE.title}</h1>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-mono text-primary">{CASE.caseNumber}</span> · Opened{" "}
              {new Date(CASE.openedAt).toLocaleString()} · Status:{" "}
              <span className="text-priority-low font-medium">{CASE.status}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <Link to="/autopsy">Autopsy Recovery</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/evidence">Browse Evidence</Link>
            </Button>
            <Button asChild>
              <Link to="/analysis">
                Run Ollama AI Analysis <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat
          icon={Smartphone}
          label="Devices"
          value={DEVICES.length}
          sub={`${DEVICES.filter((d) => d.status === "acquired").length} acquired`}
        />
        <Stat icon={ShieldAlert} label="High Priority" value={stats.high} sub="Ollama AI flagged" />
        <Stat
          icon={ShieldAlert}
          label="Autopsy Carved"
          value={7}
          sub="Deleted artifacts recovered"
        />
        <Stat
          icon={MessageSquare}
          label="SMS / Calls"
          value={SMS.length + CALLS.length}
          sub={`${MEDIA.length} media files`}
        />
        <Stat
          icon={MapPin}
          label="GPS Points"
          value={GPS.length}
          sub={`${BROWSER.length} browser · ${APPS.length} apps`}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 p-5 bg-card/70">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Top AI Findings (Autopsy + Ollama)
            </h2>
            <Link to="/analysis" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {top.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-md border border-border bg-background/40 flex items-start gap-3"
              >
                <PriorityBadge priority={f.priority} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {f.rationale}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 bg-card/70">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Connected Devices
          </h2>
          <div className="space-y-3">
            {DEVICES.map((d) => (
              <div key={d.id} className="p-3 rounded-md border border-border bg-background/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{d.model}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                    {d.os}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {d.acquisitionMethod} · {d.osVersion}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-card/70">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Evidence Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-sm">
          {[
            { icon: ShieldAlert, label: "Autopsy Deleted", n: 7, to: "/autopsy" },
            { icon: MessageSquare, label: "SMS", n: SMS.length, to: "/evidence" },
            { icon: Phone, label: "Calls", n: CALLS.length, to: "/evidence" },
            { icon: MapPin, label: "GPS", n: GPS.length, to: "/evidence" },
            { icon: Globe, label: "Browser", n: BROWSER.length, to: "/evidence" },
            { icon: AppWindow, label: "Apps", n: APPS.length, to: "/evidence" },
            { icon: ImageIcon, label: "Media", n: MEDIA.length, to: "/evidence" },
          ].map((c) => (
            <Link
              to={c.to}
              key={c.label}
              className="p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 transition"
            >
              <c.icon className="size-4 text-primary mb-2" />
              <div className="text-xs uppercase tracking-wider text-muted-foreground truncate">
                {c.label}
              </div>
              <div className="font-mono text-lg">{c.n}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
