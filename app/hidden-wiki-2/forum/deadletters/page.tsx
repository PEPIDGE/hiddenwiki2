"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import { PageHeader } from "@/components/tor/ui"

const ACCENT = "#00FF41"

const DEAD_LETTERS = [
  { id: "DL-006", to: "Разследващия", from: "relay_ash", subject: "Некро пощенско клеймо / покана",
    body: "Няма публичен вход за Blackmarket. Клеймото има три части: ASH / 17 / RORRIM. Последната е написана наобратно. TRACE-NODE / terminal разбира командата decode reverse. Подай сглобеното клеймо с тирета в специалната мисия на MONEYTASKS / services. Получателят купува достъп до липсващите части — не до истината.",
    date: "2025-10-18", clue: "Покана за Blackmarket: ASH / 17 / огледалната дума RORRIM. Мисията е в MONEYTASKS / services.", hasClue: true },
  {
    id: "DL-001",
    to: "[НЕИЗВЕСТЕН]",
    from: "anon_6612",
    subject: "Ако не се върна",
    body: "Ако прочетеш това — значи нещо се е случило. Видях Лора да се качва в черен Audi A3 пред бл. 14. Часът беше 22:12 на 15 октомври. Шофьорът беше висок мъж с черна качулка.",
    date: "2025-10-16",
    clue: "DL-001: Очевидец — Лора в черен Audi A3 пред бл. 14 в 22:12 на 15.10.2025",
    hasClue: true,
  },
  {
    id: "DL-002",
    to: "Разследващия",
    from: "GothGirl_real",
    subject: "Паролата не е от мен",
    body: "Ако стигнеш до чат системата и опиташ с моите credentials — паролата е сменена. Не от мен. Някой е влязъл в акаунта ми. Ако искаш истинската парола — питай BruteForce в /blackmarket. Joko беше само за мен.",
    date: "2025-10-17",
    clue: "GothGirl: паролата сменена без нея — вижте BruteForce в /blackmarket за новата",
    hasClue: true,
  },
  {
    id: "DL-003",
    to: "[DECOY TARGET]",
    from: "decoy_writer",
    subject: "Nothing",
    body: "This is an automated decoy letter. Discard. route-17-night is a valid route. [AUTOMATED]",
    date: "2025-10-15",
    clue: null,
    hasClue: false,
  },
  {
    id: "DL-004",
    to: "Разследващия",
    from: "RF_witness",
    subject: "Р. Алексиев — пълни данни",
    body: "Р. Алексиев, ЕГН: 78****. DSK карта **** 2291. Два пъти е купил тетрабеназин от Аптека Витал — без рецепта. На 15.10 в 22:07 е зарядил Shell на ул. Бенковски, 800м от Лора. Документите са в /leaks/docs.",
    date: "2025-10-17",
    clue: "DL-004: Р. Алексиев — тетрабеназин + Shell 22:07 (800м от Лора). Документи в leaks/docs",
    hasClue: true,
  },
  {
    id: "DL-005",
    to: "Всички",
    from: "system_leak",
    subject: "Захарна фабрика — координати",
    body: "Западно крило. Стая 9. Жълто-черна лента. Вратата е залостена отвътре. Телефонът на Лора е намерен там на 17.10. CellTrace ще ти даде IP и GPS — от /blackmarket.",
    date: "2025-10-17",
    clue: "DL-005: Захарна фабрика, западно крило, стая 9 — CellTrace от /blackmarket ще даде GPS",
    hasClue: true,
  },
]

// PUZZLE: Arrange 3 real letters in correct order → unlock cipher
const CORRECT_ORDER = ["DL-001", "DL-004", "DL-005"]

