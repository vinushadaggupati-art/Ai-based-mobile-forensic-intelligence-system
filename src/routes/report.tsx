import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CASE, DEVICES, SMS, CALLS, GPS, BROWSER, APPS, computeEvidenceHashes } from "@/lib/forensic-data";
import { analyze } from "@/lib/ai-analyzer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report · Forensic Intelligence System" },
      { name: "description", content: "Generate a downloadable PDF forensic investigation report with case, evidence, hashes, and AI findings." },
      { property: "og:title", content: "Forensic Investigation Report" },
      { property: "og:description", content: "Download PDF report including SHA-256 hashes and AI-prioritized findings." },
    ],
  }),
  component: () => (<AppLayout><Report /></AppLayout>),
});

function Report() {
  const { findings, summary, stats } = analyze();

  const download = async () => {
    toast.loading("Compiling PDF…", { id: "pdf" });
    const [{ default: jsPDF }, autoTableMod] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = (autoTableMod as any).default;
    const hashes = await computeEvidenceHashes();
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();

    doc.setFillColor(20, 30, 55);
    doc.rect(0, 0, w, 30, "F");
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text("Mobile Forensic Investigation Report", 14, 14);
    doc.setFontSize(10);
    doc.text(`Case ${CASE.caseNumber} · ${new Date().toLocaleString()}`, 14, 22);
    doc.setTextColor(0);

    let y = 38;
    doc.setFontSize(12); doc.text("Case Information", 14, y); y += 6;
    autoTable(doc, {
      startY: y, theme: "grid", styles: { fontSize: 9 },
      body: [
        ["Case Number", CASE.caseNumber],
        ["Title", CASE.title],
        ["Investigator", CASE.investigator],
        ["Agency", CASE.agency],
        ["Suspect", CASE.suspect],
        ["Opened", new Date(CASE.openedAt).toLocaleString()],
        ["Status", CASE.status],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    doc.setFontSize(12); doc.text("Devices & Acquisition", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Model", "OS", "Method", "Serial", "Acquired"]],
      body: DEVICES.map((d) => [d.model, `${d.os} ${d.osVersion}`, d.acquisitionMethod, d.serial, new Date(d.acquiredAt).toLocaleString()]),
      styles: { fontSize: 8 }, headStyles: { fillColor: [40, 60, 100] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    doc.setFontSize(12); doc.text(`AI Findings (H:${stats.high} M:${stats.medium} L:${stats.low})`, 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Priority", "Category", "Finding", "Rationale"]],
      body: findings.map((f) => [f.priority.toUpperCase(), f.category, f.title, f.rationale]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 60, 100] },
      columnStyles: { 3: { cellWidth: 80 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    doc.addPage(); y = 20;
    doc.setFontSize(12); doc.text("AI Investigator Summary", 14, y); y += 6;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(summary, w - 28);
    doc.text(lines, 14, y); y += lines.length * 4 + 6;

    doc.setFontSize(12); doc.text("Suspicious SMS", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Contact", "Number", "When", "Message"]],
      body: SMS.map((s) => [s.contact, s.number, new Date(s.timestamp).toLocaleString(), s.body]),
      styles: { fontSize: 7 }, headStyles: { fillColor: [40, 60, 100] },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    doc.setFontSize(12); doc.text("Call Log", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Type", "Contact", "Number", "When", "Duration"]],
      body: CALLS.map((c) => [c.type, c.contact, c.number, new Date(c.timestamp).toLocaleString(), `${c.durationSec}s`]),
      styles: { fontSize: 7 }, headStyles: { fillColor: [40, 60, 100] },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    doc.addPage(); y = 20;
    doc.setFontSize(12); doc.text("GPS History", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Place", "Lat", "Lng", "When"]],
      body: GPS.map((g) => [g.place, g.lat, g.lng, new Date(g.timestamp).toLocaleString()]),
      styles: { fontSize: 7 }, headStyles: { fillColor: [40, 60, 100] },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    doc.setFontSize(12); doc.text("Browser History", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Title", "URL", "Visits"]],
      body: BROWSER.map((b) => [b.title, b.url, b.visits]),
      styles: { fontSize: 7 }, headStyles: { fillColor: [40, 60, 100] },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    doc.setFontSize(12); doc.text("Installed Applications", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["App", "Package", "Installed", "Flag"]],
      body: APPS.map((a) => [a.name, a.pkg, new Date(a.installedAt).toLocaleString(), a.suspicious ? "SUSPICIOUS" : "—"]),
      styles: { fontSize: 7 }, headStyles: { fillColor: [40, 60, 100] },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    doc.addPage(); y = 20;
    doc.setFontSize(12); doc.text("SHA-256 Evidence Integrity", 14, y); y += 4;
    autoTable(doc, {
      startY: y, head: [["Kind", "ID", "Label", "SHA-256"]],
      body: hashes.map((h) => [h.kind, h.id, h.label, h.hash]),
      styles: { fontSize: 6, font: "courier" }, headStyles: { fillColor: [40, 60, 100] },
    });

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(120);
      doc.text(`Forensic Intelligence System · ${CASE.caseNumber} · Page ${i}/${pages}`, 14, doc.internal.pageSize.getHeight() - 8);
    }

    doc.save(`${CASE.caseNumber}_forensic_report.pdf`);
    toast.success("Report downloaded", { id: "pdf" });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid-forensic rounded-lg border border-border p-6 bg-card/40 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary flex items-center gap-1.5">
            <FileText className="size-3" /> Deliverable
          </div>
          <h1 className="text-2xl font-semibold mt-1">Forensic Investigation Report</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            A single PDF containing case info, device acquisition details, recovered artifacts,
            AI-prioritized findings, the investigator summary, and SHA-256 integrity hashes for every record.
          </p>
        </div>
        <Button size="lg" onClick={download}><Download className="size-4 mr-1" />Download PDF</Button>
      </div>

      <Card className="p-5 bg-card/70">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Report contents</h2>
        <ul className="text-sm space-y-1.5 text-foreground/85">
          <li>Case: <span className="font-mono text-primary">{CASE.caseNumber}</span> — {CASE.title}</li>
          <li>{DEVICES.length} devices ({DEVICES.map((d) => d.acquisitionMethod).join(", ")})</li>
          <li>{SMS.length} SMS · {CALLS.length} calls · {GPS.length} GPS · {BROWSER.length} browser · {APPS.length} apps</li>
          <li>{findings.length} AI findings — <PriorityBadge priority="high" /> {stats.high} <PriorityBadge priority="medium" /> {stats.medium} <PriorityBadge priority="low" /> {stats.low}</li>
          <li>SHA-256 hash table for every artifact</li>
          <li>Investigator narrative summary</li>
        </ul>
      </Card>

      <Card className="p-5 bg-card/70">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">AI Summary Preview</h2>
        <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{summary}</div>
      </Card>
    </div>
  );
}
