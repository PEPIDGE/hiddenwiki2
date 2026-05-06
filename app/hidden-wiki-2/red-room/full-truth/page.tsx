"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

const TRUTH_FRAGMENTS = [
  {
    id: "tf-01",
    locked: false,
    title: "Fragment I — Шофьорът",
    content: `На 15.10.2025 в 18:30 ч. Лора се качва в черен Audi A3. Шофьорът е известен в системата като NightKiller — Димитър Миланов, 31 г.

Той е потвърден член на Братството на третото пробуждане. Колата е регистрирана на негово име. Не е първи път, в който кара жени към частни event-и.`,
    token: null,
    isBait: false,
    clueText: "Truth Fragment I: NightKiller = Димитър Миланов, шофьор, Audi A3, 18:30",
  },
  {
    id: "tf-02",
    locked: true,
    title: "Fragment II — Маршрутът",
    content: `NightKiller следва route-17-night. Маршрутът минава покрай Западен парк, след което завива към индустриалния район.

Местоназначение: обект в западна промишлена зона. Времето на пристигане се изчислява на 19:15—19:30.

Бележка: Лора вероятно е смятала, че това е обикновено арт събитие.`,
    token: null,
    isBait: true,
    clueText: "Truth Fragment II (BAIT): route-17-night — маршрут към западна промишлена зона",
  },
  {
    id: "tf-03",
    locked: true,
    title: "Fragment III — Самоличността",
    content: `Резултатът е ясен: NightKiller е директният и окончателен извършител. Той е качил Лора в колата. Той е завел Лора в стаята. Търси човека, който я е качил в колата, не този, който стои зад него.

ВНИМАНИE: Това е крайната истина според наличните данни.`,
    token: "red-room-route-token: route-17-night",
    isBait: true,
    clueText: "Truth Fragment III (BAIT): NightKiller = директен извършител — ВНИМАНИЕ: вероятно подвеждащо",
  },
]

