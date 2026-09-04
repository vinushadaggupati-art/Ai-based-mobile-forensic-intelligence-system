// Forensic Intelligence AI Analyzer
// Integrates Autopsy 4.23.1 carved deleted evidence with Ollama local LLM inference

import { SMS, CALLS, BROWSER, APPS, GPS, CASE, DEVICES, type Priority } from "./forensic-data";
import { AUTOPSY_CARVED_EVIDENCE } from "./autopsy-data";
import {
  runForensicLLMAnalysis,
  type OllamaAnalysisResult,
  type OllamaFinding,
  DEFAULT_MODEL,
  DEFAULT_OLLAMA_ENDPOINT,
} from "./ollama-client";

export interface Finding {
  id: string;
  priority: Priority;
  category: "Communication" | "Location" | "Application" | "Browser" | "Pattern" | "Anti-Forensics";
  title: string;
  evidenceIds: string[];
  rationale: string;
}

const SUSPICIOUS_KEYWORDS = [
  "burn",
  "wipe",
  "delete the logs",
  "cold wallet",
  "btc",
  "bitcoin",
  "encrypted channel",
  "drop",
  "mixer",
  "sd card",
];

export async function analyzeWithOllama(options?: {
  endpoint?: string;
  model?: string;
  onProgress?: (msg: string) => void;
}): Promise<OllamaAnalysisResult> {
  return runForensicLLMAnalysis(
    {
      caseInfo: CASE,
      devices: DEVICES,
      sms: SMS,
      calls: CALLS,
      gps: GPS,
      browser: BROWSER,
      apps: APPS,
      autopsyCarved: AUTOPSY_CARVED_EVIDENCE,
    },
    {
      endpoint: options?.endpoint || DEFAULT_OLLAMA_ENDPOINT,
      model: options?.model || DEFAULT_MODEL,
      onProgress: options?.onProgress,
    },
  );
}

