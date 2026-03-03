"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { SortableTable } from "@/components/tor/sortable-table"
import { FileExplorer, type FSItem } from "@/components/tor/file-explorer"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import Link from "next/link"
import { usePathname } from "next/navigation"

const ACCENT = "#FFD700"

const SUBLINKS = [
  { label: "INDEX", href: "/hidden-wiki-2/leaks" },
  { label: "VAULT", href: "/hidden-wiki-2/leaks/vault" },
  { label: "DOCS", href: "/hidden-wiki-2/leaks/docs" },
  { label: "HASH-LAB", href: "/hidden-wiki-2/leaks/hash-lab" },
  { label: "MEMBERS", href: "/hidden-wiki-2/leaks/members" },
]

// 40+ row dataset — sort-to-reveal: sort by uploaded_at → 3 files in a row start with R, A, (dash)
const TABLE_ROWS = [
  { id: "LK-001", filename: "omegaprot_partial.enc",   classification: "CONFIDENTIAL", size: "12.4 KB", uploaded_at: "2024-10-15 22:17", operator: "DataCracker6",  status: "VERIFIED" },
  { id: "LK-002", filename: "member_list_redacted.txt", classification: "INTERNAL",    size: "3.1 KB",  uploaded_at: "2024-10-15 09:00", operator: "ToxicBabe",    status: "PARTIAL" },
  { id: "LK-003", filename: "fin_q4_extract.xls",       classification: "RESTRICTED",  size: "88.0 KB", uploaded_at: "2024-12-01 03:17", operator: "RedFox",       status: "VERIFIED" },
  { id: "LK-004", filename: "blk_orch_route_b.pdf",     classification: "CLASSIFIED",  size: "5.2 KB",  uploaded_at: "2024-11-30 18:30", operator: "Black-Voyvoda",status: "PARTIAL" },
  { id: "LK-005", filename: "rf_access_log_1014.bin",   classification: "INTERNAL",    size: "0.9 KB",  uploaded_at: "2024-10-14 20:00", operator: "DataCracker6", status: "CORRUPT" },
  { id: "LK-006", filename: "audi_a3_trace.gpx",        classification: "CONFIDENTIAL",size: "1.8 KB",  uploaded_at: "2024-10-15 19:00", operator: "NightKiller",  status: "VERIFIED" },
  { id: "LK-007", filename: "mirror_invite_scan.jpg",   classification: "INTERNAL",    size: "220 KB",  uploaded_at: "2024-10-14 16:45", operator: "GothGirl",     status: "VERIFIED" },
  { id: "LK-008", filename: "warehouse_rent_inv.pdf",   classification: "RESTRICTED",  size: "14.0 KB", uploaded_at: "2024-11-01 08:00", operator: "RedFox",       status: "DECOY" },
  { id: "LK-009", filename: "ritual_status_log.json",   classification: "CLASSIFIED",  size: "7.7 KB",  uploaded_at: "2024-10-20 03:17", operator: "ToxicBabe",    status: "VERIFIED" },
  { id: "LK-010", filename: "nullsyn_coords_fake.txt",  classification: "INTERNAL",    size: "0.3 KB",  uploaded_at: "2024-11-10 12:00", operator: "NullSyn",      status: "DECOY" },
  // The three R-A-_ files — visible only when sorted by uploaded_at asc (positions 11,12,13)
  { id: "LK-011", filename: "R_auth_seed.enc",          classification: "CLASSIFIED",  size: "2.2 KB",  uploaded_at: "2024-10-16 00:01", operator: "DataCracker6", status: "CORRUPT" },
  { id: "LK-012", filename: "A_lexiev_contract.pdf",    classification: "CONFIDENTIAL",size: "44.1 KB", uploaded_at: "2024-10-16 00:02", operator: "RedFox",       status: "VERIFIED" },
  { id: "LK-013", filename: "_chain_ref_node7.bin",     classification: "RESTRICTED",  size: "0.7 KB",  uploaded_at: "2024-10-16 00:03", operator: "DataCracker6", status: "VERIFIED" },
  { id: "LK-014", filename: "event_ledger_oct.csv",     classification: "INTERNAL",    size: "9.3 KB",  uploaded_at: "2024-10-18 14:30", operator: "ToxicBabe",    status: "PARTIAL" },
  { id: "LK-015", filename: "forum_dump_anon.sql",      classification: "INTERNAL",    size: "1.1 MB",  uploaded_at: "2024-11-05 22:00", operator: "DataCracker6", status: "PARTIAL" },
  { id: "LK-016", filename: "circuit3_keyshard.txt",    classification: "CONFIDENTIAL",size: "0.1 KB",  uploaded_at: "2024-11-12 09:17", operator: "DataCracker6", status: "VERIFIED" },
  { id: "LK-017", filename: "phone_log_lk_1015.txt",    classification: "RESTRICTED",  size: "4.4 KB",  uploaded_at: "2024-10-15 22:30", operator: "Black-Voyvoda",status: "VERIFIED" },
  { id: "LK-018", filename: "doctrine_v2_internal.pdf", classification: "CLASSIFIED",  size: "30.0 KB", uploaded_at: "2024-10-22 11:00", operator: "RedFox",       status: "PARTIAL" },
  { id: "LK-019", filename: "xray_img_002.png",         classification: "INTERNAL",    size: "512 KB",  uploaded_at: "2024-10-17 08:00", operator: "GothGirl",     status: "REDACTED" },
  { id: "LK-020", filename: "gothgirl_cred_hash.enc",   classification: "CLASSIFIED",  size: "0.4 KB",  uploaded_at: "2024-10-14 23:59", operator: "GothGirl",     status: "CORRUPT" },
  { id: "LK-021", filename: "bank_stmt_rfa_q3.pdf",     classification: "RESTRICTED",  size: "77.2 KB", uploaded_at: "2024-09-30 10:00", operator: "RedFox",       status: "VERIFIED" },
  { id: "LK-022", filename: "nullsyn_trace_false.gpx",  classification: "INTERNAL",    size: "2.1 KB",  uploaded_at: "2024-11-08 19:45", operator: "NullSyn",      status: "DECOY" },
  { id: "LK-023", filename: "cult_member_delta.csv",    classification: "INTERNAL",    size: "6.6 KB",  uploaded_at: "2024-10-25 14:00", operator: "ToxicBabe",    status: "PARTIAL" },
  { id: "LK-024", filename: "incident_2232_audio.mp3",  classification: "RESTRICTED",  size: "3.2 MB",  uploaded_at: "2024-10-15 22:45", operator: "Black-Voyvoda",status: "REDACTED" },
  { id: "LK-025", filename: "rf_gate_token.txt",        classification: "CLASSIFIED",  size: "0.1 KB",  uploaded_at: "2024-10-16 01:00", operator: "DataCracker6", status: "VERIFIED" },
  { id: "LK-026", filename: "orphan_chat_logs.txt",     classification: "INTERNAL",    size: "18.8 KB", uploaded_at: "2024-11-15 07:30", operator: "NightKiller",  status: "PARTIAL" },
  { id: "LK-027", filename: "mirror_arch_index.html",   classification: "INTERNAL",    size: "44 KB",   uploaded_at: "2024-11-03 11:11", operator: "GothGirl",     status: "PARTIAL" },
  { id: "LK-028", filename: "blkorchrd_manifest_c.pdf", classification: "CLASSIFIED",  size: "8.0 KB",  uploaded_at: "2024-10-31 18:00", operator: "Black-Voyvoda",status: "DECOY" },
  { id: "LK-029", filename: "forum_deadltr_03.txt",     classification: "INTERNAL",    size: "1.2 KB",  uploaded_at: "2024-11-22 03:17", operator: "NightKiller",  status: "PARTIAL" },
  { id: "LK-030", filename: "viena_ref_1891.enc",       classification: "CONFIDENTIAL",size: "0.6 KB",  uploaded_at: "2024-12-05 19:00", operator: "RedFox",       status: "VERIFIED" },
  { id: "LK-031", filename: "audi_reg_partial.jpg",     classification: "RESTRICTED",  size: "94 KB",   uploaded_at: "2024-10-16 09:00", operator: "Black-Voyvoda",status: "VERIFIED" },
  { id: "LK-032", filename: "event_oct_22_map.kml",     classification: "INTERNAL",    size: "3.3 KB",  uploaded_at: "2024-10-22 17:30", operator: "ToxicBabe",    status: "PARTIAL" },
  { id: "LK-033", filename: "snd_whisper_loop.ogg",     classification: "RESTRICTED",  size: "1.8 MB",  uploaded_at: "2024-10-20 23:00", operator: "GothGirl",     status: "REDACTED" },
  { id: "LK-034", filename: "credential_vault_bak.db",  classification: "CLASSIFIED",  size: "14.4 KB", uploaded_at: "2024-11-28 04:00", operator: "DataCracker6", status: "CORRUPT" },
  { id: "LK-035", filename: "caller_id_spoof_log.txt",  classification: "INTERNAL",    size: "0.5 KB",  uploaded_at: "2024-10-15 21:00", operator: "NightKiller",  status: "VERIFIED" },
  { id: "LK-036", filename: "bench_seatmap_wp.jpg",     classification: "INTERNAL",    size: "310 KB",  uploaded_at: "2024-10-16 14:00", operator: "GothGirl",     status: "PARTIAL" },
  { id: "LK-037", filename: "rothwell_acct_alias.enc",  classification: "CLASSIFIED",  size: "1.1 KB",  uploaded_at: "2024-12-02 08:00", operator: "RedFox",       status: "VERIFIED" },
  { id: "LK-038", filename: "deception_proto_v1.pdf",   classification: "CONFIDENTIAL",size: "22.7 KB", uploaded_at: "2024-10-19 10:45", operator: "ToxicBabe",    status: "PARTIAL" },
  { id: "LK-039", filename: "gps_trace_night_1015.gpx", classification: "RESTRICTED",  size: "1.6 KB",  uploaded_at: "2024-10-15 23:50", operator: "NightKiller",  status: "VERIFIED" },
  { id: "LK-040", filename: "third_awaken_manifest.pdf",classification: "CLASSIFIED",  size: "18.0 KB", uploaded_at: "2024-10-10 08:00", operator: "RedFox",       status: "VERIFIED" },
  { id: "LK-041", filename: "bkg_noise_analysis.wav",   classification: "INTERNAL",    size: "4.4 MB",  uploaded_at: "2024-11-30 22:17", operator: "DataCracker6", status: "REDACTED" },
  { id: "LK-042", filename: "hotel_checkin_alias.pdf",  classification: "RESTRICTED",  size: "6.1 KB",  uploaded_at: "2024-11-16 13:00", operator: "Black-Voyvoda",status: "VERIFIED" },
]

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: "#00FF41",
  PARTIAL: "#FF6B00",
  CORRUPT: "#FF0033",
  DECOY: "#CC44FF",
  REDACTED: "#333",
}

