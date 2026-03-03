"use client"

import { useState, useEffect } from "react"
import { GlitchText } from "@/components/tor/glitch-text"
import { HackTerminal } from "@/components/tor/hack-terminal"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, CANON_ANCHORS, type Clue } from "@/lib/game-state"

const ACCENT = "#00FF41"
const REQUIRED_CONFIRMED = 3
const REAL_LAT = "42.6977"
const REAL_LON = "23.3219"
const LAT_HEX = "34322e36393737"
const LON_HEX = "32332e33323139"

const NODES = [
  { id: "NODE-A", label: "RED ROOM",   x: 18, y: 28, color: "#FF0033" },
  { id: "NODE-B", label: "MIRRORS",    x: 76, y: 14, color: "#00BFFF" },
  { id: "NODE-C", label: "LEAKS",      x: 50, y: 52, color: "#FFD700" },
  { id: "NODE-D", label: "EVENTS",     x: 14, y: 70, color: "#FF6B00" },
  { id: "NODE-E", label: "CULT",       x: 82, y: 65, color: "#CC44FF" },
  { id: "NODE-F", label: "FORUM",      x: 46, y: 84, color: "#00FF9F" },
  { id: "TRACE",  label: "TRACE-NODE", x: 50, y: 34, color: ACCENT },
]

const CONNECTIONS = [
  ["NODE-A", "NODE-C"], ["NODE-B", "NODE-C"], ["NODE-C", "TRACE"],
  ["NODE-D", "TRACE"],  ["NODE-E", "TRACE"],  ["NODE-F", "NODE-C"],
  ["NODE-A", "NODE-D"], ["NODE-B", "NODE-E"],
]

const BOOT_LINES = [
  "HIDDEN WIKI 2 // TRACE-NODE v1.0",
  "Loading RF-TRACE protocol...",
  "Connecting to NODE7...",
  "Cross-referencing evidence matrix...",
  "WARNING: 2 decoy coordinates detected in dataset.",
  "Type 'help' for available commands.",
]

