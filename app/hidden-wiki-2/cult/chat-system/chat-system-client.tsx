"use client"

import { useState } from "react"
import Link from "next/link"
import { CultChatSystemPanel } from "@/components/tor/cult-intelligence-panels"
import { GlitchText } from "@/components/tor/glitch-text"
import { CULTS } from "@/lib/cults"

const ACCENT = "#00FF41"

export function CultChatSystemClient() {
  const [selectedSlug, setSelectedSlug] = useState(CULTS[0]?.slug ?? "")
  const selectedCult = CULTS.find((cult) => cult.slug === selectedSlug) ?? CULTS[0]

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/hidden-wiki-2/cult"
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            color: "#666",
            textDecoration: "none",
            letterSpacing: "0.14em",
          }}
        >
          ← CULT DATABASE
        </Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0 0" }} />
      </div>

      <section style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.3em", marginBottom: 8 }}>
          CULT // MEMBER CHAT SYSTEM
        </div>
        <GlitchText text="CHAT SYSTEM" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8, marginBottom: 12 }} />
        <p style={{ margin: 0, maxWidth: 780, fontSize: 12, lineHeight: 1.75, color: "#a8a8a8", fontFamily: "var(--font-mono)" }}>
          Избери секта, после влез с профил на конкретен член. Всеки акаунт показва само разговорите, в които този човек участва.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.18em", marginBottom: 10 }}>
          SELECT CULT ARCHIVE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 6 }}>
          {CULTS.map((cult) => {
            const isSelected = cult.slug === selectedCult.slug

            return (
              <button
                key={cult.slug}
                type="button"
                onClick={() => setSelectedSlug(cult.slug)}
                style={{
                  padding: "10px 12px",
                  minHeight: 58,
                  background: isSelected ? `${ACCENT}10` : "#060606",
                  border: `1px solid ${isSelected ? `${ACCENT}45` : "#151515"}`,
                  color: isSelected ? ACCENT : "#d8d8d8",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: isSelected ? `${ACCENT}99` : "#555", letterSpacing: "0.12em", marginBottom: 5 }}>
                  {cult.id} // {cult.risk}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1.45, overflowWrap: "anywhere" }}>
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