const CLASS_COLORS: Record<string, string> = {
  CONFIDENTIAL: "#FF3333",
  RESTRICTED: ACCENT,
  CLASSIFIED: "#FF6B00",
  INTERNAL: "#444",
}

const FS_ITEMS: FSItem[] = [
  {
    id: "vault",
    name: "vault/",
    type: "folder",
    modified: "2024-12-01",
    children: [
      { id: "v1", name: "omegaprot_partial.enc",  type: "encrypted", size: "12.4 KB", modified: "2024-10-15", classification: "CONFIDENTIAL" },
      { id: "v2", name: "rf_gate_token.txt",       type: "file",      size: "0.1 KB",  modified: "2024-10-16", classification: "CLASSIFIED" },
      { id: "v3", name: "circuit3_keyshard.txt",   type: "file",      size: "0.1 KB",  modified: "2024-11-12", classification: "CONFIDENTIAL" },
    ],
  },
  {
    id: "docs",
    name: "docs/",
    type: "folder",
    modified: "2024-11-30",
    children: [
      { id: "d1", name: "fin_q4_extract.xls",      type: "file",      size: "88 KB",   modified: "2024-12-01", classification: "RESTRICTED" },
      { id: "d2", name: "R_auth_seed.enc",          type: "encrypted", size: "2.2 KB",  modified: "2024-10-16", classification: "CLASSIFIED" },
      { id: "d3", name: "A_lexiev_contract.pdf",    type: "file",      size: "44 KB",   modified: "2024-10-16", classification: "CONFIDENTIAL" },
      { id: "d4", name: "_chain_ref_node7.bin",     type: "encrypted", size: "0.7 KB",  modified: "2024-10-16", classification: "RESTRICTED" },
      { id: "d5", name: "deception_proto_v1.pdf",   type: "file",      size: "22.7 KB", modified: "2024-10-19" },
      { id: "d6", name: "[REDACTED]_0317.bin",      type: "redacted",  size: "???",     modified: "2024-12-01", classification: "CLASSIFIED" },
    ],
  },
  {
    id: "media",
    name: "media/",
    type: "folder",
    modified: "2024-11-22",
    children: [
      { id: "m1", name: "xray_img_002.png",         type: "redacted",  size: "512 KB",  modified: "2024-10-17" },
      { id: "m2", name: "snd_whisper_loop.ogg",     type: "redacted",  size: "1.8 MB",  modified: "2024-10-20", classification: "RESTRICTED" },
      { id: "m3", name: "bkg_noise_analysis.wav",   type: "redacted",  size: "4.4 MB",  modified: "2024-11-30", classification: "INTERNAL" },
    ],
  },
  {
    id: "trace",
    name: "trace/",
    type: "folder",
    modified: "2024-12-05",
    children: [
      { id: "t1", name: "audi_a3_trace.gpx",        type: "file",      size: "1.8 KB",  modified: "2024-10-15" },
      { id: "t2", name: "gps_trace_night_1015.gpx", type: "file",      size: "1.6 KB",  modified: "2024-10-15" },
      { id: "t3", name: "nullsyn_trace_false.gpx",  type: "file",      size: "2.1 KB",  modified: "2024-11-08", classification: "INTERNAL" },
    ],
  },
]

