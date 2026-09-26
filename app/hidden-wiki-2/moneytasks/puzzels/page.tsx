"use client"

import { PageHeader } from "@/components/tor/ui"
import { TaskList } from "@/components/hc/task-list"

const ACCENT = "#FFB000"

export default function PuzzelsPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <PageHeader title="PUZZELS" accent={ACCENT} kicker="MONEYTASKS // ШИФРИ И ЛОГИКА" />
      <div style={{ padding: "12px 16px", background: "#0a0a06", border: `1px solid ${ACCENT}22`, marginBottom: 18 }}>
        <p style={{ fontSize: 12, color: "#c4c4c4", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Декодирай, преброй, обърни. Повечето пъзели се решават в <b style={{ color: ACCENT }}>TRACE-NODE / terminal</b> или чрез внимателно четене на /leaks.
        </p>
      </div>
      <TaskList category="puzzels" />
    </div>
  )
}
