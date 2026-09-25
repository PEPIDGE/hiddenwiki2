"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import { PageHeader } from "@/components/tor/ui"
import s from "./forum.module.css"

const ACCENT = "#00FF41"


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

  const flagged = THREADS.filter((t) => t.flagged).length

  return (
    <div className={s.page}>
      <PageHeader
        title="FORUM"
        accent={ACCENT}
        kicker="FORUM — ANONYMOUS BOARD // NODE: FRM-ANON"
        intro="Анонимна дъска. Три нишки са маркирани като потенциално верифицируеми. Останалите може да са decoy posts."
        aside={
          <span className="hw-count">
            {THREADS.length} THREADS / {flagged} FLAGGED
          </span>
        }
      />

      <div className={s.board}>
        <div className={s.head}>
          <span>ID</span>
          <span>THREAD</span>
          <span>REPLIES</span>
        </div>

        {THREADS.map((thread, i) => {
          const id = `forum-${thread.id}`
          const isSaved = savedClues.includes(id)
          const isExpanded = expanded === thread.id
          return (
            <motion.div
              key={thread.id}
              className={s.thread}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                type="button"
                className={s.row}
                data-flagged={thread.flagged ? "" : undefined}
                data-open={isExpanded ? "" : undefined}
                onClick={() => setExpanded(isExpanded ? null : thread.id)}
              >
                <span className={s.id}>{thread.id}</span>
                <span style={{ minWidth: 0 }}>
                  <div className={s.title}>{thread.title}</div>
                  <div className={s.preview}>{thread.preview}</div>
                </span>
                <span className={s.replies}>
                  {thread.replies}
                  {isSaved && <span className={s.saved}>SAVED</span>}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className={s.body}>
                      <div className={s.meta}>
                        {thread.author} // {thread.replies} replies
                      </div>
                      <div className={s.text}>{thread.preview}</div>
                      {thread.clue && (
                        <>
                          <div className={s.clue}>
                            <div>ПОТЕНЦИАЛНА УЛИКА</div>
                            <div>{thread.clue}</div>
                          </div>
                          <button
                            type="button"
                            className={s.saveBtn}
                            onClick={(e) => { e.stopPropagation(); handleSave(thread) }}
                            disabled={isSaved}
                          >
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
