import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { SMS, CALLS, CONTACTS, GPS, BROWSER, APPS, MEDIA, computeEvidenceHashes, sha256 } from "@/lib/forensic-data";
import { Search, MessageSquare, Phone, MapPin, Globe, AppWindow, Image as ImageIcon, User, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence · Forensic Intelligence System" },
      { name: "description", content: "Browse SMS, calls, contacts, GPS, browser history, apps, and media with SHA-256 integrity hashes." },
      { property: "og:title", content: "Forensic Evidence Browser" },
      { property: "og:description", content: "Search and filter collected mobile forensic artifacts with SHA-256 verification." },
    ],
  }),
  component: () => (<AppLayout><Evidence /></AppLayout>),
});

function Evidence() {
  const [q, setQ] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    computeEvidenceHashes().then((items) => {
      const map: Record<string, string> = {};
      for (const it of items) map[it.id] = it.hash;
      setHashes(map);
    });
  }, []);

  const filter = <T extends Record<string, any>>(rows: T[]) => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Evidence Browser</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Collected artifacts organized by type. Every record has a SHA-256 hash stored with the case file.
          </p>
        </div>
        <div className="relative w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all evidence…" className="pl-9 bg-card/70" />
        </div>
      </div>

      <Tabs defaultValue="sms">
        <TabsList className="bg-card/60">
          <TabsTrigger value="sms"><MessageSquare className="size-3.5 mr-1.5" />SMS ({SMS.length})</TabsTrigger>
          <TabsTrigger value="calls"><Phone className="size-3.5 mr-1.5" />Calls ({CALLS.length})</TabsTrigger>
          <TabsTrigger value="contacts"><User className="size-3.5 mr-1.5" />Contacts ({CONTACTS.length})</TabsTrigger>
          <TabsTrigger value="gps"><MapPin className="size-3.5 mr-1.5" />GPS ({GPS.length})</TabsTrigger>
          <TabsTrigger value="browser"><Globe className="size-3.5 mr-1.5" />Browser ({BROWSER.length})</TabsTrigger>
          <TabsTrigger value="apps"><AppWindow className="size-3.5 mr-1.5" />Apps ({APPS.length})</TabsTrigger>
          <TabsTrigger value="media"><ImageIcon className="size-3.5 mr-1.5" />Media ({MEDIA.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sms"><EvTable
          rows={filter(SMS)} hashes={hashes}
          cols={[
            { k: "direction", label: "Dir" },
            { k: "contact", label: "Contact" },
            { k: "number", label: "Number", mono: true },
            { k: "timestamp", label: "When", fmt: (v) => new Date(v).toLocaleString() },
            { k: "body", label: "Message", grow: true },
          ]}
        /></TabsContent>

        <TabsContent value="calls"><EvTable
          rows={filter(CALLS)} hashes={hashes}
          cols={[
            { k: "type", label: "Type" },
            { k: "contact", label: "Contact" },
            { k: "number", label: "Number", mono: true },
            { k: "timestamp", label: "When", fmt: (v) => new Date(v).toLocaleString() },
            { k: "durationSec", label: "Duration", fmt: (v) => `${v}s` },
          ]}
        /></TabsContent>

        <TabsContent value="contacts"><EvTable
          rows={filter(CONTACTS)} hashes={hashes}
          cols={[
            { k: "name", label: "Name" },
            { k: "number", label: "Number", mono: true },
            { k: "email", label: "Email", mono: true },
          ]}
        /></TabsContent>

        <TabsContent value="gps"><EvTable
          rows={filter(GPS)} hashes={hashes}
          cols={[
            { k: "place", label: "Location", grow: true },
            { k: "lat", label: "Lat", mono: true },
            { k: "lng", label: "Lng", mono: true },
            { k: "accuracyM", label: "±m" },
            { k: "timestamp", label: "When", fmt: (v) => new Date(v).toLocaleString() },
          ]}
        /></TabsContent>

        <TabsContent value="browser"><EvTable
          rows={filter(BROWSER)} hashes={hashes}
          cols={[
            { k: "title", label: "Title", grow: true },
            { k: "url", label: "URL", mono: true, grow: true },
            { k: "visits", label: "Visits" },
            { k: "timestamp", label: "When", fmt: (v) => new Date(v).toLocaleString() },
          ]}
        /></TabsContent>

        <TabsContent value="apps"><EvTable
          rows={filter(APPS)} hashes={hashes}
          cols={[
            { k: "name", label: "App" },
            { k: "pkg", label: "Package", mono: true },
            { k: "permissions", label: "Perms", fmt: (v: string[]) => v.join(", ") },
            { k: "installedAt", label: "Installed", fmt: (v) => new Date(v).toLocaleString() },
            { k: "suspicious", label: "Flag", fmt: (v) => v ? <span className="text-priority-high">⚑ suspicious</span> : <span className="text-muted-foreground">—</span> },
          ]}
        /></TabsContent>

        <TabsContent value="media"><MediaGrid rows={filter(MEDIA)} /></TabsContent>
      </Tabs>
    </div>
  );
}

type Col = { k: string; label: string; mono?: boolean; grow?: boolean; fmt?: (v: any) => any };

function EvTable({ rows, cols, hashes }: { rows: any[]; cols: Col[]; hashes: Record<string, string> }) {
  return (
    <Card className="bg-card/70 overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
              {cols.map((c) => <th key={c.k} className="text-left px-3 py-2 font-medium">{c.label}</th>)}
              <th className="text-left px-3 py-2 font-medium">SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-primary/5">
                {cols.map((c) => {
                  const v = r[c.k];
                  return (
                    <td key={c.k} className={`px-3 py-2 align-top ${c.mono ? "font-mono text-xs" : ""} ${c.grow ? "max-w-md" : ""}`}>
                      {c.fmt ? c.fmt(v) : v ?? "—"}
                    </td>
                  );
                })}
                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground max-w-[10rem] truncate" title={hashes[r.id]}>
                  {hashes[r.id] ? (
                    <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3 text-priority-low" />{hashes[r.id].slice(0, 16)}…</span>
                  ) : "…"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="px-3 py-8 text-center text-muted-foreground text-sm">No matching records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MediaGrid({ rows }: { rows: typeof MEDIA }) {
  const [hashes, setHashes] = useState<Record<string, string>>({});
  useEffect(() => {
    (async () => {
      const m: Record<string, string> = {};
      for (const r of rows) m[r.id] = await sha256(r.filename + r.sizeKB);
      setHashes(m);
    })();
  }, [rows]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {rows.map((m) => (
        <Card key={m.id} className="p-3 bg-card/70">
          <div className="aspect-video rounded bg-background/60 border border-border grid place-items-center text-muted-foreground text-xs uppercase tracking-widest">
            {m.type}
          </div>
          <div className="mt-2 text-sm font-medium truncate" title={m.filename}>{m.filename}</div>
          <div className="text-xs text-muted-foreground">{m.sizeKB} KB · {new Date(m.createdAt).toLocaleDateString()}</div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground truncate" title={hashes[m.id]}>
            {hashes[m.id]?.slice(0, 24) ?? "…"}…
          </div>
        </Card>
      ))}
    </div>
  );
}