export function analyze(): {
  findings: Finding[];
  summary: string;
  stats: { high: number; medium: number; low: number };
  autopsyCarvedCount: number;
} {
  const findings: Finding[] = [];

  // 1. Autopsy Carved Evidence Recovery Findings
  const carvedCount = AUTOPSY_CARVED_EVIDENCE.length;
  if (carvedCount > 0) {
    findings.push({
      id: "f-autopsy-carved",
      priority: "high",
      category: "Anti-Forensics",
      title: `${carvedCount} deleted artifacts recovered by Autopsy 4.23.1 & The Sleuth Kit`,
      evidenceIds: AUTOPSY_CARVED_EVIDENCE.map((e) => e.id),
      rationale:
        "Autopsy carved deleted records from SQLite freelists (mmssms.db), WAL journals (msgstore.db-wal), and unallocated NAND blocks. Recovered messages ('burn the phone after', 'delete the logs') prove intentional evidence destruction.",
    });
  }

  // 2. Suspicious SMS keywords (including carved messages)
  const flaggedSms = SMS.filter((m) =>
    SUSPICIOUS_KEYWORDS.some((k) => m.body.toLowerCase().includes(k)),
  );
  if (flaggedSms.length) {
    findings.push({
      id: "f-sms-keywords",
      priority: "high",
      category: "Communication",
      title: `${flaggedSms.length} SMS messages contain high-risk keywords`,
      evidenceIds: flaggedSms.map((m) => m.id),
      rationale:
        "Messages reference wallet transfers, log deletion, device wiping, and encrypted channels — language patterns commonly seen in evidence-destruction and illicit-transfer scenarios.",
    });
  }

  // 3. Late-night communication cluster
  const nightCalls = CALLS.filter((c) => {
    const h = new Date(c.timestamp).getUTCHours();
    return h < 5 || h >= 22;
  });
  if (nightCalls.length >= 2) {
    findings.push({
      id: "f-night-calls",
      priority: "medium",
      category: "Pattern",
      title: `${nightCalls.length} calls placed between 22:00 – 05:00 UTC`,
      evidenceIds: nightCalls.map((c) => c.id),
      rationale:
        "Cluster of late-night calls correlates with GPS movement to unusual locations and outgoing SMS about transfers — an atypical communication pattern for the device owner.",
    });
  }

  // 4. Foreign / unknown numbers
  const foreign = [...SMS, ...CALLS].filter((r) =>
    /^(\+44|\+7|\+86|\+971)/.test("number" in r ? r.number : ""),
  );
  if (foreign.length) {
    findings.push({
      id: "f-foreign",
      priority: "medium",
      category: "Communication",
      title: `Contact with ${foreign.length} international unknown numbers`,
      evidenceIds: foreign.map((r) => r.id),
      rationale:
        "Communication with UK and Russian numbers not present in the contacts list, matching the timeline of suspicious SMS activity.",
    });
  }

  // 5. Anti-forensic Apps
  const susApps = APPS.filter((a) => a.suspicious);
  if (susApps.length) {
    findings.push({
      id: "f-apps",
      priority: "high",
      category: "Application",
      title: `${susApps.length} anti-forensic / privacy apps installed within 72h`,
      evidenceIds: susApps.map((a) => a.id),
      rationale:
        "Orbot (Tor), Wickr Me, and iShredder were installed in the same window as the suspicious SMS activity. iShredder is a secure-deletion tool consistent with evidence destruction attempts.",
    });
  }

  // 6. Browser History & Carved Darknet Search
  const susBrowser = BROWSER.filter((b) => /wipe|mixer|onion|tor|bitcoin/i.test(b.title + b.url));
  if (susBrowser.length) {
    findings.push({
      id: "f-browser",
      priority: "high",
      category: "Browser",
      title: `${susBrowser.length} browser visits to anti-forensic or crypto-laundering topics`,
      evidenceIds: susBrowser.map((b) => b.id),
      rationale:
        "History includes searches for Android wiping guides and bitcoin mixing services on an .onion domain — direct indicators of intent to destroy evidence and launder funds.",
    });
  }

  // 7. Location Anomaly & Exit Strategy (Beach + Airport)
  const anomalyLocs = GPS.filter((g) => /Ocean Beach|SFO Airport/.test(g.place));
  if (anomalyLocs.length) {
    findings.push({
      id: "f-gps",
      priority: "high",
      category: "Location",
      title: `Off-pattern GPS locations at 02:35 and 04:18 UTC (Beach + SFO Airport)`,
      evidenceIds: [...anomalyLocs.map((g) => g.id), "CARVED-IMG-01", "CARVED-IMG-02"],
      rationale:
        "Device travelled from Mission District to Ocean Beach Lot 4 at 02:35 UTC (matching carved 1.2 BTC rendezvous photo) and then to SFO Airport Terminal 2 at 04:18 UTC (matching carved boarding pass to London Heathrow).",
    });
  }

  // 8. Low-priority routine record
  findings.push({
    id: "f-routine",
    priority: "low",
    category: "Communication",
    title: "Routine benign traffic (family, banking OTP)",
    evidenceIds: ["s3", "s5", "s7", "c4"],
    rationale:
      "Contact with 'Mom' and standard bank OTP appear consistent with normal device usage and establish the baseline activity of the owner.",
  });

  const stats = {
    high: findings.filter((f) => f.priority === "high").length,
    medium: findings.filter((f) => f.priority === "medium").length,
    low: findings.filter((f) => f.priority === "low").length,
  };

  const summary = [
    `FORENSIC CASE SUMMARY — ${CASE.caseNumber} (${CASE.title}):`,
    `Mobile device forensic intelligence correlates active artifacts with ${carvedCount} deleted items recovered via Autopsy 4.23.1 and The Sleuth Kit (TSK).`,
    `1. DELETED EVIDENCE RECOVERY: Autopsy SQLite Freelist carving and WAL journal reconstruction successfully recovered critical deleted communications between the device owner and contact "Kai M." explicit in their instructions ("yeah wallet address confirmed. burn the phone after", "delete the logs and wipe the sd card").`,
    `2. CRYPTOCURRENCY & EXFILTRATION: A carved WhatsApp record reveals a 1.2 BTC transfer to cold wallet storage. Telemetry confirms subject's arrival at Ocean Beach Lot 4 at 02:35 UTC, supported by a carved photo with intact EXIF GPS tags.`,
    `3. ANTI-FORENSICS ATTEMPT: The installation of iShredder, Wickr Me, and Tor within 72 hours of seizure, combined with Chrome searches for Android wiping guides, demonstrates deliberate preparation to destroy digital evidence.`,
    `4. FLIGHT RISK & ESCAPE: Autopsy carved an unallocated JPEG of a London Heathrow boarding pass at SFO Airport Terminal 2 at 04:15 UTC.`,
    `RECOMMENDATION: Preserve all carved SQLite unallocated blocks and SHA-256 evidence digests for chain-of-custody submission under ISO/IEC 27037 and NIST SP 800-101.`,
  ].join("\n\n");

  const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.priority] - order[b.priority]);

  return { findings, summary, stats, autopsyCarvedCount: carvedCount };
}
