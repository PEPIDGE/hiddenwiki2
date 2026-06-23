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
        width: compact ? 34 : undefined,
        height: compact ? 34 : undefined,
        padding: compact ? 0 : "8px 16px",
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.12em",
        background: saved ? `${ACCENT}14` : "#080808",
        color: saved ? ACCENT : "#c9c9c9",
        border: `1px solid ${saved ? `${ACCENT}55` : "#2a2a2a"}`,
        cursor: saved ? "default" : "pointer",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
      }}
    >
      {saved ? <Check size={14} strokeWidth={2} /> : <Save size={14} strokeWidth={2} />}
      {!compact && (saved ? "ЗАПАЗЕНО" : "ЗАПАЗИ УЛИКА")}
    </button>
  )
}
