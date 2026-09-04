// Seeded demo forensic case with realistic artifacts.
// SHA-256 hashes are computed at load time via SubtleCrypto.

export type Priority = "high" | "medium" | "low";

export interface DeviceInfo {
  id: string;
  model: string;
  os: "Android" | "iOS";
  osVersion: string;
  serial: string;
  imei: string;
  acquisitionMethod: "ADB" | "Cellebrite";
  acquiredAt: string;
  status: "acquired" | "acquiring" | "pending";
  storageUsed: string;
}

export interface CaseInfo {
  caseNumber: string;
  title: string;
  investigator: string;
  agency: string;
  openedAt: string;
  status: "active" | "closed";
  suspect: string;
}

export interface SmsRecord {
  id: string;
  direction: "in" | "out";
  contact: string;
  number: string;
  timestamp: string;
  body: string;
}
export interface CallRecord {
  id: string;
  type: "incoming" | "outgoing" | "missed";
  contact: string;
  number: string;
  timestamp: string;
  durationSec: number;
}
export interface ContactRecord {
  id: string;
  name: string;
  number: string;
  email?: string;
}
export interface GpsRecord {
  id: string;
  lat: number;
  lng: number;
  place: string;
  timestamp: string;
  accuracyM: number;
}
export interface BrowserRecord {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  visits: number;
}
export interface AppRecord {
  id: string;
  name: string;
  pkg: string;
  installedAt: string;
  permissions: string[];
  suspicious: boolean;
}
export interface MediaRecord {
  id: string;
  type: "photo" | "video" | "document";
  filename: string;
  sizeKB: number;
  createdAt: string;
  sha256?: string;
}

export const CASE: CaseInfo = {
  caseNumber: "FIS-2026-0417",
  title: "Operation Nightowl — Suspected Data Exfiltration",
  investigator: "Det. R. Nair, Cyber Cell",
  agency: "Regional Digital Forensics Unit",
  openedAt: "2026-07-24T09:12:00Z",
  status: "active",
  suspect: "Subject A (device owner)",
};

export const DEVICES: DeviceInfo[] = [
  {
    id: "dev-01",
    model: "Samsung Galaxy S23",
    os: "Android",
    osVersion: "14 (One UI 6.1)",
    serial: "R58N90ABCD1",
    imei: "356938035643809",
    acquisitionMethod: "ADB",
    acquiredAt: "2026-07-25T14:22:11Z",
    status: "acquired",
    storageUsed: "184.2 GB / 256 GB",
  },
  {
    id: "dev-02",
    model: "Apple iPhone 14 Pro",
    os: "iOS",
    osVersion: "17.5.1",
    serial: "F2LXQ7A3PN6M",
    imei: "353251106842197",
    acquisitionMethod: "Cellebrite",
    acquiredAt: "2026-07-26T10:03:47Z",
    status: "acquired",
    storageUsed: "97.8 GB / 128 GB",
  },
];

export const SMS: SmsRecord[] = [
  {
    id: "s1",
    direction: "in",
    contact: "Kai M.",
    number: "+1-415-555-0132",
    timestamp: "2026-07-23T22:14:00Z",
    body: "did you get the drop? use the encrypted channel next time",
  },
  {
    id: "s2",
    direction: "out",
    contact: "Kai M.",
    number: "+1-415-555-0132",
    timestamp: "2026-07-23T22:17:00Z",
    body: "yeah wallet address confirmed. burn the phone after",
  },
  {
    id: "s3",
    direction: "in",
    contact: "Mom",
    number: "+1-408-555-0199",
    timestamp: "2026-07-24T08:02:00Z",
    body: "don't forget lunch on sunday <3",
  },
  {
    id: "s4",
    direction: "out",
    contact: "Unknown",
    number: "+44-20-7946-0812",
    timestamp: "2026-07-24T02:41:00Z",
    body: "transfer 0.6 BTC to the cold wallet tonight",
  },
  {
    id: "s5",
    direction: "in",
    contact: "Bank Alert",
    number: "26426",
    timestamp: "2026-07-24T09:15:00Z",
    body: "Your OTP is 481932. Do not share.",
  },
  {
    id: "s6",
    direction: "in",
    contact: "Kai M.",
    number: "+1-415-555-0132",
    timestamp: "2026-07-25T01:04:00Z",
    body: "delete the logs and wipe the sd card",
  },
  {
    id: "s7",
    direction: "out",
    contact: "Alex",
    number: "+1-650-555-0177",
    timestamp: "2026-07-22T18:30:00Z",
    body: "grabbing coffee at 5, cool?",
  },
];

