import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { CULTS } from "@/lib/cults"

const ACCENT = "#00FF41"

export default function CultPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.3em", marginBottom: 8 }}>
          CULT DATABASE // 10 ACTIVE DOSSIERS
        </div>
        <GlitchText text="CULT" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <Link
        href="/hidden-wiki-2/cult/chat-system"
        style={{
          display: "block",
          padding: "14px 16px",
          marginBottom: 14,
          background: `${ACCENT}08`,
          border: `1px solid ${ACCENT}35`,
          color: ACCENT,
          textDecoration: "none",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: "0.18em", color: `${ACCENT}99`, marginBottom: 5 }}>
          MEMBER ACCOUNTS // ALL CULTS
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
          ОТВОРИ CHAT SYSTEM
        </div>
      </Link>

      <div style={{ display: "grid", gap: 8 }}>
        {CULTS.map((cult, index) => {
          return (
            <Link
              key={cult.id}
              href={`/hidden-wiki-2/cult/${cult.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "52px minmax(0, 1fr)",
                gap: 14,
                alignItems: "center",
                padding: "14px 16px",
                background: "#070707",
                border: "1px solid #151515",
                borderLeft: "2px solid #222",
                color: "#d8d8d8",
                textDecoration: "none",
                minHeight: 78,
              }}
            >
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.08em" }}>
                {String(index + 1).padStart(2, "0")}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    lineHeight: 1.35,
                    fontFamily: "var(--font-mono)",
                    color: "#e2e2e2",
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {cult.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    lineHeight: 1.7,
                    fontFamily: "var(--font-mono)",
                    color: "#8f8f8f",
                    marginTop: 4,
                    overflowWrap: "anywhere",
                  }}
                >
                  {cult.short}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
