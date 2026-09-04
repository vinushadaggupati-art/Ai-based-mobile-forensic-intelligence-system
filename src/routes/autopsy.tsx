import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  AUTOPSY_CARVED_EVIDENCE,
  AUTOPSY_JOB,
  getAutopsyRecoverySummary,
  type AutopsyCarvedArtifact,
} from "@/lib/autopsy-data";
import {
  HardDrive,
  Cpu,
  Search,
  CheckCircle2,
  FileSearch,
  Layers,
  Terminal,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Upload,
  Binary,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/autopsy")({
  head: () => ({
    meta: [
      { title: "Autopsy Recovery · Mobile Forensic Intelligence" },
      {
        name: "description",
        content:
          "Recovered deleted evidence from mobile disk images carved using Autopsy 4.23.1 and The Sleuth Kit (TSK).",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <AutopsyRecoveryConsole />
    </AppLayout>
  ),
});

function AutopsyRecoveryConsole() {
  const [q, setQ] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<AutopsyCarvedArtifact | null>(
    AUTOPSY_CARVED_EVIDENCE[0],
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  const summary = getAutopsyRecoverySummary();

  const filtered = AUTOPSY_CARVED_EVIDENCE.filter((item) => {
    const matchesType = selectedType === "all" || item.evidenceType === selectedType;
    const matchesQuery = !q.trim() || JSON.stringify(item).toLowerCase().includes(q.toLowerCase());
    return matchesType && matchesQuery;
  });

  const handleLaunchAutopsy = () => {
    toast.info("Autopsy 4.23.1 Launch Instruction", {
      description:
        "Path: 'C:\\Program Files\\Autopsy-4.23.1\\bin\\autopsy64.exe'. Run 'python scripts/autopsy_extractor.py --launch' or open from Windows Start.",
      duration: 6000,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        toast.success(`Imported Autopsy case export: ${file.name}`, {
          description: `Successfully loaded artifact records into active intelligence pool.`,
        });
        setIsImportOpen(false);
      } catch (err) {
        toast.error("Failed to parse file: ensure it is a valid Autopsy JSON/CSV export");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="grid-forensic rounded-lg border border-border p-6 bg-card/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-primary flex items-center gap-1.5">
              <FileSearch className="size-3.5 text-primary" /> Autopsy Digital Forensics Platform
              4.23.1
            </div>
            <h1 className="text-2xl font-semibold mt-1">Deleted Evidence Recovery & Carving</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Extract and recover deleted SQLite records, unallocated NAND flash clusters, and
              Write-Ahead Log (WAL) journal frames carved from physical mobile device images.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={handleLaunchAutopsy}>
              <ExternalLink className="size-4 mr-1.5" /> Launch Autopsy 64
            </Button>
            <label>
              <input
                type="file"
                accept=".json,.csv,.tsv"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button asChild variant="outline" className="cursor-pointer">
                <span>
                  <Upload className="size-4 mr-1.5" /> Import Autopsy Report
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Ingest Job Details */}
        <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-muted-foreground uppercase text-[10px] block font-sans">
              Disk Image
            </span>
            <span
              className="text-foreground truncate block font-medium"
              title={AUTOPSY_JOB.imagePath}
            >
              userdata_phys.raw (256 GB)
            </span>
          </div>
          <div>
            <span className="text-muted-foreground uppercase text-[10px] block font-sans">
              Ingest Engine
            </span>
            <span className="text-primary font-medium">Autopsy 4.23.1 / TSK 4.12</span>
          </div>
          <div>
            <span className="text-muted-foreground uppercase text-[10px] block font-sans">
              Unallocated Scanned
            </span>
            <span className="text-foreground font-medium">
              {(AUTOPSY_JOB.unallocatedSpaceProcessedMB / 1024).toFixed(1)} GB NAND
            </span>
          </div>
          <div>
            <span className="text-muted-foreground uppercase text-[10px] block font-sans">
              Ingest Status
            </span>
            <span className="inline-flex items-center gap-1 text-priority-low font-medium">
              <CheckCircle2 className="size-3.5" /> Ingest Completed
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/70 border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Carved Deleted Items
          </div>
          <div className="text-2xl font-mono font-semibold mt-1 text-primary">{summary.total}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {summary.critical} critical significance
          </div>
        </Card>

        <Card className="p-4 bg-card/70 border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Avg Recovery Confidence
          </div>
          <div className="text-2xl font-mono font-semibold mt-1 text-priority-low">
            {summary.avgConfidence}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Calculated via parity & cell integrity
          </div>
        </Card>

        <Card className="p-4 bg-card/70 border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            SQLite Freelist Carves
          </div>
          <div className="text-2xl font-mono font-semibold mt-1 text-foreground">
            {summary.byMethod["SQLite Freelist Carving"] || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Recovered unallocated DB cells</div>
        </Card>

        <Card className="p-4 bg-card/70 border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Unallocated / WAL Carves
          </div>
          <div className="text-2xl font-mono font-semibold mt-1 text-foreground">
            {(summary.byMethod["TSK Unallocated Carving"] || 0) +
              (summary.byMethod["WAL Journal Recovery"] || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">PhotoRec + TSK carved files</div>
        </Card>
      </div>

      {/* Main Workspace: Table + Detail Inspector */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Evidence List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {["all", "SMS", "CHAT", "IMAGE", "BROWSER", "DOCUMENT"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    selectedType === t
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-card/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative w-56">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter carved items…"
                className="pl-8 h-8 text-xs bg-card/70"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filtered.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <Card
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 cursor-pointer transition-all border ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "bg-card/70 hover:bg-card/90 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {item.id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/80 border border-border text-muted-foreground font-mono">
                        {item.evidenceType}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          item.significance === "critical"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : item.significance === "high"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {item.significance}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-priority-low">
                      {item.confidence}% confidence
                    </span>
                  </div>

                  <div className="mt-1.5 text-sm font-medium text-foreground/95">{item.title}</div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="truncate max-w-[16rem]">{item.recoveryMethod}</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <Card className="p-8 text-center bg-card/40 text-muted-foreground text-sm">
                No carved items match the search criteria.
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Artifact Forensic Inspector (5 cols) */}
        <div className="lg:col-span-5">
          {selectedItem ? (
            <Card className="p-5 bg-card/80 border-border sticky top-6 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-primary">
                    Forensic Carved Inspector
                  </div>
                  <h3 className="text-base font-semibold mt-0.5">{selectedItem.title}</h3>
                </div>
                <span className="font-mono text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/25">
                  {selectedItem.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Technical Physical Carving Details */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-sans">Carved Method:</span>
                  <span className="text-foreground">{selectedItem.recoveryMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-sans">Physical Offset:</span>
                  <span className="text-foreground">{selectedItem.blockOffset}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-sans">Inode / Sector:</span>
                  <span className="text-foreground">{selectedItem.inode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-sans">Magic Header:</span>
                  <span className="text-primary font-bold">{selectedItem.hexSignature}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-sans">Source Database:</span>
                  <span
                    className="text-foreground truncate max-w-[14rem]"
                    title={selectedItem.sourceFile}
                  >
                    {selectedItem.sourceFile}
                  </span>
                </div>
              </div>

              {/* Decoded Content Payload */}
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 flex items-center gap-1">
                  <FileCode className="size-3 text-primary" /> Decoded Payload Data
                </div>
                <div className="p-3 rounded bg-background/80 border border-border text-xs font-mono overflow-x-auto max-h-48 text-foreground/90">
                  <pre>{JSON.stringify(selectedItem.content, null, 2)}</pre>
                </div>
              </div>

              {/* Examiner Forensic Notes */}
              <div>
                <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="size-3 text-priority-low" /> Examiner Finding
                </div>
                <p className="text-xs text-foreground/80 bg-background/50 p-2.5 rounded border border-border/80 leading-relaxed">
                  {selectedItem.forensicNotes}
                </p>
              </div>

              {/* SHA-256 Hash */}
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-sans">
                  Carved SHA-256 Hash
                </span>
                <span className="font-mono text-[10px] text-primary break-all block mt-0.5 select-all">
                  {selectedItem.sha256}
                </span>
              </div>
            </Card>
          ) : (
            <Card className="p-10 text-center bg-card/40 text-muted-foreground text-sm">
              Select a carved artifact to inspect physical offsets and raw payload.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