export const CALLS: CallRecord[] = [
  {
    id: "c1",
    type: "outgoing",
    contact: "Kai M.",
    number: "+1-415-555-0132",
    timestamp: "2026-07-23T22:20:00Z",
    durationSec: 412,
  },
  {
    id: "c2",
    type: "incoming",
    contact: "Unknown",
    number: "+44-20-7946-0812",
    timestamp: "2026-07-24T02:38:00Z",
    durationSec: 187,
  },
  {
    id: "c3",
    type: "missed",
    contact: "Unknown",
    number: "+7-495-555-0143",
    timestamp: "2026-07-24T03:11:00Z",
    durationSec: 0,
  },
  {
    id: "c4",
    type: "outgoing",
    contact: "Mom",
    number: "+1-408-555-0199",
    timestamp: "2026-07-24T19:04:00Z",
    durationSec: 621,
  },
  {
    id: "c5",
    type: "incoming",
    contact: "Kai M.",
    number: "+1-415-555-0132",
    timestamp: "2026-07-25T00:58:00Z",
    durationSec: 94,
  },
];

export const CONTACTS: ContactRecord[] = [
  { id: "k1", name: "Kai M.", number: "+1-415-555-0132", email: "kai.m@protonmail.com" },
  { id: "k2", name: "Mom", number: "+1-408-555-0199" },
  { id: "k3", name: "Alex", number: "+1-650-555-0177", email: "alex@example.com" },
  { id: "k4", name: "Work HR", number: "+1-212-555-0140" },
];

export const GPS: GpsRecord[] = [
  {
    id: "g1",
    lat: 37.7749,
    lng: -122.4194,
    place: "San Francisco — Financial District",
    timestamp: "2026-07-23T21:44:00Z",
    accuracyM: 8,
  },
  {
    id: "g2",
    lat: 37.7599,
    lng: -122.4148,
    place: "Mission District — 16th & Valencia",
    timestamp: "2026-07-23T22:12:00Z",
    accuracyM: 12,
  },
  {
    id: "g3",
    lat: 37.7286,
    lng: -122.4756,
    place: "Ocean Beach — Parking Lot 4",
    timestamp: "2026-07-24T02:35:00Z",
    accuracyM: 6,
  },
  {
    id: "g4",
    lat: 37.6213,
    lng: -122.379,
    place: "SFO Airport — Terminal 2",
    timestamp: "2026-07-24T04:18:00Z",
    accuracyM: 5,
  },
  {
    id: "g5",
    lat: 37.4419,
    lng: -122.143,
    place: "Palo Alto — Home Address",
    timestamp: "2026-07-24T18:02:00Z",
    accuracyM: 10,
  },
];

export const BROWSER: BrowserRecord[] = [
  {
    id: "b1",
    title: "How to wipe Android securely",
    url: "https://forums.xda-developers.com/wipe-guide",
    timestamp: "2026-07-24T23:11:00Z",
    visits: 4,
  },
  {
    id: "b2",
    title: "Bitcoin mixing services 2026",
    url: "https://darkforum.onion/mixers",
    timestamp: "2026-07-23T20:44:00Z",
    visits: 7,
  },
  {
    id: "b3",
    title: "SFGate — Weather",
    url: "https://sfgate.com/weather",
    timestamp: "2026-07-22T09:12:00Z",
    visits: 2,
  },
  {
    id: "b4",
    title: "ProtonMail login",
    url: "https://mail.proton.me/login",
    timestamp: "2026-07-24T02:02:00Z",
    visits: 12,
  },
  {
    id: "b5",
    title: "Signal — download",
    url: "https://signal.org/download",
    timestamp: "2026-07-21T15:22:00Z",
    visits: 1,
  },
];

