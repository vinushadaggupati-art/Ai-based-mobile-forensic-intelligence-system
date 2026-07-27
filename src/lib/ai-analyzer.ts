// Deterministic forensic analyzer that mimics an LLM assistant.
// It inspects the collected artifacts and produces prioritized findings,
// pattern insights, and an investigator summary. Swap this module for a
// real Lovable AI / Ollama call without changing any UI.

import {
  SMS, CALLS, BROWSER, APPS, GPS, type Priority,
} from "./forensic-data";

export interface Finding {
  id: string;
  priority: Priority;
  category: "Communication" | "Location" | "Application" | "Browser" | "Pattern";
  title: string;
  evidenceIds: string[];
  rationale: string;
}

const SUSPICIOUS_KEYWORDS = [
  "burn", "wipe", "delete the logs", "cold wallet", "btc", "bitcoin",
  "encrypted channel", "drop", "mixer", "sd card",
];

export function analyze(): { findings: Finding[]; summary: string; stats: { high: number; medium: number; low: number } } {
  const findings: Finding[] = [];

  // 1. Suspicious SMS keywords
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

  // 2. Late-night communication cluster
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

  // 3. Foreign / unknown numbers
  const foreign = [...SMS, ...CALLS].filter((r) =>
    /^(\+44|\+7|\+86|\+971)/.test(("number" in r ? r.number : "")),
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

  // 4. Suspicious apps
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

  // 5. Browser
  const susBrowser = BROWSER.filter((b) =>
    /wipe|mixer|onion|tor|bitcoin/i.test(b.title + b.url),
  );
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

  // 6. Location anomaly
  const anomalyLocs = GPS.filter((g) =>
    /Ocean Beach|SFO Airport/.test(g.place),
  );
  if (anomalyLocs.length) {
    findings.push({
      id: "f-gps",
      priority: "medium",
      category: "Location",
      title: `Off-pattern GPS locations at 02:35 and 04:18 UTC`,
      evidenceIds: anomalyLocs.map((g) => g.id),
      rationale:
        "Device travelled from Mission District to a remote beach parking lot and then to SFO Airport within two hours — coinciding with the outgoing 'transfer 0.6 BTC' message.",
    });
  }

  // 7. Low-priority routine record
  findings.push({
    id: "f-routine",
    priority: "low",
    category: "Communication",
    title: "Routine benign traffic (family, banking OTP)",
    evidenceIds: ["s3", "s5", "s7", "c4"],
    rationale:
      "Contact with 'Mom' and standard bank OTP appear consistent with normal device usage and are unlikely to be relevant to the investigation.",
  });

  const stats = {
    high: findings.filter((f) => f.priority === "high").length,
    medium: findings.filter((f) => f.priority === "medium").length,
    low: findings.filter((f) => f.priority === "low").length,
  };

  const summary = [
    `Case FIS-2026-0417 shows a coherent pattern of pre-meditated evidence destruction and suspected cryptocurrency-based value transfer between 2026-07-23 21:00 UTC and 2026-07-25 01:00 UTC.`,
    `The device owner communicated with contact "Kai M." and at least one UK-based unknown number using language consistent with illicit transfers ("cold wallet", "burn the phone", "delete the logs").`,
    `Within the same 72-hour window, Orbot, Wickr Me, and iShredder were installed, and browser history contains searches for Android wiping procedures and Tor-based bitcoin mixers.`,
    `GPS telemetry places the device at Ocean Beach at 02:35 UTC and SFO Airport at 04:18 UTC, matching the outgoing SMS about a 0.6 BTC transfer.`,
    `Recommended next steps: preserve all flagged artifacts for chain of custody, subpoena the +44 and +7 numbers, and correlate wallet addresses against public blockchain records.`,
  ].join("\n\n");

  // Deterministic sort: high -> medium -> low
  const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.priority] - order[b.priority]);

  return { findings, summary, stats };
}
