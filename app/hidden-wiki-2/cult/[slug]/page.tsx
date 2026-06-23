import Link from "next/link"
import { notFound } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { SaveCultClueButton } from "@/components/tor/save-cult-clue-button"
import { CULTS, getCultBySlug, type CultRisk } from "@/lib/cults"

const ACCENT = "#00FF41"

const RISK_COLOR: Record<CultRisk, string> = {
  LOW: "#777777",
  MEDIUM: "#FFB000",
  HIGH: "#FF6B33",
  CRITICAL: "#FF0033",
}

const CONFIDENCE_BY_RISK: Record<CultRisk, number> = {
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5,
}

export function generateStaticParams() {
  return CULTS.map((cult) => ({ slug: cult.slug }))
}

export default async function CultDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cult = getCultBySlug(slug)

  if (!cult) {
    notFound()
  }

  const riskColor = RISK_COLOR[cult.risk]
  const heroPhoto = cult.photos[0]

  return (
    <article style={{ maxWidth: 1040, margin: "0 auto" }}>
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

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 22,
          alignItems: "stretch",
          marginBottom: 26,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: riskColor, letterSpacing: "0.18em", marginBottom: 8 }}>
            {cult.id} // {cult.status.toUpperCase()} // RISK {cult.risk}
          </div>
          <GlitchText text={cult.name} as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={cult.risk === "CRITICAL" ? "#FF0033" : ACCENT} />
          <div style={{ height: 1, background: `linear-gradient(90deg, ${riskColor}, transparent)`, marginTop: 10, marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.85, color: "#c9c9c9", fontFamily: "var(--font-mono)" }}>
            {cult.short}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
              gap: 8,
              marginTop: 18,
            }}
          >
            {[
              ["ЧЛЕНОВЕ", cult.members],
              ["ОСНОВАН", cult.founded],
            ].map(([label, value]) => (
              <div key={label} style={{ border: "1px solid #171717", background: "#050505", padding: "10px 12px" }}>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.14em", marginBottom: 5 }}>
                  {label}
                </div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#bdbdbd", lineHeight: 1.55 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <figure style={{ margin: 0, minWidth: 0 }}>
          <img
            src={heroPhoto.src}
            alt={`Архивна снимка към досието на ${cult.name}`}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              minHeight: 280,
              maxHeight: 420,
              objectFit: "cover",
              border: `1px solid ${riskColor}40`,
              filter: "contrast(1.08) brightness(0.82) saturate(0.8)",
            }}
          />
          <figcaption style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#666", lineHeight: 1.6, marginTop: 7 }}>
            {heroPhoto.caption}
          </figcaption>
        </figure>
      </section>

      <section
        style={{
          border: `1px solid ${riskColor}24`,
          background: cult.risk === "CRITICAL" ? "#0b0003" : "#050505",
          padding: "13px 14px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 220, flex: 1 }}>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: riskColor, letterSpacing: "0.16em", marginBottom: 5 }}>
            ОПЕРАТИВНА БЕЛЕЖКА
          </div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#d0d0d0", lineHeight: 1.65 }}>
            {cult.clue}
          </div>
        </div>
        <SaveCultClueButton
          clueId={`cult-profile-${cult.slug}`}
          name={cult.name}
          clue={cult.clue}
          sourceRoute={`/cult/${cult.slug}`}
          confidence={CONFIDENCE_BY_RISK[cult.risk]}
        />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 10, marginBottom: 28 }}>
        <InfoColumn title="ВЯРВАНИЯ" items={cult.beliefs} color={riskColor} />
        <InfoColumn title="ЦЕЛИ" items={cult.goals} color={riskColor} />
        {cult.methods && <InfoColumn title="МЕТОДИ" items={cult.methods} color={riskColor} />}
        <InfoColumn title="РИТУАЛИ" items={cult.rituals} color={riskColor} />
      </section>

      {(cult.ritualDescription || cult.result) && (
        <section style={{ display: "grid", gap: 10, marginBottom: 28 }}>
          {cult.ritualDescription && (
            <TextPanel title="ОПИСАНИЕ НА РИТУАЛ" text={cult.ritualDescription} color={riskColor} />
          )}
          {cult.result && (
            <TextPanel title="РЕЗУЛТАТ" text={cult.result} color={riskColor} />
          )}
        </section>
      )}

      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 10 }}>
          LONG FORM DOSSIER
        </div>
        <div style={{ borderTop: "1px solid #151515" }}>
          {cult.article.map((paragraph, index) => (
            <p
              key={index}
              style={{
                margin: 0,
                padding: "16px 0",
                borderBottom: "1px solid #111",
                fontSize: 13,
                lineHeight: 1.9,
                color: "#c6c6c6",
                fontFamily: "var(--font-mono)",
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 10 }}>
          PHOTO ARCHIVE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 10 }}>
          {cult.photos.map((photo) => (
            <figure key={photo.src} style={{ margin: 0, background: "#050505", border: "1px solid #151515" }}>
              <img
                src={photo.src}
                alt={photo.caption}
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  objectFit: "cover",
                  filter: "contrast(1.06) brightness(0.78) saturate(0.75)",
                }}
              />
              <figcaption style={{ padding: "8px 10px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#777", lineHeight: 1.55 }}>
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </article>
  )
}

function TextPanel({
  title,
  text,
  color,
}: {
  title: string
  text: string
  color: string
}) {
  return (
    <div style={{ background: "#050505", border: "1px solid #151515", padding: "12px 14px" }}>
      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color, letterSpacing: "0.16em", marginBottom: 9 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#c9c9c9", lineHeight: 1.75 }}>
        {text}
      </div>
    </div>
  )
}

function InfoColumn({
  title,
  items,
  color,
}: {
  title: string
  items: string[]
  color: string
}) {
  return (
    <div style={{ background: "#050505", border: "1px solid #151515", padding: "12px 14px" }}>
      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color, letterSpacing: "0.16em", marginBottom: 9 }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item, index) => (
          <div key={item} style={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr)", gap: 8 }}>
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", lineHeight: 1.65 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
