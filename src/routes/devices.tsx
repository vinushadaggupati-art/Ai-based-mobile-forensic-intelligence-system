import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEVICES } from "@/lib/forensic-data";
import { CheckCircle2, Smartphone, Usb, HardDrive } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Devices · Forensic Intelligence System" },
      { name: "description", content: "Android (ADB) and iOS (Cellebrite) forensic acquisition status for the active case." },
      { property: "og:title", content: "Forensic Device Acquisition" },
      { property: "og:description", content: "Track Android ADB and iOS Cellebrite acquisitions per device." },
    ],
  }),
  component: () => (<AppLayout><Devices /></AppLayout>),
});

function Devices() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold">Device Acquisition</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Android devices are acquired via <span className="font-mono text-primary">ADB</span> over USB debugging.
          iOS devices are imported from <span className="font-mono text-primary">Cellebrite (Academic)</span> extraction packages.
          Acquisition is fully separated from AI analysis, per forensic best practice.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DEVICES.map((d) => (
          <Card key={d.id} className="p-5 bg-card/70">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-primary/15 border border-primary/30 grid place-items-center">
                  <Smartphone className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{d.model}</div>
                  <div className="text-xs text-muted-foreground">{d.os} {d.osVersion}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-priority-low">
                <CheckCircle2 className="size-3.5" /> {d.status}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <Row label="Serial" v={d.serial} />
              <Row label="IMEI" v={d.imei} />
              <Row label="Method" v={d.acquisitionMethod} />
              <Row label="Acquired" v={new Date(d.acquiredAt).toLocaleString()} />
              <Row label="Storage" v={d.storageUsed} />
              <Row label="Integrity" v="SHA-256 verified" />
            </dl>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast.success(`Re-imaging queued for ${d.model}`)}>
                <Usb className="size-3.5 mr-1" /> Re-acquire
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.info("Full image export prepared")}>
                <HardDrive className="size-3.5 mr-1" /> Export image
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 bg-card/70">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Acquisition workflow</h2>
        <ol className="text-sm space-y-2 text-foreground/80 list-decimal list-inside">
          <li>Isolate the device (airplane mode / Faraday bag) and document chain of custody.</li>
          <li>For Android: enable USB debugging, connect via ADB, and run the logical/backup acquisition script.</li>
          <li>For iOS: perform Cellebrite Advanced Logical extraction and import the resulting UFDR package.</li>
          <li>SHA-256 hashes are computed and stored per artifact for integrity verification.</li>
          <li>Optionally load the image into <span className="font-mono text-primary">Autopsy</span> for deep forensic examination.</li>
          <li>Only then run the AI analysis module — it operates on already-preserved evidence.</li>
        </ol>
      </Card>
    </div>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-widest">{label}</div>
      <div className="text-foreground/90 break-all">{v}</div>
    </div>
  );
}
