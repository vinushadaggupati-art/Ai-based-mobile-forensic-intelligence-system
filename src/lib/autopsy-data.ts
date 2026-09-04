// Autopsy Mobile Forensics Integration Layer
// Tracks deleted evidence recovered via Autopsy 4.23.1 and The Sleuth Kit (TSK)

export type RecoveryMethod =
  | "SQLite Freelist Carving"
  | "TSK Unallocated Carving"
  | "WAL Journal Recovery"
  | "EXIF / Thumbnail Extraction";

export type CarvedStatus = "recovered_intact" | "recovered_partial";
export type SignificanceLevel = "critical" | "high" | "medium" | "low";

export interface AutopsyCarvedArtifact {
  id: string;
  evidenceType: "SMS" | "CALL" | "BROWSER" | "IMAGE" | "DOCUMENT" | "CHAT";
  title: string;
  sourceFile: string;
  recoveryMethod: RecoveryMethod;
  status: CarvedStatus;
  confidence: number; // percentage 0 - 100
  blockOffset: string;
  inode: string;
  hexSignature: string;
  timestamp: string;
  significance: SignificanceLevel;
  content: Record<string, unknown>;
  forensicNotes: string;
  sha256?: string;
}

export interface AutopsyIngestJob {
  id: string;
  caseName: string;
  autopsyVersion: string;
  imagePath: string;
  imageType: "Raw / DD" | "Physical E01" | "ADB Logical Backup" | "UFDR";
  targetDevice: string;
  ingestModules: string[];
  status: "completed" | "in_progress" | "idle";
  startedAt: string;
  completedAt: string;
  totalCarvedItems: number;
  unallocatedSpaceProcessedMB: number;
}

export const AUTOPSY_JOB: AutopsyIngestJob = {
  id: "AUTOPSY-JOB-2026-088",
  caseName: "FIS-2026-0417_Nightowl",
  autopsyVersion: "4.23.1 (TSK 4.12.1)",
  imagePath: "D:\\Forensics\\Cases\\FIS-2026-0417\\userdata_phys.raw",
  imageType: "Raw / DD",
  targetDevice: "Samsung Galaxy S23 (dev-01)",
  ingestModules: [
    "Android Analyzer (aLeapp)",
    "PhotoRec / TSK File Carving",
    "SQLite Unallocated Freelist Parser",
    "Exif / Metadata Parser",
    "Keyword Search & Hash Lookup",
  ],
  status: "completed",
  startedAt: "2026-07-25T15:00:00Z",
  completedAt: "2026-07-25T16:24:18Z",
  totalCarvedItems: 7,
  unallocatedSpaceProcessedMB: 68420,
};

