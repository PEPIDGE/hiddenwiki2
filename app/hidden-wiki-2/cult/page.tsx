import type { CSSProperties } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { CULTS, RISK_META, type CultRisk } from "@/lib/cults"
import s from "./cult-index.module.css"

const RISK_ORDER: CultRisk[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

export default function CultPage() {
  const counts = RISK_ORDER.map((risk) => ({
    risk,
    ...RISK_META[risk],
    count: CULTS.filter((c) => c.risk === risk).length,
  })).filter((r) => r.count > 0)

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.kicker}>
          <span className={s.blink} />
          CULT DATABASE <em>//</em> {CULTS.length} ОТВОРЕНИ ДОСИЕТА
        </div>
        <GlitchText text="КУЛТОВЕ" as="h1" intensity="low" className={s.title} />
        <p className={s.intro}>
          Затворени групи, открити по време на разследването. Всяко досие крие улики — прочети го,
          запази каквото ти е важно и търси връзките между тях.
        </p>

        <div className={s.threatBoard}>
          <div className={s.threatBar} aria-hidden>
            {counts.map((r) => (
              <span key={r.risk} style={{ flexGrow: r.count, background: r.color }} />
            ))}
          </div>
          <ul className={s.legend}>
            {counts.map((r) => (
              <li key={r.risk} style={{ "--c": r.color } as CSSProperties}>
                <b>{String(r.count).padStart(2, "0")}</b>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <Link href="/hidden-wiki-2/cult/chat-system" className={s.chat}>
        <span className={s.chatPrompt}>
          <i>root@hw2</i>:~$ open chat-system --all-cults
        </span>
        <span className={s.chatTitle}>ВЛЕЗ В ЧАТА НА ЧЛЕНОВЕТЕ</span>
        <span className={s.chatArrow}>→</span>
      </Link>

      <div className={s.grid}>
        {CULTS.map((cult) => {
          const risk = RISK_META[cult.risk]
          const caseNo = cult.id.replace(/\D/g, "")
          const featured = cult.risk === "CRITICAL"

          return (
            <Link
              key={cult.id}
              href={`/hidden-wiki-2/cult/${cult.slug}`}
              className={`${s.card} ${featured ? s.featured : ""}`}
              style={{ "--risk": risk.color } as CSSProperties}
            >
              {featured && (
                <div className={s.cardImg}>
                  <img src={cult.photos[0].src} alt="" />
                  <span className={s.priority}>ПРИОРИТЕТ</span>
                </div>
              )}
              <div className={s.cardBody}>
                <div className={s.cardTop}>
                  <span className={s.caseNo}>{caseNo}</span>
                  <span className={s.riskTag}>
                    <span className={s.meter} aria-hidden>
                      {[1, 2, 3, 4].map((n) => (
                        <i key={n} data-on={n <= risk.level ? "" : undefined} />
                      ))}
                    </span>
                    {risk.label}
                  </span>
                </div>
                <div className={s.status}>{cult.status}</div>
                <h2 className={s.name}>{cult.name}</h2>
                <p className={s.short}>{cult.short}</p>
                <div className={s.meta}>
                  <span>
                    <em>ЧЛЕНОВЕ</em>
                    {cult.members}
                  </span>
                  <span>
                    <em>ОСНОВАН</em>
                    {cult.founded}
                  </span>
                  <span className={s.open}>ОТВОРИ →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
