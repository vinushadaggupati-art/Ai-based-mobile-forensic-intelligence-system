import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { analyzeWithOllama } from "@/lib/ai-analyzer";
import { PriorityBadge } from "@/components/PriorityBadge";
import {
  checkOllamaConnection,
  type OllamaStatus,
  type OllamaAnalysisResult,
  DEFAULT_MODEL,
} from "@/lib/ollama-client";
import {
  Sparkles,
  Play,
  Cpu,
  Lock,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Ollama AI Analysis · Forensic Intelligence System" },
      {
        name: "description",
        content:
          "Local LLM AI forensic analysis powered by Ollama and Autopsy 4.23.1 deleted evidence recovery.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <Analysis />
    </AppLayout>
  ),
});

function Analysis() {
  const [running, setRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState("Idle");
  const [progressVal, setProgressVal] = useState(0);
  const [result, setResult] = useState<OllamaAnalysisResult | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  useEffect(() => {
    checkOllamaConnection().then((st) => {
      setOllamaStatus(st);
      if (st.models.length > 0) {
        setSelectedModel(st.activeModel);
      }
    });
  }, []);

  const runAnalysis = async () => {
    setRunning(true);
    setProgressVal(15);
    setProgressStatus("Correlating Autopsy carved records with active telemetry…");

    try {
      const progressTimer = setInterval(() => {
        setProgressVal((prev) => (prev < 85 ? prev + 10 : prev));
      }, 400);

      const res = await analyzeWithOllama({
        model: selectedModel,
        onProgress: (msg) => {
          setProgressStatus(msg);
        },
      });

      clearInterval(progressTimer);
      setProgressVal(100);
      setProgressStatus("Analysis complete");
      setResult(res);

      if (res.source === "ollama") {
        toast.success(`Inference finished via Ollama [${res.modelUsed}] (${res.durationMs}ms)`);
      } else {
        toast.info("Completed via Offline Forensic Heuristic Engine");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Analysis failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Card */}
      <div className="grid-forensic rounded-lg border border-border p-6 bg-card/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Cpu className="size-3" /> Local LLM Forensic Intelligence
            </div>
            <h1 className="text-2xl font-semibold mt-1">Ollama AI Forensic Analysis</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Integrates physical deleted evidence recovered by{" "}
              <span className="text-primary font-mono">Autopsy 4.23.1</span> with local AI reasoning
              via <span className="text-primary font-mono">Ollama ({selectedModel})</span>. Detects
              evidence tampering, anti-forensics suites, and reconstructs clandestine asset
              movements.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Model Selector */}
            <div className="flex items-center gap-2 bg-card/80 border border-border px-3 py-1.5 rounded-md text-xs font-mono">
              <span className="text-muted-foreground">Model:</span>
              {ollamaStatus?.models && ollamaStatus.models.length > 0 ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={running}
                  className="bg-transparent text-foreground font-semibold focus:outline-none cursor-pointer"
                >
                  {ollamaStatus.models.map((m) => (
                    <option key={m} value={m} className="bg-card text-foreground">
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-foreground">{selectedModel}</span>
              )}
            </div>

            <Button onClick={runAnalysis} disabled={running} size="lg">
              <Play className="size-4 mr-1.5" />
              {running ? "Analyzing…" : result ? "Re-run Ollama Analysis" : "Run Ollama Analysis"}
            </Button>
          </div>
        </div>

        {/* Ollama Status Strip */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`size-2.5 rounded-full ${
                ollamaStatus?.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-foreground font-medium">
              {ollamaStatus?.connected
                ? `Ollama Server Connected (127.0.0.1:11434 · ${ollamaStatus.latencyMs}ms)`
                : "Ollama Server Standby (Offline Heuristics Active)"}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <FileSearch className="size-3.5 text-primary" />
            <span>Autopsy Ingest Data: 7 Carved Records Indexed</span>
          </div>
        </div>

        {running && (
          <div className="mt-5 space-y-2">
            <Progress value={progressVal} />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{progressStatus}</span>
              <span>{progressVal}%</span>
            </div>
          </div>
        )}
      </div>

      {!result && !running && (
        <Card className="p-10 text-center bg-card/50">
          <Sparkles className="size-10 mx-auto text-primary/70 mb-3" />
          <h3 className="text-base font-semibold">Ready for Neural Forensic Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
            Click <span className="text-foreground font-medium">Run Ollama Analysis</span> to ingest
            active mobile data, correlate 7 Autopsy carved deleted artifacts, and execute local AI
            inference via <span className="font-mono text-primary">{selectedModel}</span>.
          </p>
        </Card>
      )}

      {result && (
        <>
          {/* Engine Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card/70 border border-border text-xs">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <span>
                Generated by{" "}
                <strong className="font-mono text-foreground">{result.modelUsed}</strong> via{" "}
                <span className="text-primary font-medium">
                  {result.source === "ollama"
                    ? "Live Local Ollama Daemon"
                    : "Deterministic Forensic Engine"}
                </span>
              </span>
            </div>
            <div className="font-mono text-muted-foreground">Inference: {result.durationMs}ms</div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="High priority" value={result.stats.high} color="priority-high" />
            <StatCard label="Medium priority" value={result.stats.medium} color="priority-medium" />
            <StatCard label="Low priority" value={result.stats.low} color="priority-low" />
          </div>

          {/* Investigator Narrative Summary */}
          <Card className="p-5 bg-card/70 border-border">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Investigator Case Summary (Ollama LLM)
              </h2>
            </div>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {result.summary}
            </div>
          </Card>

          {/* Anti-Forensic & Timeline Correlation Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 bg-card/70 border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="size-4 text-red-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Anti-Forensics & Tampering Analysis
                </h3>
              </div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                {result.antiForensicAnalysis}
              </p>
            </Card>

            <Card className="p-5 bg-card/70 border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timeline Synthesis & Spatial Telemetry
                </h3>
              </div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                {result.timelineReconstruction}
              </p>
            </Card>
          </div>

          {/* Prioritized Findings */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Prioritized Findings ({result.findings.length})
            </h2>
            {result.findings.map((f) => (
              <Card key={f.id} className="p-4 bg-card/70 border-border">
                <div className="flex items-start gap-3">
                  <PriorityBadge priority={f.priority} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-semibold text-foreground/95">{f.title}</div>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{f.rationale}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {f.evidenceIds.map((id) => (
                        <span
                          key={id}
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                            id.startsWith("CARVED")
                              ? "bg-primary/15 border-primary/40 text-primary font-bold"
                              : "bg-background/60 border-border text-muted-foreground"
                          }`}
                        >
                          {id.startsWith("CARVED") ? `[AUTOPSY] ${id}` : id}
                        </span>
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
