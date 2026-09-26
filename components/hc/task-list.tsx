"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { usePlayer } from "@/lib/hc/client"
import type { PublicTask } from "@/lib/hc/types"

const ACCENT = "#00FF41"
const DIFF: Record<string, string> = { EASY: "#00FF41", MEDIUM: "#FFD700", HARD: "#FF6B00" }

export function TaskList({ category }: { category: PublicTask["category"] }) {
  const { tasks, authenticated } = usePlayer()
  const items = useMemo(() => tasks.filter((t) => t.category === category), [tasks, category])

  if (!authenticated) {
    return (
      <div style={{ padding: "16px 18px", border: `1px solid ${ACCENT}30`, background: "#080808", fontFamily: "var(--font-mono)", color: "#c0c0c0", fontSize: 12, lineHeight: 1.7 }}>
        Влез с код за достъп, за да събираш Hidden Coins от тези задачи.
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}

function TaskCard({ task }: { task: PublicTask }) {
  const { player, claim } = usePlayer()
  const done = player?.completedTasks.includes(task.id) ?? false

  const [answer, setAnswer] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)
  const [showHint, setShowHint] = useState(false)

  const submit = async () => {
    if (busy || done || !answer.trim()) return
    setBusy(true)
    setMsg(null)
    const res = await claim(task.id, answer.trim())
    setBusy(false)
    if (res.ok && res.outcome === "correct") {
      setMsg({ kind: "ok", text: `+${res.reward} HC добавени!` })
      setAnswer("")
    } else if (res.outcome === "already") {
      setMsg({ kind: "ok", text: "Вече е взето." })
    } else {
      setMsg({ kind: "err", text: res.error ?? "Грешен отговор." })
    }
  }

  const diffColor = DIFF[task.difficulty] ?? "#cccccc"

  return (
    <div id={task.id} style={{ scrollMarginTop: 24, border: `1px solid ${done ? `${ACCENT}40` : "#1e1e1e"}`, background: done ? "#060f06" : "#0a0a0a" }}>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.14em", color: diffColor, border: `1px solid ${diffColor}44`, padding: "1px 7px" }}>
            {task.difficulty}
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", letterSpacing: "0.1em" }}>{task.id}</span>
          <span style={{ marginLeft: "auto", fontSize: 18, fontFamily: "var(--font-mono)", fontWeight: 900, color: done ? ACCENT : "#FFD700" }}>
            +{task.reward} HC
          </span>
        </div>

        <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 700, color: done ? ACCENT : "#e8e8e8", marginBottom: 8, letterSpacing: "0.03em" }}>
          {done ? "✓ " : ""}{task.title}
        </div>
        <p style={{ fontSize: 12, color: "#c4c4c4", fontFamily: "var(--font-mono)", lineHeight: 1.75, margin: "0 0 12px" }}>
          {task.brief}
        </p>

        {task.requires.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {task.requires.map((r) => (
              <Link key={r} href={r} style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", border: "1px solid #262626", padding: "2px 8px", textDecoration: "none", letterSpacing: "0.04em" }}>
                → {r.replace("/hidden-wiki-2", "")}
              </Link>
            ))}
          </div>
        )}

        {!done ? (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={task.answerLabel}
                style={{ flex: 1, background: "#050505", border: `1px solid ${msg?.kind === "err" ? "#FF003360" : "#222"}`, color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 13, padding: "9px 12px", outline: "none", letterSpacing: "0.06em" }}
              />
              <button
                onClick={submit}
                disabled={busy || !answer.trim()}
                style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}55`, color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", padding: "0 18px", cursor: busy || !answer.trim() ? "default" : "pointer", fontWeight: 700, opacity: !answer.trim() ? 0.5 : 1 }}
              >
                {busy ? "…" : "ПОДАЙ"}
              </button>
            </div>

            <div style={{ marginTop: 8 }}>
              {showHint ? (
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#FFD700", padding: "6px 10px", border: "1px solid #FFD70030", background: "#FFD70008", lineHeight: 1.6 }}>
                  [ПОДСКАЗКА] {task.answerHint}
                </div>
              ) : (
                <button onClick={() => setShowHint(true)} style={{ background: "transparent", border: "none", color: "#6e6e6e", fontFamily: "var(--font-mono)", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", padding: 0 }}>
                  [ПОКАЖИ ПОДСКАЗКА]
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.12em" }}>
            {task.id === "bm-dead-drop" ? <a href="/hidden-wiki-2/blackmarket">BLACKMARKET Е ОТКЛЮЧЕН → ВЛЕЗ</a> : "НАГРАДАТА Е ПОЛУЧЕНА"}
          </div>
        )}

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 10, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", color: msg.kind === "ok" ? ACCENT : "#FF0033" }}
            >
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
