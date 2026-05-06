"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF9F"

const SUBLINKS = [
  { label: "/ THREADS", href: "/hidden-wiki-2/forum/threads" },
  { label: "/ CONFESSIONS", href: "/hidden-wiki-2/forum/confessions" },
  { label: "/ DEADLETTERS", href: "/hidden-wiki-2/forum/deadletters" },
]

const THREADS = [
  {
    id: "T-001",
    author: "anon_6612",
    title: "Видях черния Audi пред бл. 14 в 22:09",
    preview: "Паркира и зачака. Шофьорът не излезе. 3 минути по-късно Лора слезе долу.",
    replies: 5,
    flagged: true,
    clue: "Очевидец: черен Audi пред бл. 14 в 22:09 — Лора слезе 3 мин по-късно",
  },
  {
    id: "T-002",
    author: "null_user",
    title: "GothGirl е компрометирана",
    preview: "Паролата й е сменена без нейно знание. Някой я е заменил 3 дни преди операцията.",
    replies: 4,
    flagged: true,
    clue: "GothGirl — паролата сменена без знанието й 3 дни преди 15.10.2025",
  },
  {
    id: "T-003",
    author: "NullSyn_watcher",
    title: "NullSyn дава фалшиви координати — ВНИМАНИЕ",
    preview: "route-17-night е decoy. NullSyn е компрометиран (HOPS=2). Не следвай координатите.",
    replies: 0,
    flagged: false,
    clue: null,
  },
  {
    id: "T-004",
    author: "system_leak",
    title: "Захарна фабрика — западно крило, стая 9",
    preview: "Потвърден сигнал 01:30 на 16.10. Телефонът на Лора намерен там 17.10.",
    replies: 9,
    flagged: true,
    clue: "Захарна фабрика — западно крило стая 9. Потвърден сигнал 01:30 на 16.10",
  },
  {
    id: "T-005",
    author: "RF_witness",
    title: "RedFox = Р. Алексиев — тетрабеназин",
    preview: "Купи тетрабеназин без рецепта от Аптека Витал. Два пъти. Последният — 10.10.2025.",
    replies: 2,
    flagged: true,
    clue: "RF_witness: RedFox = Р. Алексиев — купи тетрабеназин без рецепта от Аптека Витал",
  },
  {
    id: "T-006",
    author: "decoy_bot",
    title: "Всичко е измислено — разследването е игра",
    preview: "Спрете да търсите. Няма случай. [AUTOMATED]",
    replies: 0,
    flagged: false,
    clue: null,
  },
]

export default function ForumPage() {
  const pathname = usePathname()
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (thread: typeof THREADS[number]) => {
    if (!thread.clue) return
    const id = `forum-${thread.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[FORUM] ${thread.title}`,
      text: thread.clue,
      sourceRoute: "/forum",
      confidence: 2,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.35em", marginBottom: 8 }}>
            FORUM — ANONYMOUS BOARD // NODE: FRM-ANON
          </div>
          <GlitchText text="FORUM" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ padding: "8px 14px", border: `1px solid ${ACCENT}15`, background: "#00100a", fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}50`, letterSpacing: "0.1em" }}>
          {THREADS.length} THREADS / {THREADS.filter((t) => t.flagged).length} FLAGGED
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

      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 24, maxWidth: 540, paddingLeft: 12, borderLeft: "2px solid #001a0d" }}>
        Анонимна дъска. Три нишки са маркирани като потенциално верифицируеми.
        Останалите може да са decoy posts.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 60px", gap: 8, padding: "6px 12px", background: "#0a0a0a", borderBottom: "1px solid #181818" }}>
          {["ID", "THREAD", "REPLIES"].map((h) => (
            <div key={h} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>{h}</div>
          ))}
        </div>

        {THREADS.map((thread, i) => {
          const id = `forum-${thread.id}`
          const isSaved = savedClues.includes(id)
          const isExpanded = expanded === thread.id
          return (
            <div key={thread.id}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setExpanded(isExpanded ? null : thread.id)}
                style={{
                  display: "grid", gridTemplateColumns: "70px 1fr 60px", gap: 8,
                  padding: "11px 12px",
                  background: isExpanded ? `${ACCENT}07` : "#040404",
                  border: `1px solid ${isExpanded ? `${ACCENT}30` : thread.flagged ? `${ACCENT}10` : "#0e0e0e"}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: thread.flagged ? ACCENT : "#2a2a2a" }}>{thread.id}</div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: isExpanded ? ACCENT : "#bbbbbb", fontWeight: thread.flagged ? 700 : 400, marginBottom: 3 }}>
                    {thread.title}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444444" }}>{thread.preview.slice(0, 60)}...</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333" }}>{thread.replies}</span>
                  {isSaved && <span style={{ fontSize: 6, fontFamily: "var(--font-mono)", color: "#2a4a2a", border: "1px solid #1a3a1a", padding: "1px 4px" }}>SAVED</span>}
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
                    <div style={{ padding: "12px 16px", background: "#030a06", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.12em", marginBottom: 6 }}>
                        {thread.author} // {thread.replies} replies
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.8, marginBottom: thread.clue ? 12 : 0 }}>
                        {thread.preview}
                      </div>
                      {thread.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#040c07", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a3a2a", letterSpacing: "0.12em", marginBottom: 4 }}>ПОТЕНЦИАЛНА УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{thread.clue}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSave(thread) }}
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
