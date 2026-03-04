"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState } from "@/lib/game-state"

const ACCENT = "#00FF41"
const PROMPT = "analyst@hw2:~$"

const BOOT_LINES = [
  "$ ./launch_terminal.sh --clearance=2 --relay=tor",
  "  [OK] Relay established: 3 hops",
  "  [OK] AES-256 session initialized",
  "  [OK] Evidence index mounted: 7 files",
  "  [!!] 2 anomalous nodes detected",
  "  [OK] Master terminal ready.",
  "",
  "Type 'help' for command list.",
]

type LineType = "input" | "output" | "error" | "success" | "system" | "boot"

interface Line {
  text: string
  type: LineType
}

export default function TerminalPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [booting, setBooting] = useState(true)
  const [bootIdx, setBootIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Boot sequence
  useEffect(() => {
    if (!booting) return
    if (bootIdx >= BOOT_LINES.length) {
      setBooting(false)
      return
    }
    const t = setTimeout(() => {
      setLines((l) => [...l, { text: BOOT_LINES[bootIdx], type: "boot" }])
      setBootIdx((i) => i + 1)
    }, bootIdx === 0 ? 200 : 160 + Math.random() * 100)
    return () => clearTimeout(t)
  }, [booting, bootIdx])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  useEffect(() => {
    if (!booting) inputRef.current?.focus()
  }, [booting])

  const print = useCallback((newLines: Line[]) => {
    setLines((l) => [...l, ...newLines])
  }, [])

  const handleSubmit = async () => {
    const raw = input.trim()
    if (!raw || loading) return

    print([{ text: `${PROMPT} ${raw}`, type: "input" }])
    setHistory((h) => [raw, ...h.slice(0, 49)])
    setHistIdx(-1)
    setInput("")

    const parts = raw.trim().split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    // Client-side only: clear
    if (cmd === "clear") {
      setLines([])
      return
    }

    // All other commands → API
    setLoading(true)
    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd, args }),
      })
      const data = await res.json()

      if (data.clear) {
        setLines([])
        setLoading(false)
        return
      }

      const isSuccess = data.success === true
      const responseLines: Line[] = (data.lines as string[]).map((t: string, i: number) => ({
        text: t,
        type: isSuccess && i >= (data.lines.length - 3) ? "success" : "output",
      }))
      print(responseLines)

      // If token issued, save to game state
      if (data.token) {
        const gs = getGameState()
        const updated = {
          ...gs,
          tokens: { ...gs.tokens, [data.token]: true },
        }
        saveGameState(updated)
      }
    } catch {
      print([{ text: "Connection error — server unreachable.", type: "error" }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { handleSubmit(); return }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] ?? "")
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? "" : history[idx] ?? "")
    }
  }

  const lineColor = (type: LineType): string => {
    switch (type) {
      case "input": return ACCENT
      case "success": return ACCENT
      case "error": return "#FF3333"
      case "boot": return "#333333"
      case "system": return "#444444"
      default: return "#777777"
    }
  }

  const linePL = (type: LineType) =>
    type === "success" ? "10px" : type === "input" ? "0" : "0"

  const lineBL = (type: LineType) =>
    type === "success" ? `2px solid ${ACCENT}50` : "2px solid transparent"

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.35em", marginBottom: 8 }}>
          HIDDEN WIKI 2 // MASTER TERMINAL
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 8, height: 8, background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
          />
          <GlitchText text="MASTER TERMINAL" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
          {loading && (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#FF6B00", letterSpacing: "0.2em" }}
            >
              PROCESSING...
            </motion.span>
          )}
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>

      {/* Quick commands */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["help", "scan", "ls", "status", "whoami"].map((cmd) => (
          <button
            key={cmd}
            onClick={() => { setInput(cmd); inputRef.current?.focus() }}
            style={{
              background: "transparent",
              border: "1px solid #1a1a1a",
              color: "#555",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              padding: "4px 10px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = `${ACCENT}40` }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#1a1a1a" }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal window */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          background: "#010101",
          border: "1px solid #181818",
          borderTop: `2px solid ${ACCENT}30`,
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-mono)",
          cursor: "text",
        }}
      >
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 14px", background: "#030303",
          borderBottom: "1px solid #0e0e0e",
        }}>
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ width: 8, height: 8, background: "#1a0000", border: "1px solid #2a0000" }} />
            <div style={{ width: 8, height: 8, background: "#1a0800", border: "1px solid #2a1200" }} />
            <div style={{ width: 8, height: 8, background: "#001a00", border: `1px solid ${ACCENT}30` }} />
          </div>
          <span style={{ fontSize: 8, color: "#252525", letterSpacing: "0.25em", flex: 1, textAlign: "center" }}>
            TERMINAL — HIDDEN WIKI 2 // MASTER SESSION
          </span>
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 6, height: 6, background: ACCENT, boxShadow: `0 0 5px ${ACCENT}` }}
          />
        </div>

        {/* Output */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", minHeight: 440 }}>
          <AnimatePresence initial={false}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.08 }}
                style={{
                  fontSize: 11,
                  lineHeight: 1.75,
                  color: lineColor(line.type),
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  paddingLeft: linePL(line.type),
                  borderLeft: lineBL(line.type),
                  marginBottom: line.text === "" ? 4 : 0,
                }}
              >
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        {!booting && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderTop: "1px solid #0e0e0e",
            background: "#020202",
          }}>
            <span style={{ fontSize: 11, color: `${ACCENT}80`, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
              {PROMPT}
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              autoFocus
              style={{
                flex: 1, background: "transparent", border: "none",
                outline: "none", color: ACCENT,
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.06em", caretColor: ACCENT,
                opacity: loading ? 0.4 : 1,
              }}
            />
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
              style={{ color: ACCENT, fontSize: 14 }}
            >
              █
            </motion.span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 20, marginTop: 12, padding: "8px 0",
        borderTop: "1px solid #0e0e0e",
      }}>
        {[
          { color: ACCENT, label: "SUCCESS / INPUT" },
          { color: "#777", label: "OUTPUT" },
          { color: "#FF3333", label: "ERROR" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, background: color }} />
            <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.1em" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