export default function LeaksPage() {
  const pathname = usePathname()
  const [savedClues, setSavedClues] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<FSItem | null>(null)
  const [sortRevealSeen, setSortRevealSeen] = useState(false)
  const [xrayProgress, setXrayProgress] = useState(0)
  const [xrayRevealed, setXrayRevealed] = useState(false)
  const [showSortHint, setShowSortHint] = useState(false)
  const dragging = useRef(false)
  const xrayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const gs = getGameState()
    setSavedClues(new Set(gs.clues.map((c) => c.id)))
    setSortRevealSeen(gs.solvedPuzzles.includes("leaks-sort-reveal"))
  }, [])

  const saveClue = (id: string, title: string, text: string, confidence: number) => {
    if (savedClues.has(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title, text,
      sourceRoute: "/hidden-wiki-2/leaks",
      confidence,
      status: confidence >= 4 ? "confirmed" : "unverified",
    })
    saveGameState(updated)
    setSavedClues((s) => new Set([...s, id]))
  }

  // Sort-to-reveal detection: when sorted by uploaded_at asc, rows 11-13 become consecutive
  const handleTableSort = () => {
    if (sortRevealSeen) return
    setShowSortHint(true)
    setTimeout(() => {
      setSortRevealSeen(true)
      const gs = getGameState()
      if (!gs.solvedPuzzles.includes("leaks-sort-reveal")) {
        gs.solvedPuzzles.push("leaks-sort-reveal")
        saveGameState(gs)
      }
      saveClue("leaks-RA-identity", "[LEAKS] R.A. — Identity Fragment", "Три файла подредени по timestamp разкриват инициали: R · A · _ — фрагмент от самоличността на оператора RedFox.", 3)
    }, 1200)
  }

  // X-Ray drag puzzle
  const handleXrayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const rect = xrayRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setXrayProgress(pct)
    if (pct > 0.72 && !xrayRevealed) {
      setXrayRevealed(true)
      saveClue("leaks-audi-xray", "[LEAKS] Черен Audi A3 — регистрационен запис", "X-Ray анализ на документ LK-031 разкрива: 'Превозно средство: Черен Audi A3 (2005), вписан 15.10.2024 18:30'. Потвърдена Canon котва.", 5)
    }
  }

  const COLUMNS = [
    { key: "id" as const, label: "ID", width: 70 },
    { key: "filename" as const, label: "FILENAME", render: (v: unknown, row: typeof TABLE_ROWS[0]) => (
      <span style={{ color: row.status === "DECOY" ? "#333" : row.status === "VERIFIED" ? "#888" : "#555" }}>
        {String(v)}
      </span>
    )},
    { key: "classification" as const, label: "CLASS", width: 110, render: (v: unknown) => (
      <span style={{ color: CLASS_COLORS[String(v)] ?? "#444", fontSize: 9 }}>{String(v)}</span>
    )},
    { key: "size" as const, label: "SIZE", width: 72 },
    { key: "uploaded_at" as const, label: "UPLOADED", width: 130 },
    { key: "operator" as const, label: "OPERATOR", width: 110, render: (v: unknown) => (
      <span style={{ color: String(v) === "RedFox" ? "#FF3366" : "#555" }}>{String(v)}</span>
    )},
    { key: "status" as const, label: "STATUS", width: 80, render: (v: unknown) => (
      <span style={{ color: STATUS_COLORS[String(v)] ?? "#555", fontSize: 9 }}>{String(v)}</span>
    )},
  ]

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.35em", marginBottom: 8 }}>
          HIDDEN WIKI 2 // LEAKS VAULT // NODE: LK-VAULT
        </div>
        <GlitchText text="LEAKS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ height: 1, background: "#181818", marginTop: 10 }} />
      </div>

      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 1, marginBottom: 28, flexWrap: "wrap" }}>
        {SUBLINKS.map((link) => {
          const isCurrent = pathname === link.href
          return (
            <Link key={link.label} href={link.href} style={{
              padding: "7px 16px", fontSize: 9, fontFamily: "var(--font-mono)",
              color: isCurrent ? ACCENT : "#2a2a2a", letterSpacing: "0.14em",
              textDecoration: "none", background: isCurrent ? `${ACCENT}10` : "#060606",
              border: `1px solid ${isCurrent ? `${ACCENT}35` : "#141414"}`,
              borderBottom: isCurrent ? `2px solid ${ACCENT}` : "1px solid #141414",
              transition: "color 0.15s",
            }}
              onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.color = "#2a2a2a" }}>
              {link.label}
            </Link>
          )
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>

        {/* File Explorer */}
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em", marginBottom: 8 }}>
            FILESYSTEM
          </div>
          <FileExplorer
            items={FS_ITEMS}
            accentColor={ACCENT}
            title="LEAKS / ROOT"
            onFileOpen={(item) => setSelectedFile(item)}
          />
        </div>

        {/* File preview */}
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em", marginBottom: 8 }}>
            PREVIEW
          </div>
          <div style={{ border: "1px solid #181818", background: "#030303", minHeight: 280, padding: "16px" }}>
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div key={selectedFile.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em", marginBottom: 10 }}>
                    FILE PREVIEW
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, marginBottom: 8, fontWeight: 700 }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", lineHeight: 2 }}>
                    {selectedFile.type === "encrypted" && (
                      <div style={{ color: "#FF6B00" }}>▓▒░ ENCRYPTED — DECRYPTION KEY REQUIRED ░▒▓</div>
                    )}
                    {selectedFile.type === "redacted" && (
                      <div style={{ color: "#222" }}>░░░ [REDACTED BY ORDER OF OPERATOR] ░░░</div>
                    )}
                    {selectedFile.type === "file" && (
                      <>
                        <div>TYPE: {selectedFile.name.split(".").pop()?.toUpperCase()}</div>
                        <div>SIZE: {selectedFile.size}</div>
                        <div>MODIFIED: {selectedFile.modified}</div>
                        {selectedFile.classification && <div>CLASS: <span style={{ color: CLASS_COLORS[selectedFile.classification] ?? "#444" }}>{selectedFile.classification}</span></div>}
                        {selectedFile.id === "d3" && (
                          <div style={{ marginTop: 12, borderTop: "1px solid #181818", paddingTop: 10, color: "#555", lineHeight: 1.8 }}>
                            <div style={{ color: "#333", marginBottom: 4 }}>CONTENT FRAGMENT:</div>
                            <div>Договор — страна: [░░░░░░░░]</div>
                            <div>Бенефициар: <span style={{ color: ACCENT }}>Р. Алексиев</span></div>
                            <div>Дата: 12.09.2024</div>
                            <div>Сума: ░░.░░░ EUR</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {selectedFile.id === "d3" && !savedClues.has("leaks-alexiev-contract") && (
                    <button
                      onClick={() => saveClue("leaks-alexiev-contract", "[LEAKS] Р. Алексиев — договор", "Файл A_lexiev_contract.pdf съдържа: Бенефициар: Р. Алексиев. Частична самоличност на оператора RedFox.", 4)}
                      style={{
                        marginTop: 14, padding: "8px 20px", background: "transparent",
                        border: `1px solid ${ACCENT}40`, color: ACCENT,
                        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer",
                      }}>
                      ЗАПАЗИ УЛИКА
                    </button>
                  )}
                  {savedClues.has("leaks-alexiev-contract") && selectedFile.id === "d3" && (
                    <div style={{ marginTop: 10, fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a" }}>ЗАПИСАНО В ДОСИЕ</div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#1e1e1e", lineHeight: 1.8 }}>
                    Избери файл от файловата система.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* X-Ray puzzle */}
      <div style={{ border: "1px solid #181818", background: "#030303", padding: "18px", marginBottom: 2 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em", marginBottom: 12 }}>
          X-RAY ANALYZER — DOC: LK-031 (audi_reg_partial.jpg)
        </div>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a2a2a", marginBottom: 14 }}>
          Плъзни напред за да разкриеш скритото съдържание под редакцията.
        </div>
        <div
          ref={xrayRef}
          onMouseDown={() => { dragging.current = true }}
          onMouseUp={() => { dragging.current = false }}
          onMouseLeave={() => { dragging.current = false }}
          onMouseMove={handleXrayMouseMove}
          style={{
            position: "relative",
            height: 90,
            background: "#070707",
            border: "1px solid #181818",
            overflow: "hidden",
            cursor: "ew-resize",
            userSelect: "none",
          }}
        >
          {/* Redacted layer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "#0a0a0a",
            clipPath: `inset(0 0 0 ${Math.round(xrayProgress * 100)}%)`,
            display: "flex", alignItems: "center", padding: "0 20px",
          }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#1a1a1a", letterSpacing: "0.1em" }}>
              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
            </span>
          </div>

          {/* Revealed layer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "#020802",
            clipPath: `inset(0 ${100 - Math.round(xrayProgress * 100)}% 0 0)`,
            display: "flex", alignItems: "center", padding: "0 20px",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#555", lineHeight: 2 }}>
              <div>Регистрация № <span style={{ color: ACCENT }}>СА ░░░░ ░░</span></div>
              <div>Превозно средство: <span style={{ color: xrayRevealed ? ACCENT : "#555" }}>Черен Audi A3 (2005)</span></div>
              <div>Дата: <span style={{ color: xrayRevealed ? ACCENT : "#555" }}>15.10.2024 — 18:30</span></div>
            </div>
          </div>

          {/* Divider line */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${Math.round(xrayProgress * 100)}%`,
            width: 1, background: `${ACCENT}60`,
            boxShadow: `0 0 8px ${ACCENT}40`,
          }} />

          {!xrayRevealed && (
            <div style={{
              position: "absolute", bottom: 6, right: 12,
              fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200",
            }}>
              {Math.round(xrayProgress * 100)}% REVEALED
            </div>
          )}
          {xrayRevealed && (
            <div style={{
              position: "absolute", bottom: 6, right: 12,
              fontSize: 8, fontFamily: "var(--font-mono)", color: `${ACCENT}80`,
            }}>
              ULIKA RAZKRIITA
            </div>
          )}
        </div>
      </div>

      {/* Main sortable table */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 10, marginTop: 18,
        }}>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em" }}>
            ALL LEAKED FILES — {TABLE_ROWS.length} RECORDS
          </div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#222" }}>
            HINT: Сортирай по UPLOADED за да намериш скритото.
          </div>
        </div>

        <AnimatePresence>
          {showSortHint && !sortRevealSeen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "10px 14px", border: `1px solid ${ACCENT}30`,
                background: `${ACCENT}08`, marginBottom: 8,
                fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT,
              }}>
              ANOMALИЯ ОТКРИТА — Три файла с consecutive timestamp: R… A… _ — инициали на оператор.
            </motion.div>
          )}
        </AnimatePresence>

        <div onClick={handleTableSort}>
          <SortableTable
            columns={COLUMNS}
            rows={TABLE_ROWS}
            accentColor={ACCENT}
            maxHeight={380}
            rowHighlight={(row) => ["LK-011", "LK-012", "LK-013"].includes(row.id)}
          />
        </div>
      </div>

      {/* Saved clues summary */}
      {savedClues.size > 0 && (
        <div style={{ marginTop: 18, padding: "12px 16px", border: "1px solid #1a1400", background: "#050400" }}>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em", marginBottom: 8 }}>
            ЗАПИСАНИ УЛИКИ ОТ LEAKS: {savedClues.size}
          </div>
          {Array.from(savedClues).map((id) => (
            <div key={id} style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}40`, marginBottom: 2 }}>
              ▪ {id}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
