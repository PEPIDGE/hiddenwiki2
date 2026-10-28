"use client"

import { useMemo, useState } from "react"
import { CultChatSystem } from "@/components/tor/cult-chat-system"
import { PageHeader, SectionTitle } from "@/components/tor/ui"
import { CULTS, RISK_META } from "@/lib/cults"
import { getCultChatArchive } from "@/lib/cult-chats"

const ACCENT = "#00FF41"
const MAIN_ARCHIVE = "bratstvoto-na-tretoto-probuzhdane"

export function CultChatSystemClient() {
  const archives = useMemo(() => [...CULTS].sort((a, b) => a.slug === MAIN_ARCHIVE ? -1 : b.slug === MAIN_ARCHIVE ? 1 : 0), [])
  const [selectedSlug, setSelectedSlug] = useState(MAIN_ARCHIVE)
  const selectedCult = CULTS.find((cult) => cult.slug === selectedSlug) ?? CULTS[0]

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <PageHeader
        title="CHAT SYSTEM"
        accent={ACCENT}
        kicker={`CULT // LATE-GAME INTERCEPT // ${archives.length} ARCHIVES`}
        intro="Късен разследващ архив. Основната система изисква актуалната парола на GothGirl; останалите организации съдържат по една прихваната членска сесия. Част от следите са засадени нарочно — сравнявай часове, подписи и контекст."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid #172019", marginBottom: 28, background: "#050706" }}>
        {[
          ["01", "SELECT ARCHIVE", `${archives.length} nodes indexed`],
          ["02", "BREACH PROFILE", "1 identity per cult"],
          ["03", "VERIFY EVIDENCE", "bait trails detected"],
        ].map(([n, label, detail], index) => (
          <div key={n} style={{ padding: "10px 12px", borderRight: index < 2 ? "1px solid #172019" : "none", minWidth: 0 }}>
            <div style={{ color: ACCENT, fontSize: 8, letterSpacing: ".14em", marginBottom: 3 }}>{n} / {label}</div>
            <div style={{ color: "#687169", fontSize: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{detail}</div>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: 28 }}>
        <SectionTitle title="SELECT CULT ARCHIVE" index="01" meta={`${archives.length} архива / 1 профил във всеки`} accent={ACCENT} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 8 }}>
          {archives.map((cult) => {
            const isSelected = cult.slug === selectedCult.slug
            const risk = RISK_META[cult.risk]
            const archive = getCultChatArchive(cult.slug)

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
                <div style={{ fontFamily: "var(--font-display)", fontStretch: "112%", fontSize: 13, fontWeight: 700, lineHeight: 1.25, textTransform: "uppercase", overflowWrap: "anywhere", marginBottom: 8 }}>
                  {cult.name}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 7, borderTop: `1px solid ${isSelected ? ACCENT + "25" : "#151515"}`, fontSize: 8.5, fontFamily: "var(--font-mono)", color: isSelected ? "#b6c8ba" : "#686868" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{archive.owner.handle}</span>
                  <span style={{ color: archive.access === "password" ? "#FF5A70" : "#6d806f", flexShrink: 0 }}>{archive.access === "password" ? "LOCKED" : "SNAPSHOT"}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {selectedCult && (
        <CultChatSystem
          cultName={selectedCult.name}
          cultSlug={selectedCult.slug}
          sourceRoute="/cult/chat-system"
        />
      )}
    </div>
  )
}
