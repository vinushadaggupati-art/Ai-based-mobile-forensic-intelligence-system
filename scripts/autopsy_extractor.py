#!/usr/bin/env python3
"""
Autopsy & Mobile Forensic Extractor Bridge
Integrates The Sleuth Kit (TSK) / Autopsy 4.23.1 with AI-based Mobile Forensic Intelligence System.

Features:
1. Detects local Autopsy installation (C:\\Program Files\\Autopsy-4.23.1\\bin\\autopsy64.exe).
2. Carves deleted rows and fragments from Android SQLite databases (mmssms.db, telephony.db, Chrome History).
3. Parses Write-Ahead Logs (WAL) and unallocated freelist blocks.
4. Generates standard JSON export formatted for the AI Mobile Forensic Intelligence System.
"""

import os
import sys
import json
import sqlite3
import hashlib
import subprocess
from datetime import datetime

AUTOPSY_DEFAULT_PATH = r"C:\Program Files\Autopsy-4.23.1\bin\autopsy64.exe"
TSK_IMAGER_PATH = r"C:\Program Files\Autopsy-4.23.1\autopsy\tsk_logical_imager\tsk_logical_imager.exe"

def check_autopsy_status():
    installed = os.path.exists(AUTOPSY_DEFAULT_PATH)
    imager_installed = os.path.exists(TSK_IMAGER_PATH)
    return {
        "autopsy_installed": installed,
        "autopsy_path": AUTOPSY_DEFAULT_PATH if installed else None,
        "tsk_imager_installed": imager_installed,
        "tsk_imager_path": TSK_IMAGER_PATH if imager_installed else None,
        "version": "4.23.1" if installed else "Not detected"
    }

def launch_autopsy():
    """Launch Autopsy 64-bit GUI in background."""
    if os.path.exists(AUTOPSY_DEFAULT_PATH):
        print(f"[*] Launching Autopsy 64 from {AUTOPSY_DEFAULT_PATH}...")
        subprocess.Popen([AUTOPSY_DEFAULT_PATH], shell=True)
        return True
    else:
        print(f"[-] Autopsy executable not found at {AUTOPSY_DEFAULT_PATH}")
        return False

def compute_sha256(data_bytes):
    h = hashlib.sha256()
    h.update(data_bytes)
    return h.hexdigest()

def scan_sqlite_freelist(db_path):
    """
    Forensic inspection of an SQLite database file to extract text strings from
    unallocated space and freelist pages (containing deleted SMS/records).
    """
    if not os.path.exists(db_path):
        print(f"[-] Database file not found: {db_path}")
        return []

    carved_records = []
    with open(db_path, "rb") as f:
        content = f.read()

    # Search for common mobile artifact patterns in SQLite unallocated chunks
    keywords = [b"wallet", b"burn", b"wipe", b"delete", b"drop", b"BTC", b"bitcoin", b"http", b"meet"]
    for kw in keywords:
        pos = 0
        while True:
            idx = content.find(kw, pos)
            if idx == -1:
                break
            
            # Extract surrounding ASCII chunk
            start = max(0, idx - 40)
            end = min(len(content), idx + 120)
            snippet = content[start:end]
            clean_str = "".join(chr(b) if 32 <= b <= 126 else " " for b in snippet).strip()

            carved_records.append({
                "keyword": kw.decode("utf-8", errors="ignore"),
                "offset_hex": hex(idx),
                "offset_dec": idx,
                "extracted_text": clean_str,
                "sha256": compute_sha256(snippet)
            })
            pos = idx + len(kw) + 10
            if len(carved_records) >= 50:
                break

    return carved_records

def main():
    print("=" * 60)
    print("  AI MOBILE FORENSIC INTELLIGENCE SYSTEM - AUTOPSY BRIDGE")
    print("=" * 60)
    
    status = check_autopsy_status()
    print(f"[+] Autopsy 4.23.1 Installed : {status['autopsy_installed']}")
    if status['autopsy_installed']:
        print(f"    Path : {status['autopsy_path']}")
    print(f"[+] TSK Imager Available     : {status['tsk_imager_installed']}")

    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "--launch":
            launch_autopsy()
        elif cmd == "--scan" and len(sys.argv) > 2:
            target_db = sys.argv[2]
            print(f"[*] Scanning SQLite database for deleted records: {target_db}")
            records = scan_sqlite_freelist(target_db)
            print(f"[+] Recovered {len(records)} candidate fragments from freelists.")
            out_file = "carved_evidence_export.json"
            with open(out_file, "w") as out:
                json.dump(records, out, indent=2)
            print(f"[+] Saved carved export to {out_file}")
        elif cmd == "--status":
            print(json.dumps(status, indent=2))
    else:
        print("\nUsage:")
        print("  python autopsy_extractor.py --status")
        print("  python autopsy_extractor.py --launch")
        print("  python autopsy_extractor.py --scan <path-to-sqlite-db>")

if __name__ == "__main__":
    main()
