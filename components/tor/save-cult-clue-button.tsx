"use client"

import { useEffect, useState } from "react"
import { Check, Save } from "lucide-react"
import { addClue, getGameState, saveGameState } from "@/lib/game-state"

const ACCENT = "#00FF41"

interface SaveCultClueButtonProps {
  clueId: string
  name: string
  clue: string
  clueTitle?: string
  sourceRoute: string
  confidence: number
  compact?: boolean
}

export function SaveCultClueButton({
  clueId,
  name,
  clue,
  clueTitle,
  sourceRoute,
  confidence,
  compact = false,
}: SaveCultClueButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getGameState().clues.some((item) => item.id === clueId))
  }, [clueId])

  const handleSave = () => {
    if (saved) return

    const updated = addClue(getGameState(), {
      id: clueId,
      title: clueTitle ?? `[CULT] ${name}`,
      text: clue,
      sourceRoute,
      confidence,
      status: "unverified",
    })

    saveGameState(updated)
    setSaved(true)
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saved}
      title={saved ? "Уликата е запазена" : "Запази като улика"}
      aria-label={saved ? "Уликата е запазена" : "Запази като улика"}
      style={{
        width: compact ? 28 : undefined,
        height: compact ? 28 : undefined,
        padding: compact ? 0 : "9px 16px",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.1em",
        background: saved ? `${ACCENT}12` : compact ? "transparent" : "#0a0a0a",
        color: saved ? ACCENT : compact ? "#8a8a8a" : "#d6d6d6",
        border: `1px solid ${saved ? `${ACCENT}55` : compact ? "#262626" : "#333"}`,
        cursor: saved ? "default" : "pointer",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      {saved ? <Check size={compact ? 13 : 14} strokeWidth={2} /> : <Save size={compact ? 13 : 14} strokeWidth={2} />}
      {!compact && (saved ? "ЗАПАЗЕНО" : "ЗАПАЗИ УЛИКА")}
    </button>
  )
}