const NODE_COMMANDS = [
  {
    input: "scan",
    handler: () => [
      "Scanning node signatures...",
      "  NODE-A (RED ROOM)   — RF-GATE token: ACTIVE",
      "  NODE-B (MIRRORS)    — CIRCUIT-3 token: ACTIVE",
      "  NODE-C (LEAKS)      — R.A. identity fragment: ACTIVE",
      "  NODE-D (EVENTS)     — Timeline 03:17: ACTIVE",
      "  NODE-E (CULT)       — Ritual status log: ACTIVE",
      "  NODE-F (FORUM)      — Confession #4: ACTIVE",
      "  NODE-7 (TRACE)      — RF-TRACE::NODE7: ACTIVE",
      "",
      "Evidence convergence: SUFFICIENT",
      "Type 'crack lat' and 'crack lon' to begin coordinate decryption.",
    ],
  },
  {
    input: "crack",
    handler: (args: string[]) => {
      const target = args[0]?.toLowerCase()
      if (target === "lat") {
        return [
          "Brute-forcing LAT coordinate...",
          `Encrypted string: ${LAT_HEX}`,
          "Algorithm: HEX→ASCII",
          `Type: decode hex ${LAT_HEX}`,
        ]
      }
      if (target === "lon") {
        return [
          "Brute-forcing LON coordinate...",
          `Encrypted string: ${LON_HEX}`,
          "Algorithm: HEX→ASCII",
          `Type: decode hex ${LON_HEX}`,
        ]
      }
      return ["Usage: crack <lat|lon>"]
    },
  },
  {
    input: "decode",
    handler: (args: string[]) => {
      const method = args[0]?.toLowerCase()
      const value = args[1]?.toLowerCase()
      if (method === "hex") {
        if (value === LAT_HEX) {
          return [
            "Decoding hex string...",
            `${LAT_HEX}`,
            `→ ASCII: ${REAL_LAT}`,
            "",
            `SUCCESS: LATITUDE CRACKED — ${REAL_LAT}°N`,
            "Store this value. Run 'crack lon' next.",
          ]
        }
        if (value === LON_HEX) {
          return [
            "Decoding hex string...",
            `${LON_HEX}`,
            `→ ASCII: ${REAL_LON}`,
            "",
            `SUCCESS: LONGITUDE CRACKED — ${REAL_LON}°E`,
            "Both coordinates obtained. Run 'verify coords' to confirm.",
          ]
        }
        return [
          "Decoding hex...",
          "[!] Hex string not recognized in evidence index.",
          `Try: decode hex ${LAT_HEX}`,
        ]
      }
      if (method === "rot13") {
        if (!value) return ["Usage: decode rot13 <string>"]
        const decoded = value.replace(/[a-zA-Z]/g, (c) => {
          const base = c < "a" ? 65 : 97
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
        })
        return [`ROT13: ${value} → ${decoded}`]
      }
      if (method === "base64") {
        if (!value) return ["Usage: decode base64 <string>"]
        try {
          return [`BASE64: ${value} → ${atob(value)}`]
        } catch {
          return ["[!] Invalid base64 string."]
        }
      }
      if (method === "reverse") {
        if (!value) return ["Usage: decode reverse <string>"]
        return [`REVERSE: ${value} → ${value.split("").reverse().join("")}`]
      }
      return ["Usage: decode <hex|rot13|base64|reverse> <value>"]
    },
  },
  {
    input: "verify",
    handler: (args: string[]) => {
      if (args[0]?.toLowerCase() === "coords") {
        return [
          "Verifying coordinates against Canon anchors...",
          `  LAT ${REAL_LAT}° × LON ${REAL_LON}°`,
          "  Cross-check: Черен Audi A3 trace (LK-006)... MATCH",
          "  Cross-check: 22:17 phone drop zone... MATCH",
          "  Cross-check: Огледален преход invitation... MATCH",
          "",
          "SUCCESS: COORDINATES VERIFIED",
          `SUCCESS: LOCATION CONFIRMED — ${REAL_LAT}°N, ${REAL_LON}°E`,
          "",
          "Run 'bundle' to generate final evidence package.",
        ]
      }
      return ["Usage: verify coords"]
    },
  },
  {
    input: "bundle",
    handler: () => [
      "Generating evidence bundle...",
      "  ▪ Identity: Румен Алексиев (RedFox)",
      `  ▪ Coordinates: ${REAL_LAT}°N, ${REAL_LON}°E`,
      "  ▪ Token chain: RF-GATE → CIRCUIT-3 → RF-TRACE::NODE7",
      "  ▪ Canon match: 3/3 anchors confirmed",
      "",
      "SUCCESS: BUNDLE READY",
      "SUCCESS: Proceed to official verification — sluchayat.com/verify",
    ],
  },
  {
    input: "whoami",
    handler: () => [
      "Analyst // HIDDEN WIKI 2",
      "Session: TRACE-NODE v1.0",
      "Authorization: PENDING FINAL VERIFICATION",
    ],
  },
  {
    input: "ls",
    handler: () => [
      "evidence/",
      "  rf_gate_token.txt",
      "  circuit3_keyshard.txt",
      "  R_auth_seed.enc",
      "  A_lexiev_contract.pdf",
      "  _chain_ref_node7.bin",
      "  coords_encrypted.bin",
    ],
  },
  {
    input: "cat",
    handler: (args: string[]) => {
      const file = args[0]
      if (file === "coords_encrypted.bin") {
        return [
          "Binary content:",
          `LAT: ${LAT_HEX}`,
          `LON: ${LON_HEX}`,
          "",
          "Encoding: HEX. Use 'decode hex <value>' to decrypt.",
        ]
      }
      if (file === "_chain_ref_node7.bin") {
        return [
          "RF-TRACE::NODE7",
          "Chain signature valid.",
          "Source: DataCracker6 @ 2024-10-16 00:03",
        ]
      }
      if (file === "A_lexiev_contract.pdf") {
        return [
          "Beneficiary: Р. Алексиев",
          "Date: 12.09.2024",
          "Amount: [REDACTED]",
          "Reference: RF-GATE/CIRCUIT",
        ]
      }
      return [`cat: ${file || "(no file)"}: No such file or directory`]
    },
  },
]