export const APPS: AppRecord[] = [
  {
    id: "a1",
    name: "Signal",
    pkg: "org.thoughtcrime.securesms",
    installedAt: "2026-07-21T15:24:00Z",
    permissions: ["contacts", "sms", "camera", "mic"],
    suspicious: false,
  },
  {
    id: "a2",
    name: "Telegram",
    pkg: "org.telegram.messenger",
    installedAt: "2026-06-10T11:00:00Z",
    permissions: ["contacts", "storage", "mic"],
    suspicious: false,
  },
  {
    id: "a3",
    name: "Orbot (Tor)",
    pkg: "org.torproject.android",
    installedAt: "2026-07-22T02:14:00Z",
    permissions: ["network"],
    suspicious: true,
  },
  {
    id: "a4",
    name: "Wickr Me",
    pkg: "com.mywickr.wickr2",
    installedAt: "2026-07-22T02:20:00Z",
    permissions: ["contacts", "mic", "camera"],
    suspicious: true,
  },
  {
    id: "a5",
    name: "iShredder",
    pkg: "com.protectstar.ishredder",
    installedAt: "2026-07-24T22:50:00Z",
    permissions: ["storage"],
    suspicious: true,
  },
  {
    id: "a6",
    name: "Chrome",
    pkg: "com.android.chrome",
    installedAt: "2024-01-14T08:00:00Z",
    permissions: ["network", "location"],
    suspicious: false,
  },
];

export const MEDIA: MediaRecord[] = [
  {
    id: "m1",
    type: "photo",
    filename: "IMG_20260723_2201.jpg",
    sizeKB: 3421,
    createdAt: "2026-07-23T22:01:00Z",
  },
  {
    id: "m2",
    type: "photo",
    filename: "IMG_20260724_0233.jpg",
    sizeKB: 2988,
    createdAt: "2026-07-24T02:33:00Z",
  },
  {
    id: "m3",
    type: "video",
    filename: "VID_20260724_0240.mp4",
    sizeKB: 41220,
    createdAt: "2026-07-24T02:40:00Z",
  },
  {
    id: "m4",
    type: "document",
    filename: "wallet_backup.txt",
    sizeKB: 4,
    createdAt: "2026-07-23T21:12:00Z",
  },
  {
    id: "m5",
    type: "document",
    filename: "meeting_notes.pdf",
    sizeKB: 218,
    createdAt: "2026-07-22T14:00:00Z",
  },
];

// SHA-256 helper using SubtleCrypto (browser + edge).
export async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeEvidenceHashes() {
  const items: { id: string; kind: string; label: string; hash: string }[] = [];
  const push = async (id: string, kind: string, label: string, payload: string) => {
    items.push({ id, kind, label, hash: await sha256(payload) });
  };
  for (const r of SMS) await push(r.id, "SMS", `${r.contact} ${r.timestamp}`, JSON.stringify(r));
  for (const r of CALLS) await push(r.id, "Call", `${r.contact} ${r.timestamp}`, JSON.stringify(r));
  for (const r of GPS) await push(r.id, "GPS", `${r.place}`, JSON.stringify(r));
  for (const r of BROWSER) await push(r.id, "Browser", r.title, JSON.stringify(r));
  for (const r of APPS) await push(r.id, "App", r.name, JSON.stringify(r));
  for (const r of MEDIA) await push(r.id, "Media", r.filename, JSON.stringify(r));
  return items;
}
