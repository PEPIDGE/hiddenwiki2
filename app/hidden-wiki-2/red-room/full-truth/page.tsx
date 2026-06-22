"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"
const AMBER = "#FFB000"

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

  const savedCount = TRUTH_FRAGMENTS.filter((f) => savedClues.includes(`ft-${f.id}`)).length

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.12em", textDecoration: "none" }}>
          ← RED ROOM
        </Link>
        <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <GlitchText text="ПЪЛНАТА ИСТИНА" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.1em" }}>
            {savedCount}/3 ФРАГМЕНТА
          </span>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 10 }} />
      </div>

      {/* Warning banner */}
      <div style={{ display: "flex", gap: 12, padding: "14px 16px", background: `${ACCENT}0a`, border: `1px solid ${ACCENT}40`, marginBottom: 26 }}>
        <div style={{ flexShrink: 0, fontSize: 18, color: ACCENT, lineHeight: 1.2 }}>⚠</div>
        <div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.16em", marginBottom: 6, fontWeight: 700 }}>
            СИСТЕМНО ПРЕДУПРЕЖДЕНИЕ
          </div>
          <p style={{ fontSize: 12, color: "#d6d6d6", margin: 0, lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>
            Страницата съдържа <span style={{ color: ACCENT, fontWeight: 700 }}>truth fragments</span>, които се отключват последователно. Събери и трите, за да получиш token. Не всичко тук е истина.
          </p>
        </div>
      </div>

      {/* Bait / system analysis card */}
      <div style={{ background: "#0a0807", border: `1px solid ${AMBER}33`, marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: `1px solid ${AMBER}22`, background: `${AMBER}0a` }}>
          <span style={{ width: 6, height: 6, background: AMBER, boxShadow: `0 0 6px ${AMBER}` }} />
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: AMBER, letterSpacing: "0.2em", fontWeight: 700 }}>
            АНАЛИЗ // ВЕРСИЯ 1.0
          </span>
          <span style={{ marginLeft: "auto", fontSize: 9, fontFamily: "var(--font-mono)", color: `${AMBER}aa`, letterSpacing: "0.12em" }}>
            UNVERIFIED
          </span>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 13, color: "#e6e6e6", lineHeight: 1.85, margin: 0, fontFamily: "var(--font-mono)", fontStyle: "italic" }}>
            „Истината не е сложна — шофьорът е и похитителят. Търси човека, който я е качил в колата, не този, който стои зад него. Лора е в стаята, защото NightKiller я е завел там."
          </p>
          <div style={{ marginTop: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", letterSpacing: "0.05em" }}>
            — автоматично генерирано от SYSTEM // NODE-7
          </div>
        </div>
      </div>

      {/* Fragments */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRUTH_FRAGMENTS.map((frag, idx) => {
          const isUnlocked = unlockedFragments.includes(frag.id)
          const isSaved = savedClues.includes(`ft-${frag.id}`)
          const edgeColor = !isUnlocked ? "#1c1c1c" : frag.isBait ? AMBER : ACCENT
          return (
            <div key={frag.id} style={{
              border: `1px solid ${isUnlocked ? edgeColor + "44" : "#181818"}`,
              borderLeft: `3px solid ${isUnlocked ? edgeColor : "#181818"}`,
              background: isUnlocked ? "#0a0a0a" : "#060606",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                {/* Index badge */}
                <div style={{
                  flexShrink: 0, width: 52,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderRight: `1px solid ${isUnlocked ? edgeColor + "22" : "#141414"}`,
                  background: isUnlocked ? `${edgeColor}0a` : "transparent",
                  gap: 3,
                }}>
                  <span style={{ fontSize: 18, fontFamily: "var(--font-mono)", fontWeight: 700, color: isUnlocked ? edgeColor : "#2e2e2e" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 12, color: isUnlocked ? edgeColor : "#2e2e2e" }}>
                    {isUnlocked ? "🔓" : "🔒"}
                  </span>
                </div>

                {/* Body */}
                <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: isUnlocked ? "#a8a8a8" : "#444", letterSpacing: "0.16em" }}>
                      FRAGMENT {String(idx + 1).padStart(2, "0")} / {isUnlocked ? "DECRYPTED" : "LOCKED"}
                    </span>
                    {frag.isBait && isUnlocked && (
                      <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: AMBER, border: `1px solid ${AMBER}55`, padding: "1px 7px", letterSpacing: "0.12em" }}>
                        UNVERIFIED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: isUnlocked ? "#f0f0f0" : "#3a3a3a", fontWeight: 700, marginBottom: isUnlocked ? 10 : 0, letterSpacing: "0.04em" }}>
                    {isUnlocked ? frag.title : "████████████"}
                  </div>
                  {isUnlocked ? (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <p style={{ fontSize: 13, color: "#cfcfcf", lineHeight: 1.8, margin: "0 0 14px", fontFamily: "var(--font-mono)", whiteSpace: "pre-line" }}>
                        {frag.content}
                      </p>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => handleSave(frag)}
                          style={{
                            padding: "7px 16px", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", fontWeight: 700,
                            background: isSaved ? `${ACCENT}1a` : "#141414",
                            color: isSaved ? ACCENT : "#dcdcdc",
                            border: `1px solid ${isSaved ? ACCENT + "60" : "#3a3a3a"}`,
                            cursor: isSaved ? "default" : "pointer",
                            transition: "all 0.12s",
                          }}>
                          {isSaved ? "✓ ЗАПАЗЕНА" : "ЗАПАЗИ УЛИКА"}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "var(--font-mono)", marginTop: 4, letterSpacing: "0.04em" }}>
                      [Отключва се след предишния фрагмент]
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Token reveal */}
      <AnimatePresence>
        {tokenRevealed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ marginTop: 24, background: `${ACCENT}08`, border: `1px solid ${ACCENT}55`, boxShadow: `0 0 22px ${ACCENT}1a` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${ACCENT}33`, background: `${ACCENT}0d` }}>
              <span style={{ width: 7, height: 7, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`, animation: "pulse-glow 2s infinite" }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.22em", fontWeight: 700 }}>
                TOKEN ГЕНЕРИРАН
              </span>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.12em", marginBottom: 8 }}>
                red-room-route-token
              </div>
              <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.08em", padding: "10px 14px", background: "#120000", border: `1px solid ${ACCENT}40`, fontWeight: 700 }}>
                route-17-night
              </div>
              <p style={{ fontSize: 12, color: "#cccccc", margin: "12px 0 0", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                Използвай този token в <Link href="/hidden-wiki-2/trace-node/terminal" style={{ color: ACCENT, fontWeight: 700 }}>TRACE-NODE /terminal</Link>. Внимание: резултатът може да не е правилен.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
