"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF9F"

const THREADS = [
  {
    id: "T-001", author: "anon_7731", title: "Видях черния Audi пред 13B", replies: 3, flagged: true,
    posts: [
      { id: "P1", author: "anon_7731", time: "22:04", text: "Паркира точно в 18:30. Шофьорът не излезе. Светлините не се изгасиха. Чакаше някой." },
      { id: "P2", author: "anon_4421", time: "22:09", text: "Сигурен ли си за часа? 18:30 е важно." },
      { id: "P3", author: "anon_7731", time: "22:12", text: "100%. Имам и снимка но GPS е изтрит." },
    ],
    clue: "Очевидец: черен Audi пред 13B в 18:30 — шофьорът не излезе",
  },
  {
    id: "T-002", author: "null_user", title: "calm_voice е реален", replies: 7, flagged: true,
    posts: [
      { id: "P1", author: "null_user", time: "01:14", text: "Чувал съм записа от 22:17. Разпознаваем глас. Не е синтетичен — има характерен breathing pattern." },
      { id: "P2", author: "decoy_bot", time: "01:19", text: "Всичко е AI генерирано. Не вярвайте." },
      { id: "P3", author: "null_user", time: "01:22", text: "Decoy bot потвърди подозренията ми." },
    ],
    clue: "calm_voice = реален оператор — разпознаваем глас с breathing pattern",
  },
  {
    id: "T-003", author: "ARS_watcher", title: "ARS и огледалата са decoy", replies: 0, flagged: false,
    posts: [{ id: "P1", author: "ARS_watcher", time: "17:30", text: "Всичко свързано с ARS е предназначено да те отклони. Не следвай. CIRCUIT-3 е реалният артефакт." }],
    clue: null,
  },
  {
    id: "T-004", author: "system_leak", title: "CIRCUIT-3 е последният архитект", replies: 12, flagged: true,
    posts: [
      { id: "P1", author: "system_leak", time: "03:17", text: "Виена 1891. Транзакцията в 03:17 всяка нощ. Следвай числата, не имената. CIRCUIT-3 = Р.А." },
      { id: "P2", author: "anon_7731", time: "03:19", text: "Р.А. — Румен Алексиев?" },
      { id: "P3", author: "system_leak", time: "03:21", text: "Документирай само това: A_lexiev_contract.pdf" },
    ],
    clue: "CIRCUIT-3 = Р.А. — Румен Алексиев. Транзакция 03:17. Файл: A_lexiev_contract.pdf",
  },
  {
    id: "T-005", author: "decoy_bot", title: "TRACE-NODE е мит", replies: 0, flagged: false,
    posts: [{ id: "P1", author: "decoy_bot", time: "09:00", text: "Няма краен нод. Целта е процесът, не финалът. [AUTOMATED]" }],
    clue: null,
  },
]

export default function ForumThreadsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (t: typeof THREADS[number]) => {
    if (!t.clue) return
    const id = `thread-${t.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[THREAD] ${t.title}`, text: t.clue, sourceRoute: "/forum/threads", confidence: 2, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/forum" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← FORUM</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="THREADS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Разгърни нишка за да прочетеш всички постове.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {THREADS.map((t, i) => {
          const id = `thread-${t.id}`
          const isSaved = saved.includes(id)
          const isExp = expanded === t.id
          return (
            <div key={t.id}>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => setExpanded(isExp ? null : t.id)}
                style={{ padding: "12px 14px", background: isExp ? `${ACCENT}07` : "#040404", border: `1px solid ${isExp ? `${ACCENT}30` : t.flagged ? `${ACCENT}12` : "#0e0e0e"}`, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: t.flagged ? ACCENT : "#2a2a2a", marginBottom: 4 }}>{t.id} // {t.author}</div>
                    <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: isExp ? ACCENT : "#888", fontWeight: t.flagged ? 700 : 400 }}>{t.title}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333" }}>{t.replies} replies</span>
                    {isSaved && <span style={{ fontSize: 6, fontFamily: "var(--font-mono)", color: `${ACCENT}60`, border: `1px solid ${ACCENT}20`, padding: "1px 4px" }}>SAVED</span>}
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                    <div style={{ background: "#030a06", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      {t.posts.map((post, pi) => (
                        <div key={post.id} style={{ padding: "10px 16px", borderBottom: pi < t.posts.length - 1 ? "1px solid #0e0e0e" : "none" }}>
                          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: post.author === t.author ? `${ACCENT}70` : "#2a2a2a", marginBottom: 5 }}>
                            {post.author} // {post.time}
                          </div>
                          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#666", lineHeight: 1.7 }}>{post.text}</div>
                        </div>
                      ))}
                      {t.clue && (
                        <div style={{ padding: "10px 16px", borderTop: "1px solid #111" }}>
                          <div style={{ padding: "7px 10px", background: "#040c07", border: `1px solid ${ACCENT}20`, marginBottom: 8 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a2a", marginBottom: 3 }}>ПОТЕНЦИАЛНА УЛИКА</div>
                            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT }}>{t.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(t) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                          </button>
                        </div>
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