// Realistic mobile forensic evidence carved using Autopsy
export const AUTOPSY_CARVED_EVIDENCE: AutopsyCarvedArtifact[] = [
  {
    id: "CARVED-SMS-01",
    evidenceType: "SMS",
    title: "Deleted Outgoing SMS: 'burn the phone after'",
    sourceFile: "/data/data/com.android.providers.telephony/databases/mmssms.db",
    recoveryMethod: "SQLite Freelist Carving",
    status: "recovered_intact",
    confidence: 98,
    blockOffset: "Sector 918230, Cell Offset 0x14A0",
    inode: "Inode #10482 (freelist page 48)",
    hexSignature: "53 51 4C 69 74 65 20 66 6F 72 6D 61 74",
    timestamp: "2026-07-23T22:17:00Z",
    significance: "critical",
    content: {
      direction: "outgoing",
      contact: "Kai M.",
      number: "+1-415-555-0132",
      body: "yeah wallet address confirmed. burn the phone after",
      deletedFlag: true,
      originalRowId: 142,
    },
    forensicNotes:
      "Recovered from mmssms.db freelist. Record marked for deletion; cell payload remained un-overwritten. Explicit intent to destroy device evidence.",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "CARVED-SMS-02",
    evidenceType: "SMS",
    title: "Deleted Incoming SMS: 'delete the logs and wipe the sd card'",
    sourceFile: "/data/data/com.android.providers.telephony/databases/mmssms.db",
    recoveryMethod: "SQLite Freelist Carving",
    status: "recovered_intact",
    confidence: 99,
    blockOffset: "Sector 918234, Cell Offset 0x08F0",
    inode: "Inode #10482 (freelist page 49)",
    hexSignature: "53 51 4C 69 74 65 20 66 6F 72 6D 61 74",
    timestamp: "2026-07-25T01:04:00Z",
    significance: "critical",
    content: {
      direction: "incoming",
      contact: "Kai M.",
      number: "+1-415-555-0132",
      body: "delete the logs and wipe the sd card before crossing border",
      deletedFlag: true,
      originalRowId: 149,
    },
    forensicNotes:
      "Instructs device owner to perform anti-forensic wiping. Correlates within 1 hour of iShredder installation timestamp.",
    sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  },
  {
    id: "CARVED-CHAT-01",
    evidenceType: "CHAT",
    title: "Carved WhatsApp Message: BTC transfer details",
    sourceFile: "/data/data/com.whatsapp/databases/msgstore.db-wal",
    recoveryMethod: "WAL Journal Recovery",
    status: "recovered_intact",
    confidence: 95,
    blockOffset: "Sector 1104892, WAL Frame #82",
    inode: "Inode #18932 (msgstore.db-wal)",
    hexSignature: "37 7F 06 82 00 00 00 00",
    timestamp: "2026-07-24T02:29:00Z",
    significance: "critical",
    content: {
      app: "WhatsApp",
      sender: "Kai M.",
      recipient: "Subject A",
      text: "Transferring 1.2 BTC to cold storage 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. Meet at Ocean Beach lot 4.",
      deletedFromUI: true,
    },
    forensicNotes:
      "Recovered from Write-Ahead Log (WAL) frame before checkpoint flush. Message was deleted in the client app UI but preserved in the WAL structure.",
    sha256: "7d83b4ac6b08609a61ec16d53da58a6029104b0ce0eb33404ccbd3805ab07799",
  },
  {
    id: "CARVED-IMG-01",
    evidenceType: "IMAGE",
    title: "Carved Deleted Photo: Ocean Beach Rendezvous",
    sourceFile: "Unallocated Clusters 409820 - 409848",
    recoveryMethod: "TSK Unallocated Carving",
    status: "recovered_intact",
    confidence: 92,
    blockOffset: "Cluster 409820, Sector 3278560",
    inode: "Inode #0 (Unallocated Space Carve)",
    hexSignature: "FF D8 FF E0 00 10 4A 46 49 46",
    timestamp: "2026-07-24T02:33:00Z",
    significance: "high",
    content: {
      filename: "carved_IMG_0233_rendezvous.jpg",
      sizeKB: 3120,
      exifCamera: "Samsung Galaxy S23 (SM-S911B)",
      gpsLat: 37.7286,
      gpsLng: -122.4756,
      gpsPlace: "Ocean Beach — Parking Lot 4",
    },
    forensicNotes:
      "Deleted photo carved by PhotoRec/TSK ingest module. EXIF header intact containing camera serial and GPS coordinate matching movement log.",
    sha256: "1f8ac10f23c5b5bc1167bda84b833e5c057a77d2ec394438695e133454ea34ea",
  },
  {
    id: "CARVED-IMG-02",
    evidenceType: "IMAGE",
    title: "Carved Deleted Photo: SFO Flight Boarding Pass",
    sourceFile: "Unallocated Clusters 412001 - 412020",
    recoveryMethod: "TSK Unallocated Carving",
    status: "recovered_intact",
    confidence: 90,
    blockOffset: "Cluster 412001, Sector 3296008",
    inode: "Inode #0 (Unallocated Space Carve)",
    hexSignature: "FF D8 FF E1 08 2A 45 78 69 66",
    timestamp: "2026-07-24T04:15:00Z",
    significance: "high",
    content: {
      filename: "carved_IMG_0415_boardingpass.jpg",
      sizeKB: 2450,
      exifCamera: "Samsung Galaxy S23",
      gpsLat: 37.6213,
      gpsLng: -122.379,
      gpsPlace: "SFO Airport Terminal 2",
      visualText: "Flight UA863 to London Heathrow (LHR) - Dep 06:10",
    },
    forensicNotes:
      "Carved JPEG image showing international departure pass purchased under alias. Direct evidence of flight risk and exit strategy.",
    sha256: "c2543fff3bfa6f144c383d45ceee42f31135a36137d1022e02a7b444b8309311",
  },
  {
    id: "CARVED-BROWSER-01",
    evidenceType: "BROWSER",
    title: "Deleted History: Darknet Coin Mixing Service",
    sourceFile: "/data/data/com.android.chrome/app_chrome/Default/History",
    recoveryMethod: "SQLite Freelist Carving",
    status: "recovered_intact",
    confidence: 96,
    blockOffset: "Sector 891024, Page 12",
    inode: "Inode #14592 (History freelist)",
    hexSignature: "53 51 4C 69 74 65 20 66 6F 72 6D 61 74",
    timestamp: "2026-07-23T20:44:00Z",
    significance: "high",
    content: {
      url: "https://darkforum.onion/crypto-cashout-cleaner",
      title: "Zero-Trace Bitcoin Mixer & Off-Ramping 2026",
      visitCount: 7,
      deletedAt: "2026-07-24T23:10:00Z",
    },
    forensicNotes:
      "Subject deleted browsing history prior to device seizure. SQLite freelist parsing recovered the URL and page title without corruption.",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
  },
  {
    id: "CARVED-DOC-01",
    evidenceType: "DOCUMENT",
    title: "Carved Text File: Cold Wallet Seed Fragment",
    sourceFile: "Unallocated Cluster 401192",
    recoveryMethod: "TSK Unallocated Carving",
    status: "recovered_partial",
    confidence: 85,
    blockOffset: "Cluster 401192, Sector 3209536",
    inode: "Inode #0 (Carved ASCII Block)",
    hexSignature: "73 65 65 64 20 3D 20 7B 22 77 6F 72 64",
    timestamp: "2026-07-23T21:12:00Z",
    significance: "critical",
    content: {
      filename: "carved_wallet_seed.txt",
      sizeKB: 2,
      snippet: 'seed = ["abandon", "falcon", "orbit", "silver", ... 12 words total] - ColdCard Mk4',
    },
    forensicNotes:
      "Carved from deleted text buffer in unallocated NAND block. Corresponds with suspicious crypto transfer discussions.",
    sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
  },
];

