import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { analyze } from "@/lib/ai-analyzer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Sparkles, Play, Cpu, Lock } from "lucide-react";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "AI Analysis · Forensic Intelligence System" },
      { name: "description", content: "AI-prioritized findings, suspicious patterns, and investigator summary generated from collected forensic evidence." },
      { property: "og:title", content: "AI Forensic Analysis" },
      { property: "og:description", content: "LLM-driven prioritization of suspicious mobile forensic evidence." },
    ],
  }),
  component: () => (<AppLayout><Analysis /></AppLayout>),
});

function Analysis() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof analyze> | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    for (let i = 1; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 40));
      setProgress(i);
    }
    setResult(analyze());
    setRunning(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid-forensic rounded-lg border border-border p-6 bg-card/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Cpu className="size-3" /> LLM Assistant
            </div>
            <h1 className="text-2xl font-semibold mt-1">AI Forensic Analysis</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              The AI reviews collected evidence — it never performs acquisition. It summarises large datasets,
              detects suspicious communication patterns, flags anti-forensic apps, and assigns priority levels
              with a rationale for each finding.
            </p>
          </div>
          <Button onClick={run} disabled={running} size="lg">
            <Play className="size-4 mr-1" />{running ? "Analyzing…" : result ? "Re-run analysis" : "Run analysis"}
          </Button>
        </div>
        {running && (
          <div className="mt-5">
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground mt-2 font-mono">Processing artifacts · {progress}%</div>
          </div>
        )}
      </div>

      {!result && !running && (
        <Card className="p-10 text-center bg-card/50">
          <Sparkles className="size-8 mx-auto text-primary/70" />
          <h3 className="mt-3 font-medium">Ready to analyze</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click <span className="text-foreground">Run analysis</span> to inspect 25+ artifacts across 6 categories.
          </p>
        </Card>
      )}

      {result && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="High priority" value={result.stats.high} color="priority-high" />
            <StatCard label="Medium priority" value={result.stats.medium} color="priority-medium" />
            <StatCard label="Low priority" value={result.stats.low} color="priority-low" />
          </div>

          <Card className="p-5 bg-card/70">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Investigator Summary</h2>
            </div>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{result.summary}</div>
          </Card>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Findings ({result.findings.length})</h2>
            {result.findings.map((f) => (
              <Card key={f.id} className="p-4 bg-card/70">
                <div className="flex items-start gap-3">
                  <PriorityBadge priority={f.priority} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-medium">{f.title}</div>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">{f.category}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-2">{f.rationale}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.evidenceIds.map((id) => (
                        <span key={id} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border text-muted-foreground">{id}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="p-5 bg-card/70">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-4xl font-mono font-semibold mt-1 text-${color}`}>{value}</div>
    </Card>
  );
}
