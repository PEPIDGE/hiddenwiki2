"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF9F"

const THREADS = [
  {
    id: "T-001", author: "anon_6612", title: "Видях черния Audi пред бл. 14 в 22:09", replies: 5, flagged: true,
    posts: [
      { id: "P1", author: "anon_6612", time: "22:14", text: "Паркира пред бл. 14 в 22:09. Шофьорът не излезе. Двигателят не се изгаси. Светлините бяха наполовина. Чакаше." },
      { id: "P2", author: "anon_4421", time: "22:18", text: "Сигурен ли си за часа? 22:09 е точно преди изчезването." },
      { id: "P3", author: "anon_6612", time: "22:21", text: "100%. Табелата беше СА ○○○○ — нещо 4 цифри. Черен A3 или A4." },
      { id: "P4", author: "anon_6612", time: "22:28", text: "Лора слезе около 22:12. Отиде към колата. Повече не я видях." },
      { id: "P5", author: "mod_01", time: "23:00", text: "[MOD] Тема маркирана за преглед." },
    ],
    clue: "Очевидец: черен Audi пред бл. 14 в 22:09 — Лора се качи около 22:12",
  },
  {
    id: "T-002", author: "null_user", title: "GothGirl е компрометирана", replies: 4, flagged: true,
    posts: [
      { id: "P1", author: "null_user", time: "01:14", text: "Паролата на GothGirl е сменена без нейно знание на 12.10. Тя не знае. Някой е влязъл в акаунта й." },
      { id: "P2", author: "DataCracker6_real", time: "01:19", text: "Потвърждавам. Логовете показват вход от непознат IP в 03:17 на 12.10." },
      { id: "P3", author: "null_user", time: "01:24", text: "Новата парола може да се разбие. Вижте /blackmarket — BruteForce." },
      { id: "P4", author: "mod_01", time: "02:00", text: "[MOD] Тема маркирана." },
    ],
    clue: "GothGirl — паролата сменена без знанието й на 12.10. Нов IP в 03:17. Решение: BruteForce в /blackmarket",
  },
  {
    id: "T-003", author: "NullSyn_watcher", title: "NullSyn дава фалшиви координати", replies: 0, flagged: false,
    posts: [
      { id: "P1", author: "NullSyn_watcher", time: "17:30", text: "NullSyn е компрометиран (HOPS=2 в /cult/operators). Документите от него са фалшиви. route-17-night = decoy. Не следвай." },
    ],
    clue: null,
  },
  {
    id: "T-004", author: "system_leak", title: "Захарна фабрика — западно крило, стая 9", replies: 9, flagged: true,
    posts: [
      { id: "P1", author: "system_leak", time: "10:00", text: "Получих сигнал от охранителна камера. 01:30 на 16.10 — движение в западното крило на Захарна фабрика." },
      { id: "P2", author: "anon_6612", time: "10:05", text: "Лора беше ли там?" },
      { id: "P3", author: "system_leak", time: "10:09", text: "Телефонът й е намерен там на 17.10. Стая 9. Жълто-черна лента на вратата." },
      { id: "P4", author: "RF_witness", time: "11:00", text: "Потвърждавам — 3 превозни средства излязоха от западния вход в 02:15." },
    ],
    clue: "Захарна фабрика — западно крило, стая 9. Телефонът на Лора намерен 17.10. Три коли излязоха в 02:15",
  },
  {
    id: "T-005", author: "RF_witness", title: "RedFox = Р. Алексиев — тетрабеназин", replies: 2, flagged: true,
    posts: [
      { id: "P1", author: "RF_witness", time: "14:00", text: "Видях разписката. Р. Алексиев е купил тетрабеназин (наркотик, потиска движението) два пъти от Аптека Витал — без рецепта. Последно: 10.10.2025." },
      { id: "P2", author: "anon_4421", time: "14:10", text: "Тетрабеназин... това е лекарство за потискане на волевото движение. Може да се използва за... задържане?" },
    ],
    clue: "RF_witness: Р. Алексиев купи тетрабеназин (наркотик) без рецепта от Аптека Витал — 10.10.2025",
  },
  {
    id: "T-006", author: "decoy_bot", title: "Всичко е измислено — спрете", replies: 0, flagged: false,
    posts: [{ id: "P1", author: "decoy_bot", time: "09:00", text: "Спрете да търсите. Няма случай. [AUTOMATED MESSAGE — IGNORE]" }],
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
