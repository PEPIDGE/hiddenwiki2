"use client"

import { PageHeader } from "@/components/tor/ui"
import { TaskList } from "@/components/hc/task-list"

const ACCENT = "#FF6B33"

export default function TriviaPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <PageHeader title="TRIVIA" accent={ACCENT} kicker="MONEYTASKS // ВЪПРОСИ ЗА СЕКТИТЕ" />
      <div style={{ padding: "12px 16px", background: "#0a0603", border: `1px solid ${ACCENT}22`, marginBottom: 18 }}>
        <p style={{ fontSize: 12, color: "#c4c4c4", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Кратки въпроси за сектите от досието. Отговорите се крият в <b style={{ color: ACCENT }}>/cult</b>. Подай името или ключовата дума.
        </p>
      </div>
      <TaskList category="trivia" />
    </div>
  )
}
