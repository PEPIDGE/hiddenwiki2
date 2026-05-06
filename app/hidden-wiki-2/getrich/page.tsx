"use client"

import { useState, useEffect } from "react"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, addCoins, getCoins } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

const ACCENT = "#00FF41"

const MISSIONS = [
  {
    id: "gr-001",
    title: "Намери изтеклата карта",
    description: "Влез в /leaks/cards. Намери картата на заподозрян. Сравни покупките с известна информация. Подай картата като решение.",
    reward: 50,
    difficulty: "MEDIUM",
    link: "/hidden-wiki-2/leaks/cards",
    status: "ACTIVE",
  },
  {
    id: "gr-002",
    title: "Проследи изчезналия",
    description: "Проследи човек по снимки, покупки и телефонен номер. Използвай /leaks/archive, /leaks/cards и /leaks/phones.",
    reward: 70,
    difficulty: "HARD",
    link: "/hidden-wiki-2/leaks",
    status: "ACTIVE",
  },
  {
    id: "gr-003",
    title: "Колите на бандата",
    description: "Отиди в /leaks/vehicles. Сравни марки, номера и телефони. Намери 3-те свързани реда.",
    reward: 80,
    difficulty: "HARD",
    link: "/hidden-wiki-2/leaks/vehicles",
    status: "ACTIVE",
  },
  {
    id: "gr-004",
    title: "Покани за събитие",
    description: "Свържи код от покана към правилен event. Проверявай /events/calendar.",
    reward: 20,
    difficulty: "EASY",
    link: "/hidden-wiki-2/events/calendar",
    status: "ACTIVE",
  },
  {
    id: "gr-005",
    title: "Гостите се повтарят",
    description: "Сравни гuestbook имена от различни event-и. Намери кои потребители се появяват повече от веднъж.",
    reward: 15,
    difficulty: "EASY",
    link: "/hidden-wiki-2/events",
    status: "ACTIVE",
  },
  {
    id: "gr-006",
    title: "Клевети или истини",
    description: "Прочети forum постове и ги подреди по достоверност. Учи се да разграничаваш сигнал от шум.",
    reward: 10,
    difficulty: "EASY",
    link: "/hidden-wiki-2/forum",
    status: "ACTIVE",
  },
  {
    id: "gr-007",
    title: "Телефон и времева линия",
    description: "Сравни call logs, chat дати и event timeline. Намери кой номер съвпада най-много с нужния човек.",
    reward: 25,
    difficulty: "MEDIUM",
    link: "/hidden-wiki-2/leaks/phones",
    status: "ACTIVE",
  },
  {
    id: "gr-008",
    title: "Hidden Wiki 2 Page Code",
    description: "Открий личния page code скрит някъде в сайта. Може да е нужен за Blackmarket restore услуга.",
    reward: 20,
    difficulty: "MEDIUM",
    link: "/hidden-wiki-2",
    status: "ACTIVE",
  },
  {
    id: "gr-009",
    title: "Грешният fragment",
    description: "Разпознай кой GPS fragment дава координати на грешен човек и кой е напълно фалшив.",
    reward: 30,
    difficulty: "HARD",
    link: "/hidden-wiki-2/leaks/docs",
    status: "ACTIVE",
  },
  {
    id: "gr-010",
    title: "Кой cult е front",
    description: "Свържи front event名 с реалната секта зад него. Провери /events и /cult.",
    reward: 20,
    difficulty: "EASY",
    link: "/hidden-wiki-2/cult",
    status: "ACTIVE",
  },
]

const DIFF_COLORS: Record<string, string> = {
  EASY: "#00FF41",
  MEDIUM: "#FFD700",
  HARD: "#FF6B00",
}