export default function FullTruthPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [unlockedFragments, setUnlockedFragments] = useState<string[]>(["tf-01"])
  const [tokenRevealed, setTokenRevealed] = useState(false)

  useEffect(() => {
    const gs = getGameState()
    setSavedClues(gs.clues.map((c) => c.id))
    // Check how many fragments already saved
    const saved = gs.clues.filter((c) => c.id.startsWith("ft-")).length
    if (saved >= 1) setUnlockedFragments(["tf-01", "tf-02"])
    if (saved >= 2) setUnlockedFragments(["tf-01", "tf-02", "tf-03"])
    if (saved >= 3) setTokenRevealed(true)
  }, [])

  const handleSave = (frag: typeof TRUTH_FRAGMENTS[number]) => {
    const id = `ft-${frag.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[RED ROOM / FULL TRUTH] ${frag.title}`,
      text: frag.clueText,
      sourceRoute: "/red-room/full-truth",
      confidence: frag.isBait ? 2 : 3,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])

    // Unlock next fragment
    const idx = TRUTH_FRAGMENTS.findIndex((f) => f.id === frag.id)
    if (idx < TRUTH_FRAGMENTS.length - 1) {
      setUnlockedFragments((prev) => {
        const next = TRUTH_FRAGMENTS[idx + 1].id
        return prev.includes(next) ? prev : [...prev, next]
      })
    }
    // Reveal token after all 3
    const newSaved = [...savedClues, id]
    if (TRUTH_FRAGMENTS.every((f) => newSaved.includes(`ft-${f.id}`))) {
      setTokenRevealed(true)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>
          ← RED ROOM
        </Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="ПЪЛНАТА ИСТИНА" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      {/* Warning banner */}
      <div style={{ padding: "12px 16px", background: "#0d0000", border: `1px solid ${ACCENT}30`, marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.12em", marginBottom: 6 }}>
          ⚠ СИСТЕМНО ПРЕДУПРЕЖДЕНИЕ
        </div>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>
          Тази страница съдържа <span style={{ color: ACCENT }}>truth fragments</span> — отключват се последователно. Събери и трите, за да получиш token. Внимавай: не всичко тук е истина.
        </p>
      </div>

      {/* Bait intro text */}
      <div style={{ padding: "16px 18px", background: "#080808", border: "1px solid #1e1e1e", marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 10 }}>
          АНАЛИЗ // ВЕРСИЯ 1.0
        </div>
        <p style={{ fontSize: 12, color: "#d0d0d0", lineHeight: 1.8, margin: 0, fontFamily: "var(--font-mono)" }}>
          „Истината не е сложна — шофьорът е и похитителят. Търси човека, който я е качил в колата, не този, който стои зад него. Лора е в стаята, защото NightKiller я е завел там."
        </p>
        <div style={{ marginTop: 10, fontSize: 9, fontFamily: "var(--font-mono)", color: "#444" }}>
          — автоматично генерирано от SYSTEM // NODE-7
        </div>
      </div>

      {/* Fragments */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRUTH_FRAGMENTS.map((frag, idx) => {
          const isUnlocked = unlockedFragments.includes(frag.id)
          const isSaved = savedClues.includes(`ft-${frag.id}`)
          return (
            <div key={frag.id} style={{
              border: `1px solid ${isUnlocked ? (frag.isBait ? "#FF880030" : "#333") : "#1a1a1a"}`,
              background: isUnlocked ? "#090909" : "#050505",
              position: "relative", overflow: "hidden",
            }}>
              {frag.isBait && isUnlocked && (
                <div style={{ position: "absolute", top: 0, right: 0, padding: "3px 8px", background: "#FF880020", fontSize: 7, fontFamily: "var(--font-mono)", color: "#FF880090", letterSpacing: "0.15em" }}>
                  UNVERIFIED
                </div>
              )}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: isUnlocked ? "#666" : "#333", letterSpacing: "0.15em", marginBottom: 8 }}>
                  FRAGMENT {String(idx + 1).padStart(2, "0")} / {isUnlocked ? "DECRYPTED" : "LOCKED"}
                </div>
                <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: isUnlocked ? "#e0e0e0" : "#2a2a2a", fontWeight: 700, marginBottom: isUnlocked ? 10 : 0, letterSpacing: "0.06em" }}>
                  {frag.title}
                </div>
                {isUnlocked && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <p style={{ fontSize: 11, color: "#b0b0b0", lineHeight: 1.8, margin: "0 0 12px", fontFamily: "var(--font-mono)", whiteSpace: "pre-line" }}>
                        {frag.content}
                      </p>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => handleSave(frag)}
                          style={{
                            padding: "5px 12px", fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                            background: isSaved ? `${ACCENT}18` : "#111",
                            color: isSaved ? ACCENT : "#777",
                            border: `1px solid ${isSaved ? ACCENT + "50" : "#282828"}`,
                          }}>
                          {isSaved ? "✓ SAVED" : "SAVE CLUE"}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
                {!isUnlocked && (
                  <div style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                    [Отключва се след предишен fragment]
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Token reveal */}
      <AnimatePresence>
        {tokenRevealed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ marginTop: 24, padding: "16px 18px", background: "#0a0000", border: `2px solid ${ACCENT}40` }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.2em", marginBottom: 10 }}>
              TOKEN ГЕНЕРИРАН
            </div>
            <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "#e0e0e0", letterSpacing: "0.1em", marginBottom: 8 }}>
              red-room-route-token
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.06em", padding: "6px 10px", background: "#120000", border: `1px solid ${ACCENT}30` }}>
              route-17-night
            </div>
            <p style={{ fontSize: 10, color: "#888", margin: "10px 0 0", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
              Използвай този token в <Link href="/hidden-wiki-2/trace-node/terminal" style={{ color: ACCENT }}>TRACE-NODE /terminal</Link>. Внимание: резултатът може да не е правилен.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