export default function TraceNodePage() {
  const [gameState, setGameState] = useState(getGameState())
  const [selectedClueIds, setSelectedClueIds] = useState<string[]>([])
  const [verdict, setVerdict] = useState("")
  const [verdictError, setVerdictError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [coordsCracked, setCoordsCracked] = useState(false)
  const [bundleReady, setBundleReady] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [output, setOutput] = useState<null | { clues: Clue[]; verdict: string; caseId: string }>(null)

  const allClues = gameState.clues

  useEffect(() => {
    const gs = getGameState()
    setGameState(gs)
    if (gs.solvedPuzzles.includes("trace-verified")) {
      const saved = localStorage.getItem("torshell_final_output")
      if (saved) setOutput(JSON.parse(saved))
    }
  }, [])

  const handleTerminalSuccess = (lines: string[]) => {
    if (lines.some((l) => l.includes("COORDINATES VERIFIED"))) setCoordsCracked(true)
    if (lines.some((l) => l.includes("BUNDLE READY"))) setBundleReady(true)
  }

  const toggleClue = (id: string) => {
    setSelectedClueIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const handleSubmit = () => {
    const selected = allClues.filter((c) => selectedClueIds.includes(c.id))
    const confirmedSelected = selected.filter((c) => c.status === "confirmed")
    if (selectedClueIds.length < 3) { setVerdictError(`Избери точно 3 улики (${selectedClueIds.length}/3)`); return }
    if (confirmedSelected.length < REQUIRED_CONFIRMED) { setVerdictError(`Нужни са ${REQUIRED_CONFIRMED} потвърдени — имаш ${confirmedSelected.length}`); return }
    const sources = new Set(selected.map((c) => c.sourceRoute))
    if (sources.size < 2) { setVerdictError("Уликите трябва да са от поне 2 различни сайта"); return }
    if (verdict.trim().length < 20) { setVerdictError("Вердиктът е твърде кратък (мин. 20 символа)"); return }
    setVerdictError("")
    setSubmitting(true)
    setTimeout(() => {
      const gs = getGameState()
      const caseId = `CASE-${Date.now().toString(36).toUpperCase()}`
      if (!gs.solvedPuzzles.includes("trace-verified")) {
        gs.solvedPuzzles.push("trace-verified")
        gs.progress = 100
        saveGameState(gs)
        setGameState(gs)
      }
      const finalOutput = { clues: selected, verdict: verdict.trim(), caseId }
      localStorage.setItem("torshell_final_output", JSON.stringify(finalOutput))
      setOutput(finalOutput)
      setSubmitting(false)
    }, 2000)
  }

  const getNode = (id: string) => NODES.find((n) => n.id === id)

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.35em", marginBottom: 8 }}>
          HIDDEN WIKI 2 // TRACE-NODE // FINAL STAGE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 9, height: 9, background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }}
          />
          <GlitchText text="TRACE-NODE" as="h1" intensity="high" color={ACCENT} className="text-3xl font-bold tracking-widest" />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
          <div style={{ height: 2, width: 80, background: ACCENT, opacity: 0.5 }} />
          <div style={{ height: 1, flex: 1, background: "#181818" }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {output ? (
          /* ─── CASE OUTPUT ─── */
          <motion.div key="output" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ padding: "20px 24px", border: `1px solid ${ACCENT}40`, background: "#020a02", marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.3em", marginBottom: 6 }}>ОФИЦИАЛЕН ДОКЛАД</div>
                <GlitchText text="РАЗСЛЕДВАНЕТО Е ПРИКЛЮЧЕНО" intensity="low" color={ACCENT} className="text-xl font-bold tracking-widest" />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#1a3a1a", textAlign: "right" }}>
                <div>{output.caseId}</div>
                <div style={{ color: "#111" }}>{new Date().toISOString().slice(0, 19)}Z</div>
              </div>
            </div>

            <div style={{ padding: "18px 24px", border: "1px solid #141414", background: "#020202", marginBottom: 2 }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 10 }}>ВЕРДИКТ</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#bbb", lineHeight: 1.8, borderLeft: `2px solid ${ACCENT}30`, paddingLeft: 14 }}>
                {output.verdict}
              </div>
            </div>

            <div style={{ padding: "18px 24px", border: "1px solid #141414", background: "#020202", marginBottom: 2 }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 12 }}>КЛЮЧОВИ ДОКАЗАТЕЛСТВА</div>
              {output.clues.map((clue, i) => (
                <div key={clue.id} style={{ padding: "10px 14px", border: `1px solid ${ACCENT}15`, background: "#030303", marginBottom: 2, display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 9, color: `${ACCENT}40`, fontFamily: "var(--font-mono)", minWidth: 18 }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700, marginBottom: 3 }}>{clue.title}</div>
                    <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", lineHeight: 1.5 }}>{clue.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* VERIFICATION BLOCK */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ padding: "24px", border: `1px solid ${ACCENT}30`, background: "#020a02" }}
            >
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.25em", marginBottom: 16 }}>
                ПОСЛЕДНА СТЪПКА — ОФИЦИАЛНА ВЕРИФИКАЦИЯ
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#555", lineHeight: 1.9, marginBottom: 20, maxWidth: 540 }}>
                Ако си готов с решението, предай своя случай на официалната страница за верификация.
                Ще ти трябват:{" "}
                <span style={{ color: ACCENT }}>Координатите</span>
                {" "}и{" "}
                <span style={{ color: ACCENT }}>пълното име на оператора</span>.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <a
                  href="https://sluchayat.com/verify"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "14px 40px",
                    background: `${ACCENT}10`,
                    border: `1px solid ${ACCENT}50`,
                    color: ACCENT,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    textDecoration: "none",
                    display: "inline-block",
                    fontWeight: 700,
                    animation: "pulse-glow 3s infinite",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${ACCENT}25`}
                  onMouseLeave={(e) => e.currentTarget.style.background = `${ACCENT}10`}
                >
                  → sluchayat.com/verify
                </a>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#1a2a1a", lineHeight: 2 }}>
                  <div>CASE ID: {output.caseId}</div>
                  <div>COORDINATES: {REAL_LAT}°N, {REAL_LON}°E</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* ─── INVESTIGATION FORM ─── */
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Node map + canon anchors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
              <div style={{ padding: "16px", border: "1px solid #181818", background: "#030303" }}>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.2em", marginBottom: 14 }}>NODE MAP</div>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: 200 }}>
                  {CONNECTIONS.map(([a, b], i) => {
                    const na = getNode(a); const nb = getNode(b)
                    if (!na || !nb) return null
                    return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#181818" strokeWidth="0.3" />
                  })}
                  {NODES.map((node) => (
                    <g key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: "default" }}>
                      <rect x={node.x - 3} y={node.y - 3} width={6} height={6}
                        fill={hoveredNode === node.id ? `${node.color}40` : `${node.color}18`}
                        stroke={node.color} strokeWidth="0.4" />
                      <text x={node.x} y={node.y + 9} textAnchor="middle"
                        style={{ fontSize: "3.2px", fill: node.color, fontFamily: "monospace", opacity: 0.6 }}>
                        {node.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div style={{ padding: "16px", border: "1px solid #181818", background: "#020202" }}>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.2em", marginBottom: 14 }}>CANON ANCHORS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {CANON_ANCHORS.map((anchor, i) => (
                    <motion.div key={anchor.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#030303", border: "1px solid #111" }}>
                      <div style={{ width: 4, height: 4, background: `${ACCENT}40`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700, marginBottom: 2 }}>{anchor.label}</div>
                        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333" }}>{anchor.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div style={{ marginBottom: 2 }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.22em", marginBottom: 8 }}>
                COORDINATE CRACK TERMINAL
              </div>
              <HackTerminal
                id="trace-node"
                accentColor={ACCENT}
                prompt="analyst@trace-node:~$"
                bootLines={BOOT_LINES}
                commands={NODE_COMMANDS}
                onSuccess={handleTerminalSuccess}
                height={320}
              />
            </div>

            {/* Coords status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
              {[
                { label: coordsCracked ? `COORDINATES: ${REAL_LAT}°N, ${REAL_LON}°E` : "COORDINATES: PENDING", active: coordsCracked },
                { label: bundleReady ? "BUNDLE: ГОТОВ — РУМЕН АЛЕКСИЕВ" : "BUNDLE: PENDING", active: bundleReady },
              ].map(({ label, active }) => (
                <div key={label} style={{ padding: "12px 16px", border: `1px solid ${active ? `${ACCENT}30` : "#141414"}`, background: active ? "#020a02" : "#020202" }}>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: active ? ACCENT : "#1a1a1a", letterSpacing: "0.2em" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Clue selector */}
            <div style={{ padding: "18px", border: "1px solid #141414", background: "#030303", marginBottom: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.22em" }}>ИЗБЕРИ 3 КЛЮЧОВИ УЛИКИ</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: selectedClueIds.length === 3 ? ACCENT : "#333" }}>{selectedClueIds.length}/3</div>
              </div>
              {allClues.length === 0 ? (
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#222", padding: "18px 0" }}>Няма улики. Обходи сайтовете.</div>
              ) : allClues.map((clue) => {
                const isSelected = selectedClueIds.includes(clue.id)
                const isConfirmed = clue.status === "confirmed"
                const isDisabled = !isSelected && selectedClueIds.length >= 3
                const statusColor = isConfirmed ? ACCENT : clue.status === "suspicious" ? "#FF0033" : "#333"
                return (
                  <div key={clue.id} role="checkbox" aria-checked={isSelected} tabIndex={0}
                    onClick={() => !isDisabled && toggleClue(clue.id)}
                    onKeyDown={(e) => e.key === "Enter" && !isDisabled && toggleClue(clue.id)}
                    style={{
                      padding: "10px 14px", border: `1px solid ${isSelected ? `${statusColor}40` : "#111"}`,
                      background: isSelected ? `${statusColor}07` : "#020202",
                      display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 2,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.3 : 1, transition: "all 0.12s",
                    }}>
                    <div style={{ width: 11, height: 11, border: `1px solid ${isSelected ? statusColor : "#1e1e1e"}`, background: isSelected ? `${statusColor}25` : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isSelected && <div style={{ width: 5, height: 5, background: statusColor }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: isSelected ? "#ccc" : "#555", fontWeight: 600 }}>{clue.title}</span>
                        <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: statusColor, border: `1px solid ${statusColor}25`, padding: "1px 5px", letterSpacing: "0.1em" }}>{clue.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", lineHeight: 1.5 }}>{clue.text.slice(0, 110)}{clue.text.length > 110 ? "..." : ""}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Verdict */}
            <div style={{ padding: "18px", border: "1px solid #141414", background: "#030303", marginBottom: 2 }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.22em", marginBottom: 10 }}>АНАЛИТИЧЕН ВЕРДИКТ</div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#252525", marginBottom: 12, lineHeight: 1.8 }}>
                Кой? Кога? Защо? Системата архивира твоя анализ — не проверява "правилен отговор".
              </div>
              <textarea
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                placeholder="Въведи своя вердикт..."
                rows={4}
                style={{
                  width: "100%", background: "#010101",
                  border: `1px solid ${verdict.length >= 20 ? "#2a2a2a" : "#181818"}`,
                  borderTop: verdict.length >= 20 ? `1px solid ${ACCENT}15` : "1px solid #181818",
                  color: "#c8c8c8", fontFamily: "var(--font-mono)", fontSize: 11,
                  padding: "10px 12px", resize: "vertical", outline: "none", lineHeight: 1.7,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: verdict.length >= 20 ? `${ACCENT}50` : "#1e1e1e" }}>{verdict.length} / мин. 20</span>
              </div>
            </div>

            {/* Submit */}
            <div style={{ padding: "18px", border: "1px solid #141414", background: "#020202" }}>
              {verdictError && (
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF0033", marginBottom: 12, padding: "8px 12px", border: "1px solid #2a0000", background: "#080000" }}>
                  {verdictError}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{
                    padding: "12px 32px", background: `${ACCENT}10`, border: `1px solid ${ACCENT}35`,
                    color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 11,
                    letterSpacing: "0.16em", cursor: submitting ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = `${ACCENT}1e` }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = `${ACCENT}10` }}>
                  {submitting ? "ПРЕДАВАНЕ..." : "ПРЕДАЙ КАЗУСА"}
                </button>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#1e1e1e", lineHeight: 2 }}>
                  <div>Избрани: {selectedClueIds.length}/3</div>
                  <div>Потвърдени: {allClues.filter((c) => selectedClueIds.includes(c.id) && c.status === "confirmed").length}/3</div>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