export default function GetRichPage() {
  const [coins, setCoins] = useState(0)
  const [claimed, setClaimed] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    const gs = getGameState()
    setCoins(getCoins(gs))
    const stored = localStorage.getItem("gr_claimed")
    if (stored) setClaimed(new Set(JSON.parse(stored)))
  }, [])

  const handleClaim = (missionId: string, reward: number) => {
    if (claimed.has(missionId)) return
    const gs = getGameState()
    addCoins(gs, reward)
    const updated = getGameState()
    setCoins(getCoins(updated))
    const next = new Set([...claimed, missionId])
    setClaimed(next)
    localStorage.setItem("gr_claimed", JSON.stringify([...next]))
    setFlash(missionId)
    setTimeout(() => setFlash(null), 1800)
  }

  const totalEarnable = MISSIONS.reduce((s, m) => s + m.reward, 0)
  const totalEarned = MISSIONS.filter((m) => claimed.has(m.id)).reduce((s, m) => s + m.reward, 0)

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888", letterSpacing: "0.35em", marginBottom: 8 }}>
          HIDDEN WIKI 2 // GETRICH // EARN HIDDEN COINS
        </div>
        <GlitchText text="GETRICH" as="h1" intensity="low" className="text-4xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      {/* Balance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#111", marginBottom: 28 }}>
        <div style={{ background: "#080808", padding: "20px 24px" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#666", letterSpacing: "0.2em", marginBottom: 8 }}>БАЛАНС</div>
          <div style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 900, color: ACCENT, letterSpacing: "0.05em" }}>
            {coins.toLocaleString("bg-BG")} HC
          </div>
        </div>
        <div style={{ background: "#080808", padding: "20px 24px" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#666", letterSpacing: "0.2em", marginBottom: 8 }}>СПЕЧЕЛЕНИ</div>
          <div style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 900, color: "#FFD700" }}>
            {totalEarned} HC
          </div>
        </div>
        <div style={{ background: "#080808", padding: "20px 24px" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#666", letterSpacing: "0.2em", marginBottom: 8 }}>МИСИИ</div>
          <div style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 900, color: "#aaa" }}>
            {claimed.size}/{MISSIONS.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888", letterSpacing: "0.15em" }}>ПРОГРЕС</span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT }}>{totalEarned}/{totalEarnable} HC</span>
        </div>
        <div style={{ height: 3, background: "#111" }}>
          <motion.div
            animate={{ width: `${(totalEarned / totalEarnable) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}80)` }}
          />
        </div>
      </div>

      {/* Notice */}
      <div style={{ padding: "12px 16px", background: "#080808", border: `1px solid ${ACCENT}20`, marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
          Изпълнявай мисии за да спечелиш <span style={{ color: ACCENT, fontWeight: 700 }}>Hidden Coins (HC)</span>.
          Монетите се харчат в <span style={{ color: "#FF6B00" }}>/blackmarket</span> за услуги като BruteForce, PageGhost, CardForge и CellTrace.
        </p>
      </div>

      {/* Missions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {MISSIONS.map((mission) => {
          const isClaimed = claimed.has(mission.id)
          const isFlashing = flash === mission.id
          return (
            <motion.div
              key={mission.id}
              layout
              style={{
                background: isClaimed ? "#060f06" : "#080808",
                border: `1px solid ${isClaimed ? `${ACCENT}30` : "#1e1e1e"}`,
                padding: "18px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              {/* Left */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.15em",
                    color: DIFF_COLORS[mission.difficulty], border: `1px solid ${DIFF_COLORS[mission.difficulty]}40`,
                    padding: "1px 7px",
                  }}>{mission.difficulty}</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.1em" }}>{mission.id}</span>
                </div>
                <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 700, color: isClaimed ? ACCENT : "#e0e0e0", marginBottom: 8, letterSpacing: "0.04em" }}>
                  {isClaimed ? "✓ " : ""}{mission.title}
                </div>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 10px", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                  {mission.description}
                </p>
                <a
                  href={mission.link}
                  style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.1em", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                >
                  → {mission.link}
                </a>
              </div>

              {/* Right */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontFamily: "var(--font-mono)", fontWeight: 900, color: isClaimed ? ACCENT : "#FFD700", letterSpacing: "0.05em" }}>
                  +{mission.reward} HC
                </div>
                <AnimatePresence>
                  {isFlashing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}
                    >
                      +{mission.reward} HC ДОБАВЕНИ!
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => handleClaim(mission.id, mission.reward)}
                  disabled={isClaimed}
                  style={{
                    padding: "8px 20px", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                    background: isClaimed ? `${ACCENT}10` : "#0a1a0a",
                    color: isClaimed ? ACCENT : "#00FF41",
                    border: `1px solid ${isClaimed ? `${ACCENT}30` : ACCENT}`,
                    cursor: isClaimed ? "default" : "pointer",
                    fontWeight: 700,
                    opacity: isClaimed ? 0.7 : 1,
                  }}
                >
                  {isClaimed ? "✓ ВЗЕТО" : "ВЗЕМИ НАГРАДАТА"}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, padding: "12px 16px", background: "#060606", border: "1px solid #181818" }}>
        <p style={{ fontSize: 11, color: "#666", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          HIDDEN COINS не могат да бъдат изтеглени. Те са вътрешна валута за закупуване на услуги в разследването.
          Харчи ги умно — всяка услуга в Blackmarket струва HC.
        </p>
      </div>
    </div>
  )
}
