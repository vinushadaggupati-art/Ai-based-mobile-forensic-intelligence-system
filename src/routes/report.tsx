import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CASE,
  DEVICES,
  SMS,
  CALLS,
  GPS,
  BROWSER,
  APPS,
  computeEvidenceHashes,
} from "@/lib/forensic-data";
import {
  AUTOPSY_CARVED_EVIDENCE,
  AUTOPSY_JOB,
  computeAutopsyEvidenceHashes,
} from "@/lib/autopsy-data";
import { analyze } from "@/lib/ai-analyzer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { FileText, Download, FileSearch, Cpu, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Forensic Report · Forensic Intelligence System" },
      {
        name: "description",
        content:
          "Download official forensic investigation report including Autopsy 4.23.1 deleted evidence recovery, SHA-256 chain of custody, and Ollama AI analysis.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <Report />
    </AppLayout>
  ),
});

interface AutoTableDoc {
  lastAutoTable: { finalY: number };
}
const getFinalY = (d: unknown) => (d as AutoTableDoc).lastAutoTable.finalY;
type AutoTableFn = (doc: unknown, options: unknown) => void;

function Report() {
  const { findings, summary, stats, autopsyCarvedCount } = analyze();

  const download = async () => {
    toast.loading("Compiling official court-admissible forensic PDF…", { id: "pdf" });
    try {
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = (autoTableMod as { default: AutoTableFn }).default;
      const activeHashes = await computeEvidenceHashes();
      const autopsyHashes = await computeAutopsyEvidenceHashes();
      const allHashes = [...autopsyHashes, ...activeHashes];

      const doc = new jsPDF();
      const w = doc.internal.pageSize.getWidth();

      // Page 1: Header & Case Details
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, w, 32, "F");
      doc.setTextColor(255);
      doc.setFontSize(16);
      doc.text("Mobile Forensic Intelligence & Evidence Recovery Report", 14, 14);
      doc.setFontSize(10);
      doc.text(
        `Case: ${CASE.caseNumber} · Autopsy 4.23.1 Ingest · Ollama AI Assisted · Generated: ${new Date().toLocaleString()}`,
        14,
        23,
      );
      doc.setTextColor(0);

      let y = 40;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. Case & Examiner Information", 14, y);
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 8 },
        body: [
          ["Case Number", CASE.caseNumber],
          ["Investigation Title", CASE.title],
          ["Primary Examiner", CASE.investigator],
          ["Forensics Agency", CASE.agency],
          ["Subject / Target", CASE.suspect],
          ["Case Opened", new Date(CASE.openedAt).toLocaleString()],
          ["Case Status", CASE.status.toUpperCase()],
          ["Standards Compliance", "NIST SP 800-101 Rev. 1 / ISO/IEC 27037"],
        ],
      });
      y = getFinalY(doc) + 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. Forensic Device Acquisition & Autopsy Ingestion", 14, y);
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [["Model", "OS & Build", "Method", "Serial / IMEI", "Acquired At"]],
        body: DEVICES.map((d) => [
          d.model,
          `${d.os} ${d.osVersion}`,
          d.acquisitionMethod,
          `${d.serial} / ${d.imei}`,
          new Date(d.acquiredAt).toLocaleString(),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 41, 59] },
      });
      y = getFinalY(doc) + 8;

      // Autopsy Ingest parameters
      autoTable(doc, {
        startY: y,
        theme: "plain",
        styles: { fontSize: 7, fontStyle: "italic" },
        body: [
          [
            `Autopsy Job: ${AUTOPSY_JOB.id} | Engine: ${AUTOPSY_JOB.autopsyVersion} | Image: ${AUTOPSY_JOB.imagePath} | Unallocated Carved: ${(AUTOPSY_JOB.unallocatedSpaceProcessedMB / 1024).toFixed(1)} GB`,
          ],
        ],
      });
      y = getFinalY(doc) + 8;

      // Section 3: Autopsy Recovered Deleted Evidence (Critical)
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        `3. Autopsy 4.23.1 Recovered Deleted Evidence (${AUTOPSY_CARVED_EVIDENCE.length} Carved Artifacts)`,
        14,
        y,
      );
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [
          [
            "ID",
            "Type",
            "Recovery Method",
            "Confidence",
            "Physical Location",
            "Carved Content / Significance",
          ],
        ],
        body: AUTOPSY_CARVED_EVIDENCE.map((item) => [
          item.id,
          item.evidenceType,
          item.recoveryMethod,
          `${item.confidence}%`,
          `${item.blockOffset}\n(${item.inode})`,
          `${item.title}\n"${item.content.body || item.content.text || item.content.visualText || item.content.url || item.content.snippet || item.title}"`,
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [180, 40, 40] },
        columnStyles: {
          5: { cellWidth: 70 },
        },
      });
      y = getFinalY(doc) + 8;

      // Page 2: AI Investigator Findings & Correlation
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("4. AI Investigator Narrative Summary (Ollama LLM)", 14, y);
      doc.setFont("helvetica", "normal");
      y += 6;

      doc.setFontSize(8.5);
      const summaryLines = doc.splitTextToSize(summary, w - 28);
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 4 + 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        `5. Correlated Forensic Findings (High: ${stats.high} | Med: ${stats.medium} | Low: ${stats.low})`,
        14,
        y,
      );
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [["Priority", "Category", "Finding", "Forensic Rationale"]],
        body: findings.map((f) => [f.priority.toUpperCase(), f.category, f.title, f.rationale]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [30, 41, 59] },
        columnStyles: { 3: { cellWidth: 85 } },
      });

      // Page 3: Active Mobile Evidence (SMS, Calls, GPS, Browser)
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("6. Active Mobile Artifacts (SMS & Voice Calls)", 14, y);
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [["Dir", "Contact", "Number", "Timestamp (UTC)", "Message Body"]],
        body: SMS.map((s) => [
          s.direction.toUpperCase(),
          s.contact,
          s.number,
          new Date(s.timestamp).toLocaleString(),
          s.body,
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 41, 59] },
      });
      y = getFinalY(doc) + 8;

      autoTable(doc, {
        startY: y,
        head: [["Call Type", "Contact", "Number", "Timestamp (UTC)", "Duration"]],
        body: CALLS.map((c) => [
          c.type.toUpperCase(),
          c.contact,
          c.number,
          new Date(c.timestamp).toLocaleString(),
          `${c.durationSec} sec`,
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 41, 59] },
      });

      // Page 4: GPS Telemetry & Browser History
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("7. Spatial Telemetry & Web Navigation Records", 14, y);
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [["Location Description", "Latitude", "Longitude", "Accuracy", "Timestamp (UTC)"]],
        body: GPS.map((g) => [
          g.place,
          g.lat.toString(),
          g.lng.toString(),
          `±${g.accuracyM}m`,
          new Date(g.timestamp).toLocaleString(),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 41, 59] },
      });
      y = getFinalY(doc) + 8;

      autoTable(doc, {
        startY: y,
        head: [["Page Title", "URL / Domain", "Visits", "Last Visited"]],
        body: BROWSER.map((b) => [
          b.title,
          b.url,
          b.visits.toString(),
          new Date(b.timestamp).toLocaleString(),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 41, 59] },
      });

      // Page 5: Chain of Custody & SHA-256 Hash Verification Table
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("8. Cryptographic Hash Table & Chain of Custody (SHA-256)", 14, y);
      doc.setFont("helvetica", "normal");
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [
          ["Evidence Category", "Item ID", "Artifact Label", "SHA-256 Checksum (SubtleCrypto)"],
        ],
        body: allHashes.map((h) => [h.kind, h.id, h.label, h.hash]),
        styles: { fontSize: 6.5, font: "courier" },
        headStyles: { fillColor: [15, 23, 42] },
      });

      // Footer pagination across all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `CONFIDENTIAL FORENSIC DELIVERABLE · Case ${CASE.caseNumber} · Page ${i} of ${totalPages}`,
          14,
          doc.internal.pageSize.getHeight() - 8,
        );
      }

      doc.save(`${CASE.caseNumber}_Autopsy_Ollama_Forensic_Report.pdf`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Report generation failed: ${msg}`, { id: "pdf" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid-forensic rounded-lg border border-border p-6 bg-card/40 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary flex items-center gap-1.5">
            <FileText className="size-3.5" /> Official Forensic Deliverable
          </div>
          <h1 className="text-2xl font-semibold mt-1">Forensic Investigation Report</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            A comprehensive, court-admissible PDF document combining physical device acquisition,
            <strong className="text-foreground"> Autopsy 4.23.1 carved deleted artifacts</strong>,
            <strong className="text-foreground"> Ollama AI findings</strong>, and cryptographic
            SHA-256 chain-of-custody verification.
          </p>
        </div>
        <Button size="lg" onClick={download} className="gap-2">
          <Download className="size-4" /> Download Official PDF Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 bg-card/70 border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <FileSearch className="size-4 text-primary" /> Autopsy Recovered Deleted Artifacts
          </h2>
          <ul className="text-xs space-y-2 text-foreground/90">
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>SQLite Freelist SMS Carves:</span>
              <span className="font-mono font-semibold text-primary">
                2 messages ("burn phone", "wipe sd")
              </span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>WAL Journal Frame Recovery:</span>
              <span className="font-mono font-semibold text-primary">
                1 WhatsApp record (1.2 BTC transfer)
              </span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>Unallocated Space Image Carves:</span>
              <span className="font-mono font-semibold text-primary">
                2 photos (Ocean Beach, SFO pass)
              </span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>Chrome Deleted History Freelist:</span>
              <span className="font-mono font-semibold text-primary">1 Darknet mixer URL</span>
            </li>
            <li className="flex justify-between pt-1">
              <span>Total Autopsy Carved Items:</span>
              <span className="font-mono font-bold text-priority-low">
                {autopsyCarvedCount} artifacts
              </span>
            </li>
          </ul>
        </Card>

        <Card className="p-5 bg-card/70 border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Cpu className="size-4 text-primary" /> Ollama AI Findings & Integrity
          </h2>
          <ul className="text-xs space-y-2 text-foreground/90">
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>Case File:</span>
              <span className="font-mono text-foreground font-semibold">{CASE.caseNumber}</span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>AI Findings Breakdown:</span>
              <span className="font-mono">
                <span className="text-red-400 font-bold">{stats.high} High</span> ·{" "}
                <span className="text-amber-400 font-bold">{stats.medium} Med</span> ·{" "}
                <span className="text-blue-400 font-bold">{stats.low} Low</span>
              </span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-1">
              <span>Integrity Verification:</span>
              <span className="font-mono text-priority-low inline-flex items-center gap-1">
                <CheckCircle2 className="size-3" /> SHA-256 Verified
              </span>
            </li>
            <li className="flex justify-between pt-1">
              <span>Standards Reference:</span>
              <span className="font-mono text-foreground">NIST SP 800-101 / ISO 27037</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-5 bg-card/70 border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" /> AI Investigator Narrative Summary Preview
        </h2>
        <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed bg-background/50 p-4 rounded border border-border">
          {summary}
        </div>
      </Card>
    </div>
  );
}
