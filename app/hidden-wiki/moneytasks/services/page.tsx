"use client"

import { PageHeader } from "@/components/tor/ui"
import { TaskList } from "@/components/hc/task-list"

const ACCENT = "#00FF41"

export default function ServicesPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <PageHeader title="SERVICES" accent={ACCENT} kicker="MONEYTASKS // ДОГОВОРИ" />
      <div style={{ padding: "12px 16px", background: "#080808", border: `1px solid ${ACCENT}22`, marginBottom: 18 }}>
        <p style={{ fontSize: 12, color: "#c4c4c4", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Договори от странични групировки. Всеки иска малко разследване в /leaks и /red-room. Реши го и подай отговора за Hidden Coins.
        </p>
      </div>
      <TaskList category="services" />
    </div>
  )
}