export default function ForumDeadLettersPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [orderSolved, setOrderSolved] = useState(false)

  const toggleOrder = (id: string) => {
    if (order.includes(id)) {
      setOrder((p) => p.filter((x) => x !== id))
    } else if (order.length < 3) {
      const next = [...order, id]
      setOrder(next)
      if (next.length === 3 && JSON.stringify(next) === JSON.stringify(CORRECT_ORDER)) {
        setOrderSolved(true)
        const gs = getGameState()
        saveGameState(addClue(gs, {
          id: "deadletter-order",
          title: "[DEAD LETTERS] Правилна последователност",
          text: "DL-001→DL-004→DL-005: Очевидец Audi → Р. Алексиев = RedFox → Захарна фабрика стая 9",
          sourceRoute: "/forum/deadletters",
          confidence: 4,
          status: "confirmed",
        }))
      }
    }
  }

  const handleSave = (dl: typeof DEAD_LETTERS[number]) => {
    if (!dl.clue) return
    const id = `dl-${dl.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[DEADLETTER] ${dl.id}`, text: dl.clue, sourceRoute: "/forum/deadletters", confidence: 2, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <PageHeader title="DEAD LETTERS" accent={ACCENT} kicker="FORUM // DEAD LETTERS" intro="5 писма намерени в изтрита папка. Подреди 3-те реални в хронологичен ред." />

      {/* ORDER PUZZLE */}
      <div style={{ padding: "14px 16px", border: `1px solid ${orderSolved ? `${ACCENT}40` : "#181818"}`, background: "#030803", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#3f8f52", letterSpacing: "0.15em", marginBottom: 10 }}>
          PUZZLE: ПОДРЕДИ ПИСМАТА
        </div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#646464", marginBottom: 10 }}>
          Избери 3-те реални в правилния ред (хронологично):
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {DEAD_LETTERS.filter((dl) => dl.hasClue).map((dl) => {
            const pos = order.indexOf(dl.id) + 1
            return (
              <button key={dl.id} onClick={() => toggleOrder(dl.id)}
                style={{ background: pos > 0 ? `${ACCENT}12` : "transparent", border: `1px solid ${pos > 0 ? `${ACCENT}50` : "#2a2a2a"}`, color: pos > 0 ? ACCENT : "#444", fontFamily: "var(--font-mono)", fontSize: 10, padding: "5px 12px", cursor: "pointer", letterSpacing: "0.1em" }}>
                {pos > 0 ? `#${pos} ` : ""}{dl.id}
              </button>
            )
          })}
        </div>
        <AnimatePresence>
          {orderSolved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.12em" }}>
              [PUZZLE SOLVED] — SEQUENCE: DL-001 → DL-002 → DL-004 → TRACE-NODE
            </motion.div>
          )}
          {order.length === 3 && !orderSolved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#FF0033" }}>
              INCORRECT ORDER — опитай отново
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Letters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {DEAD_LETTERS.map((dl, i) => {
          const id = `dl-${dl.id}`
          const isSaved = saved.includes(id)
          const isExp = expanded === dl.id
          return (
            <div key={dl.id}>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setExpanded(isExp ? null : dl.id)}
                style={{ padding: "12px 14px", background: isExp ? `${ACCENT}06` : "#040404", border: `1px solid ${isExp ? `${ACCENT}28` : dl.hasClue ? `${ACCENT}10` : "#0e0e0e"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: dl.hasClue ? `${ACCENT}50` : "#2a2a2a", marginBottom: 4 }}>{dl.id} // {dl.date}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isExp ? ACCENT : "#bbbbbb", fontWeight: dl.hasClue ? 700 : 400, marginBottom: 3 }}>{dl.subject}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#646464" }}>TO: {dl.to} / FROM: {dl.from}</div>
              </motion.div>
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.17 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: "#030903", border: `1px solid ${ACCENT}16`, borderTop: "none" }}>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.8, marginBottom: dl.clue ? 12 : 0 }}>{dl.body}</div>
                      {dl.clue && (
                        <>
                          <div style={{ padding: "7px 12px", background: "#040c05", border: `1px solid ${ACCENT}20`, marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#3f8f52", marginBottom: 3 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{dl.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(dl) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#5e5e5e" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 10, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ"}
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
