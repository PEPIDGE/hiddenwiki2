"use client"

import { useState } from "react"
import { CultChatSystemPanel } from "@/components/tor/cult-intelligence-panels"
import { PageHeader, SectionTitle } from "@/components/tor/ui"
import { CULTS, RISK_META } from "@/lib/cults"

const ACCENT = "#00FF41"

export function CultChatSystemClient() {
  const [selectedSlug, setSelectedSlug] = useState(CULTS[0]?.slug ?? "")
  const selectedCult = CULTS.find((cult) => cult.slug === selectedSlug) ?? CULTS[0]

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <PageHeader
        title="CHAT SYSTEM"
        accent={ACCENT}
        kicker="CULT // MEMBER CHAT SYSTEM"
        intro="Избери секта, после влез с профил на конкретен член. Всеки акаунт показва само разговорите, в които този човек участва."
      />

      <section style={{ marginBottom: 28 }}>
        <SectionTitle title="SELECT CULT ARCHIVE" index="01" meta={`${CULTS.length} архива`} accent={ACCENT} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 8 }}>
          {CULTS.map((cult) => {
            const isSelected = cult.slug === selectedCult.slug
            const risk = RISK_META[cult.risk]

            return (
              <button
                key={cult.slug}
                type="button"
                onClick={() => setSelectedSlug(cult.slug)}
                style={{
                  position: "relative",
                  padding: "12px 14px 12px 16px",
                  minHeight: 72,
                  background: isSelected ? `${ACCENT}12` : "#080808",
                  border: `1px solid ${isSelected ? ACCENT : "#242424"}`,
                  boxShadow: isSelected ? `0 0 18px -6px ${ACCENT}` : "none",
                  color: isSelected ? ACCENT : "#e0e0e0",
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: risk.color }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", marginBottom: 6 }}>
                  <span style={{ color: isSelected ? `${ACCENT}cc` : "#7a7a7a" }}>{cult.id}</span>
                  <span style={{ color: risk.color }}>{risk.label}</span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontStretch: "112%", fontSize: 13, fontWeight: 700, lineHeight: 1.25, textTransform: "uppercase", overflowWrap: "anywhere" }}>
                  {cult.name}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {selectedCult && (
        <CultChatSystemPanel
          cultName={selectedCult.name}
          cultSlug={selectedCult.slug}
          sourceRoute="/cult/chat-system"
        />
      )}
    </div>
  )
}
