"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface TerminalCommand {
  input: string
  /** Return lines to print. Return null to use default "command not found". */
  handler: (args: string[]) => string[] | null
}

interface HackTerminalProps {
  accentColor?: string
  prompt?: string
  bootLines?: string[]
  commands?: TerminalCommand[]
  /** Called when a specific success condition is met */
  onSuccess?: (output: string[]) => void
  /** Placeholder help text shown at start */
  welcomeMessage?: string[]
  height?: number
  id?: string
}

const STATIC_CHARS = "█▓▒░01"

function staticFlash(text: string, progress: number): string {
  return text.split("").map((c, i) => {
    if (c === " ") return c
    const threshold = progress / text.length
    if (i / text.length < threshold) return c
    return STATIC_CHARS[Math.floor(Math.random() * STATIC_CHARS.length)]
  }).join("")
}

export function HackTerminal({
  accentColor = "#00FF41",
  prompt = "root@hidden-wiki:~$",
  bootLines = [],
  commands = [],
  onSuccess,
  welcomeMessage = [],
  height = 340,
  id = "terminal",
}: HackTerminalProps) {
  const [lines, setLines] = useState<{ text: string; type: "output" | "input" | "error" | "success" | "info" }[]>([])
  const [input, setInput] = useState("")
  const [booting, setBooting] = useState(bootLines.length > 0)
  const [bootIdx, setBootIdx] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [decrypting, setDecrypting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines, booting])

  // Boot sequence
  useEffect(() => {
    if (!booting || bootIdx >= bootLines.length) {
      if (booting) {
        setBooting(false)
        if (welcomeMessage.length > 0) {
          setLines(welcomeMessage.map((t) => ({ text: t, type: "info" as const })))
        }
      }
      return
    }
    const delay = bootIdx === 0 ? 300 : 180 + Math.random() * 120
    const t = setTimeout(() => {
      setLines((l) => [...l, { text: bootLines[bootIdx], type: "output" }])
      setBootIdx((i) => i + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [booting, bootIdx, bootLines, welcomeMessage])

  const printLines = useCallback((newLines: { text: string; type: typeof lines[0]["type"] }[]) => {
    setLines((l) => [...l, ...newLines])
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    // Add to history
    setHistory((h) => [trimmed, ...h.slice(0, 49)])
    setHistIdx(-1)

    // Print the input
    printLines([{ text: `${prompt} ${trimmed}`, type: "input" }])
    setInput("")

    const parts = trimmed.split(" ")
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    // Built-ins
    if (cmd === "clear") {
      setLines([])
      return
    }
    if (cmd === "help") {
      printLines([
        { text: "Available commands:", type: "info" },
        { text: "  clear          Clear terminal", type: "output" },
        { text: "  help           Show this help", type: "output" },
        ...commands.map((c) => ({ text: `  ${c.input.padEnd(15)} ...`, type: "output" as const })),
      ])
      return
    }

    // User-defined commands — checked BEFORE built-in decoy handlers
    const matched = commands.find((c) => c.input.toLowerCase() === cmd)
    if (matched) {
      const result = matched.handler(args)
      if (result) {
        const isSuccess = result.some((r) => r.startsWith("SUCCESS:"))
        printLines(result.map((t) => ({
          text: t,
          type: isSuccess ? "success" : "output" as typeof lines[0]["type"],
        })))
        if (isSuccess) onSuccess?.(result)
      } else {
        printLines([{ text: `bash: ${cmd}: command not found`, type: "error" }])
      }
      return
    }

    // Decoy decrypt animation (only fires when no user-defined command matched)
    if (cmd === "crack" || cmd === "decode" || cmd === "decrypt") {
      if (decrypting) return
      setDecrypting(true)
      const target = args[0] || "target"
      let progress = 0
      printLines([{ text: `Initiating brute-force on ${target}...`, type: "info" }])
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 7) + 2
        if (progress >= 100) {
          clearInterval(interval)
          setDecrypting(false)
          printLines([{ text: `[!] Access denied — wrong key sequence.`, type: "error" }])
        } else {
          printLines([{ text: `[${String(progress).padStart(3)}%] ${staticFlash("█".repeat(Math.floor(progress / 5)), progress)}`, type: "output" }])
        }
      }, 120)
      return
    }

    printLines([{ text: `bash: ${cmd}: command not found`, type: "error" }])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] || "")
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? "" : history[idx])
    }
  }

  const typeColor = {
    output: "#909090",
    input: accentColor,
    error: "#FF3333",
    success: accentColor,
    info: "#444",
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        background: "#020202",
        border: "1px solid #181818",
        borderTop: `2px solid ${accentColor}30`,
        height,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
        cursor: "text",
      }}
    >
      {/* Terminal header */}
      <div style={{
        padding: "6px 12px",
        borderBottom: "1px solid #111",
        background: "#030303",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 7, height: 7, background: "#1a1a1a", border: "1px solid #222" }} />
          <div style={{ width: 7, height: 7, background: "#1a1a1a", border: "1px solid #222" }} />
          <div style={{ width: 7, height: 7, background: `${accentColor}30`, border: `1px solid ${accentColor}40` }} />
        </div>
        <span style={{ fontSize: 8, color: "#333", letterSpacing: "0.2em", flex: 1, textAlign: "center" }}>
          TERMINAL — {id.toUpperCase()}
        </span>
        <AnimatePresence>
          {decrypting && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ fontSize: 8, color: "#FF6B00", letterSpacing: "0.1em" }}
            >
              PROCESSING...
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Output area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 1 }}>
        {booting && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em" }}
          >
            INITIALIZING...
          </motion.div>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: 11,
              color: typeColor[line.type] || "#909090",
              lineHeight: 1.7,
              letterSpacing: "0.04em",
              fontWeight: line.type === "success" ? 700 : 400,
              borderLeft: line.type === "success" ? `2px solid ${accentColor}40` : "2px solid transparent",
              paddingLeft: line.type === "success" ? 8 : 0,
            }}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      {!booting && (
        <form onSubmit={handleSubmit} style={{
          borderTop: "1px solid #0e0e0e",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#020202",
        }}>
          <span style={{ fontSize: 11, color: `${accentColor}70`, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
            {prompt}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: accentColor,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.04em",
              caretColor: accentColor,
            }}
          />
        </form>
      )}
    </div>
  )
}
