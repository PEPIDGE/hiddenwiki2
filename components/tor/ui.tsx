import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import s from "./ui.module.css"

export function PageHeader({
  title,
  accent = "#00FF41",
  kicker,
  intro,
  aside,
  intensity = "low",
}: {
  title: string
  accent?: string
  kicker?: ReactNode
  intro?: ReactNode
  aside?: ReactNode
  intensity?: "low" | "medium" | "high"
}) {
  return (
    <header className={s.header} style={{ "--accent": accent } as CSSProperties}>
      {kicker && (
        <div className={s.kicker}>
          <span className={s.blip} />
          {kicker}
        </div>
      )}
      <div className={s.titleRow}>
        <GlitchText text={title} as="h1" intensity={intensity} className={s.title} />
        {aside && <div className={s.aside}>{aside}</div>}
      </div>
      {intro && <div className={s.intro}>{intro}</div>}
    </header>
  )
}

export function SectionTitle({
  title,
  index,
  meta,
  accent = "#00FF41",
}: {
  title: string
  index?: string
  meta?: ReactNode
  accent?: string
}) {
  return (
    <div className={s.section} style={{ "--accent": accent } as CSSProperties}>
      {index && <span className={s.sectionIdx}>{index}</span>}
      <h2 className={s.sectionTitle}>{title}</h2>
      <span className={s.sectionRule} />
      {meta && <span className={s.sectionMeta}>{meta}</span>}
    </div>
  )
}

export function ProgressPips({
  done,
  total,
  label,
  accent = "#00FF41",
}: {
  done: number
  total: number
  label?: string
  accent?: string
}) {
  return (
    <div className={s.pips} style={{ "--accent": accent } as CSSProperties}>
      <div className={s.pipRow}>
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-on={i < done ? "" : undefined} />
        ))}
      </div>
      <span>
        <b>
          {done}/{total}
        </b>{" "}
        {label}
      </span>
    </div>
  )
}

export function StatStrip({
  items,
  accent = "#00FF41",
}: {
  items: { label: string; value: ReactNode; color?: string }[]
  accent?: string
}) {
  return (
    <dl className={s.stats} style={{ "--accent": accent } as CSSProperties}>
      {items.map((item) => (
        <div key={item.label} className={s.stat}>
          <dt>{item.label}</dt>
          <dd style={item.color ? { color: item.color } : undefined}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PortalGrid({
  items,
  accent = "#00FF41",
}: {
  items: { label: string; href: string; desc?: ReactNode; meta?: ReactNode }[]
  accent?: string
}) {
  return (
    <div className={s.portals} style={{ "--accent": accent } as CSSProperties}>
      {items.map((item, i) => (
        <Link key={item.href} href={item.href} className={s.portal}>
          <div className={s.portalTop}>
            <span className={s.portalIdx}>{String(i + 1).padStart(2, "0")}</span>
            {item.meta && <span className={s.portalMeta}>{item.meta}</span>}
          </div>
          <div className={s.portalLabel}>{item.label}</div>
          {item.desc && <div className={s.portalDesc}>{item.desc}</div>}
          <div className={s.portalFoot}>
            <span>{item.href.split("/").slice(-1)[0]}</span>
            <i>→</i>
          </div>
        </Link>
      ))}
    </div>
  )
}