export async function computeAutopsyEvidenceHashes() {
  const items: { id: string; kind: string; label: string; hash: string }[] = [];
  for (const item of AUTOPSY_CARVED_EVIDENCE) {
    items.push({
      id: item.id,
      kind: `Autopsy (${item.recoveryMethod})`,
      label: item.title,
      hash: item.sha256 || "computed-hash-placeholder",
    });
  }
  return items;
}

export function getAutopsyRecoverySummary() {
  const total = AUTOPSY_CARVED_EVIDENCE.length;
  const critical = AUTOPSY_CARVED_EVIDENCE.filter((e) => e.significance === "critical").length;
  const high = AUTOPSY_CARVED_EVIDENCE.filter((e) => e.significance === "high").length;
  const medium = AUTOPSY_CARVED_EVIDENCE.filter((e) => e.significance === "medium").length;
  const avgConfidence = Math.round(
    AUTOPSY_CARVED_EVIDENCE.reduce((acc, curr) => acc + curr.confidence, 0) / (total || 1),
  );

  const byMethod: Record<string, number> = {};
  for (const item of AUTOPSY_CARVED_EVIDENCE) {
    byMethod[item.recoveryMethod] = (byMethod[item.recoveryMethod] || 0) + 1;
  }

  return {
    total,
    critical,
    high,
    medium,
    avgConfidence,
    byMethod,
    job: AUTOPSY_JOB,
  };
}
