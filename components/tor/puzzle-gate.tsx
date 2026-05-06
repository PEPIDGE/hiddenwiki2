"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getGameState,
  saveGameState,
  hasCooldown,
  type GameState,
} from "@/lib/game-state"

interface PuzzleGateProps {
  puzzleId: string
  title: string
  description?: string
  hint?: string
  placeholder?: string
  maxAttempts?: number
  cooldownSeconds?: number
  accentColor?: string
  onSuccess: (state: GameState) => GameState
  decoyMessage?: string
  children?: React.ReactNode
}

export function PuzzleGate({
  puzzleId,
  title,
  description,
  hint,
  placeholder = "ВЪВЕДИ КОД",
  maxAttempts = 5,
  cooldownSeconds = 120,
  accentColor = "#00FF41",
  onSuccess,
  decoyMessage,
  children,
}: PuzzleGateProps) {
  const [input, setInput] = useState("")
  const [state, setState] = useState<"idle" | "success" | "error" | "cooldown" | "decoy">("idle")
  const [message, setMessage] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    const gs = getGameState()
    setGameState(gs)
    setAttempts(gs.attempts[puzzleId] ?? 0)

    // Check if already solved
    if (gs.solvedPuzzles.includes(puzzleId)) {
      setState("success")
    }

    // Check cooldown
    const remaining = hasCooldown(puzzleId, gs)
    if (remaining > 0) {
      setState("cooldown")
      setCooldownLeft(Math.ceil(remaining / 1000))
    }
  }, [puzzleId])

  // Cooldown countdown
  useEffect(() => {
    if (state !== "cooldown") return
    if (cooldownLeft <= 0) {
      setState("idle")
      return
    }
    const timer = setTimeout(() => setCooldownLeft((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [state, cooldownLeft])

  const handleSubmit = useCallback(() => {
    if (!gameState) return
    if (state === "cooldown" || state === "success") return

    const newAttempts = (gameState.attempts[puzzleId] ?? 0) + 1
    const newGs: GameState = {
      ...gameState,
      attempts: { ...gameState.attempts, [puzzleId]: newAttempts },
    }

    // Check if hit max attempts
    if (newAttempts >= maxAttempts) {
      const cooldownUntil = Date.now() + cooldownSeconds * 1000
      newGs.cooldownUntil = { ...newGs.cooldownUntil, [puzzleId]: cooldownUntil }
      saveGameState(newGs)
      setGameState(newGs)
      setState("cooldown")
      setCooldownLeft(cooldownSeconds)

      // After 3 failures, show decoy
      if (newAttempts >= 3 && decoyMessage) {
        setState("decoy")
        setMessage(decoyMessage)
      } else {
        setState("cooldown")
      }
      return
    }

    // Try the success handler — it returns modified state if correct, null if wrong
    try {
      const result = onSuccess(newGs)
      if (result !== newGs) {
        // Success
        const successGs: GameState = {
          ...result,
          solvedPuzzles: [...result.solvedPuzzles, puzzleId],
        }
        saveGameState(successGs)
        setGameState(successGs)
        setState("success")
        setMessage("ВЕРИФИКАЦИЯ УСПЕШНА")
      } else {
        // Wrong
        saveGameState(newGs)
        setGameState(newGs)
        setAttempts(newAttempts)
        setState("error")
        setMessage(`ГРЕШЕН КОД. ОПИТИ: ${newAttempts}/${maxAttempts}`)
        if (newAttempts >= 3) setShowHint(true)
        setTimeout(() => setState("idle"), 2000)
      }
    } catch {
      saveGameState(newGs)
      setGameState(newGs)
      setAttempts(newAttempts)
      setState("error")
      setMessage(`ГРЕШЕН КОД. ОПИТИ: ${newAttempts}/${maxAttempts}`)
      if (newAttempts >= 3) setShowHint(true)
      setTimeout(() => setState("idle"), 2000)
    }
  }, [input, gameState, puzzleId, maxAttempts, cooldownSeconds, onSuccess, decoyMessage, state])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
  }

  // Already solved — show children
  if (state === "success" && children) {
    return (
      <div
        style={{
          border: `1px solid ${accentColor}40`,
          padding: 16,
          animation: "fade-up 0.3s ease",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            color: accentColor,
            letterSpacing: "0.15em",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: accentColor,
              boxShadow: `0 0 6px ${accentColor}`,
            }}
          />
          {title} — ОТКЛЮЧЕНО
        </div>
        {children}
      </div>
    )
  }

  const borderColor =
    state === "success"
      ? accentColor
      : state === "error" || state === "decoy"
        ? "#FF0033"
        : state === "cooldown"
          ? "#333333"
          : "#1a1a1a"

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        padding: 20,
        background: "#0a0a0a",
        transition: "border-color 0.3s",
        animation: state === "error" ? "glitch-main 0.3s ease" : undefined,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: accentColor,
          letterSpacing: "0.15em",
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        [PUZZLE] {title}
      </div>

      {description && (
        <div
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--muted-foreground)",
            lineHeight: 1.7,
            marginBottom: 14,
          }}
        >
          {description}
        </div>
      )}

      {/* Cooldown */}
      {state === "cooldown" && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "#333333",
              marginBottom: 6,
            }}
          >
            CIRCUIT COOLING... {cooldownLeft}s
          </div>
          <div style={{ height: 2, background: "#111111" }}>
            <div
              style={{
                height: "100%",
                width: `${(cooldownLeft / cooldownSeconds) * 100}%`,
                background: "#FF0033",
                transition: "width 1s linear",
              }}
            />
          </div>
        </div>
      )}

      {/* Decoy result */}
      {state === "decoy" && (
        <div
          style={{
            padding: "10px 12px",
            border: "1px solid #FF003340",
            background: "#FF000308",
            marginBottom: 12,
            animation: "fade-up 0.3s ease",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "#FF0033",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            TRACE RESULT — NullSyndicate
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "#909090",
              lineHeight: 1.6,
            }}
          >
            {message}
          </div>
        </div>
      )}

      {/* Input area */}
      {state !== "cooldown" && state !== "decoy" && (
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              background: "#050505",
              border: `1px solid ${state === "error" ? "#FF003360" : "#1a1a1a"}`,
              color: accentColor,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: "8px 12px",
              outline: "none",
              letterSpacing: "0.2em",
              caretColor: accentColor,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = `${accentColor}60`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = state === "error" ? "#FF003360" : "#1a1a1a"
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              background: "transparent",
              border: `1px solid ${accentColor}60`,
              color: accentColor,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "0 16px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${accentColor}15`
              e.currentTarget.style.boxShadow = `0 0 8px ${accentColor}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            VERIFY
          </button>
        </div>
      )}

      {/* Status message */}
      {message && state !== "decoy" && (
        <div
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            color: state === "success" ? accentColor : "#FF0033",
            marginTop: 8,
            letterSpacing: "0.1em",
          }}
        >
          {message}
        </div>
      )}

      {/* Hint */}
      {hint && (
        <div style={{ marginTop: 10 }}>
          {showHint ? (
            <div
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: "#FFD700",
                padding: "6px 10px",
                border: "1px solid #FFD70030",
                background: "#FFD70008",
                letterSpacing: "0.05em",
                lineHeight: 1.6,
                animation: "fade-up 0.2s ease",
              }}
            >
              [HINT] {hint}
            </div>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              disabled={attempts < 3}
              style={{
                background: "transparent",
                border: "none",
                color: attempts >= 3 ? "#FFD700" : "#222222",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                cursor: attempts >= 3 ? "pointer" : "not-allowed",
                letterSpacing: "0.1em",
                padding: 0,
              }}
            >
              {attempts >= 3 ? "[UNLOCK HINT]" : `[HINT: след ${3 - attempts} грешки]`}
            </button>
          )}
        </div>
      )}

      {/* Attempts indicator */}
      <div
        style={{
          display: "flex",
          gap: 3,
          marginTop: 10,
          alignItems: "center",
        }}
      >
        {[...Array(maxAttempts)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 2,
              background: i < attempts ? "#FF003360" : "#1a1a1a",
              transition: "background 0.2s",
            }}
          />
        ))}
        <span
          style={{
            fontSize: 8,
            fontFamily: "var(--font-mono)",
            color: "#222222",
            marginLeft: 6,
          }}
        >
          ATTEMPTS
        </span>
      </div>
    </div>
  )
}
