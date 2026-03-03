"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#CC44FF"

const SUBLINKS = [
  { label: "/ DOCTRINE", href: "/hidden-wiki-2/cult/doctrine" },
  { label: "/ RITUAL", href: "/hidden-wiki-2/cult/ritual" },
  { label: "/ STATUS", href: "/hidden-wiki-2/cult/status" },
  { label: "/ OPERATORS", href: "/hidden-wiki-2/cult/operators" },
]

const DOCTRINE = [
  {
    id: "D-01",
    title: "Закон на Огледалото",
    text: "Всеки участник поддържа огледална идентичност. Реалното и отражението са равнозначни.",
    clue: null,
  },
  {
    id: "D-02",
    title: "Протокол за Транзит",
    text: "При транзит: автомобилът трябва да е тъмен, вход само в 18:30 или 22:17. Апартамент [REDACTED].",
    clue: "Докрина: транзит само в 18:30 или 22:17",
  },
  {
    id: "D-03",
    title: "Нивова Йерархия",
    text: "Три нива: Посветен / Оператор / Архитект. Архитектът е известен само като CIRCUIT-3.",
    clue: "CIRCUIT-3 = Архитект на Кръга",
  },
  {
    id: "D-04",
    title: "Правило на Мълчанието",
    text: "Комуникация само чрез relay nodes с HOPS=3. Всеки с HOPS≠3 е компрометиран или decoy.",
    clue: "HOPS=3 — задължително изискване. По-малко или повече = decoy",
  },
  {
    id: "D-05",
    title: "Финалният Преход",
    text: "Три потвърдени доказателства активират TRACE-NODE. Последователност: [REDACTED]→[REDACTED]→[REDACTED].",
    clue: "3 потвърдени улики активират TRACE-NODE",
  },
]

export default function CultPage() {
  const pathname = usePathname()
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const gs = getGameState()
    setSavedClues(gs.clues.map((c) => c.id))
    setProgress(gs.progress)
  }, [])

  const handleSave = (entry: typeof DOCTRINE[number]) => {
    if (!entry.clue) return
    const id = `cult-${entry.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[CULT] ${entry.title}`,
      text: entry.clue,
      sourceRoute: "/cult",
      confidence: 4,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.35em", marginBottom: 8 }}>
            CULT — THE CIRCLE // ВЪТРЕШЕН ДОКУМЕНТ
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, background: ACCENT, opacity: 0.5, boxShadow: `0 0 8px ${ACCENT}` }} />
            <GlitchText text="CULT" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          </div>
        </div>
        <div style={{ padding: "8px 14px", border: `1px solid ${ACCENT}15`, background: "#0a0310", fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}50`, letterSpacing: "0.1em" }}>
          РИТУАЛЕН ПРОГРЕС: {progress}%
        </div>
      </div>

      <div style={{ display: "flex", gap: 1, marginBottom: 28, flexWrap: "wrap" }}>
        {SUBLINKS.map((link) => {
          const isCurrent = pathname?.startsWith(link.href)
          return (
            <Link key={link.label} href={link.href} style={{
              padding: "7px 14px", fontSize: 9, fontFamily: "var(--font-mono)",
              color: isCurrent ? ACCENT : "#333333", letterSpacing: "0.12em",
              textDecoration: "none", background: isCurrent ? `${ACCENT}10` : "#070707",
              border: `1px solid ${isCurrent ? `${ACCENT}35` : "#181818"}`,
            }}
              onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.color = "#333333" }}>
              {link.label}
            </Link>
          )
        })}
      </div>

      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 28, maxWidth: 540, paddingLeft: 12, borderLeft: "2px solid #200030" }}>
        Доктринален архив на Кръга. Петте закона съдържат оперативни правила
        и укрити препратки към Canon котвите.
      </div>

      {/* Cult symbol */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 64, height: 64, border: `1px solid ${ACCENT}15`, transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", width: 40, height: 40, border: `1px solid ${ACCENT}25` }} />
          <div style={{ width: 8, height: 8, background: `${ACCENT}30`, border: `1px solid ${ACCENT}40` }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {DOCTRINE.map((entry, i) => {
          const id = `cult-${entry.id}`
          const isSaved = savedClues.includes(id)
          const isExpanded = expanded === entry.id
          return (
            <div key={entry.id}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setExpanded(isExpanded ? null : entry.id)}
                style={{
                  padding: "14px 16px",
                  background: isExpanded ? `${ACCENT}07` : "#050505",
                  border: `1px solid ${isExpanded ? `${ACCENT}30` : entry.clue ? `${ACCENT}12` : "#111111"}`,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {entry.clue && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: ACCENT, opacity: 0.3 }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.15em", marginBottom: 5 }}>ЗАКОН {entry.id}</div>
                    <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: isExpanded ? ACCENT : "#888888", fontWeight: 700 }}>{entry.title}</div>
                  </div>
                  {isSaved && <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a4a2a", border: "1px solid #1a3a1a", padding: "2px 6px", flexShrink: 0 }}>SAVED</span>}
                </div>
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "12px 16px", background: "#060208", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#666666", lineHeight: 1.8, marginBottom: entry.clue ? 12 : 0 }}>{entry.text}</div>
                      {entry.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#080310", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a1050", letterSpacing: "0.12em", marginBottom: 4 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{entry.clue}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSave(entry) }}
                            disabled={isSaved}
                            style={{
                              background: "transparent", border: `1px solid ${isSaved ? "#222222" : `${ACCENT}40`}`,
                              color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)",
                              fontSize: 9, letterSpacing: "0.1em", padding: "7px 18px", cursor: isSaved ? "default" : "pointer",
                            }}
                          >
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
