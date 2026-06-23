"use client"

import { useEffect, useState } from "react"
import { addClue, getGameState, saveGameState } from "@/lib/game-state"

const ACCENT = "#00FF41"

interface SaveCultClueButtonProps {
  clueId: string
  name: string
  clue: string
  sourceRoute: string
  confidence: number
}

export function SaveCultClueButton({
  clueId,
  name,
  clue,
  sourceRoute,
  confidence,
}: SaveCultClueButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getGameState().clues.some((item) => item.id === clueId))
  }, [clueId])

  const handleSave = () => {
    if (saved) return

    const updated = addClue(getGameState(), {
      id: clueId,
      title: `[CULT] ${name}`,
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
      onClick={handleSave}
      disabled={saved}
      style={{
        padding: "8px 16px",
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.12em",
        background: saved ? `${ACCENT}14` : "#080808",
        color: saved ? ACCENT : "#c9c9c9",
        border: `1px solid ${saved ? `${ACCENT}55` : "#2a2a2a"}`,
        cursor: saved ? "default" : "pointer",
        fontWeight: 700,
      }}
    >
      {saved ? "ЗАПАЗЕНО" : "ЗАПАЗИ УЛИКА"}
    </button>
  )
}
