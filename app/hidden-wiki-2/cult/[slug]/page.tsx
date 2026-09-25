import type { CSSProperties } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CultOperatorsPanel } from "@/components/tor/cult-intelligence-panels"
import { GlitchText } from "@/components/tor/glitch-text"
import { SaveCultClueButton } from "@/components/tor/save-cult-clue-button"
import { CULTS, RISK_META as RISK, getCultBySlug, type CultRisk } from "@/lib/cults"
import s from "./dossier.module.css"

const CONFIDENCE_BY_RISK: Record<CultRisk, number> = {
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5,
}

const EXHIBIT_LETTERS = "ABCDEFGH"

const pad = (n: number) => String(n).padStart(2, "0")

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

  const risk = RISK[cult.risk]
  const [heroPhoto, ...archivePhotos] = cult.photos
  const sourceRoute = `/cult/${cult.slug}`
  const confidence = CONFIDENCE_BY_RISK[cult.risk]
  const clueTitle = (label: string) => `[CULT] ${cult.name} // ${label}`
  const clueProps = { name: cult.name, sourceRoute, confidence }
  const caseNo = cult.id.replace(/\D/g, "")

  const index = CULTS.findIndex((c) => c.slug === cult.slug)
  const prev = CULTS[(index - 1 + CULTS.length) % CULTS.length]
  const next = CULTS[(index + 1) % CULTS.length]

  const facts: [string, string, string][] = [
    ["ЧЛЕНОВЕ", cult.members, "members"],
    ["ОСНОВАН", cult.founded, "founded"],
    ["ЛОКАЦИЯ", cult.location, "location"],
    ["ПРИКРИТИЕ", cult.front, "front"],
  ]

  return (
    <article className={s.page} style={{ "--risk": risk.color } as CSSProperties}>
      <nav className={s.topbar}>
        <Link href="/hidden-wiki-2/cult" className={s.back}>
          ← cult-db
        </Link>
        <span className={s.path}>
          ~/cult-db/<b>{cult.slug}</b>.dossier
        </span>
        <span className={s.access}>ДОСТЪП: ОГРАНИЧЕН</span>
      </nav>

      <header className={s.hero}>
        <div className={s.heroText}>
          <div className={s.watermark} aria-hidden>
            {caseNo}
          </div>
          <div className={s.kicker}>
            <span className={s.pulse} />
            {cult.id}
            <em>//</em>
            {cult.status}
          </div>
          <GlitchText text={cult.name} as="h1" intensity="low" className={s.title} />
          <p className={s.lede}>{cult.short}</p>

          <div className={s.threat}>
            <span className={s.threatLabel}>НИВО НА ЗАПЛАХА</span>
            <div className={s.meter} aria-hidden>
              {[1, 2, 3, 4].map((n) => (
                <i key={n} data-on={n <= risk.level ? "" : undefined} />
              ))}
            </div>
            <span className={s.threatValue}>{risk.label}</span>
          </div>

          <div className={s.heroActions}>
            <SaveCultClueButton
              clueId={`cult-${cult.slug}-summary`}
              clue={cult.short}
              clueTitle={clueTitle("КРАТКО ДОСИЕ")}
              {...clueProps}
            />
            {cult.article.length > 0 && (
              <a href="#dossier" className={s.jump}>
                прочети досието ↓
              </a>
            )}
          </div>
        </div>

        <figure className={s.heroFigure}>
          <div className={s.frame}>
            <img src={heroPhoto.src} alt={`Архивна снимка към досието на ${cult.name}`} />
            <i className={s.corner} />
            <i className={s.corner} />
            <i className={s.corner} />
            <i className={s.corner} />
            <span className={s.rec}>REC</span>
            <span className={s.camId}>
              CAM-{caseNo} // {cult.founded}
            </span>
          </div>
          <figcaption className={s.caption}>
            <span>{heroPhoto.caption}</span>
            <span className={s.save}>
              <SaveCultClueButton
                clueId={`cult-${cult.slug}-photo-caption-1`}
                clue={heroPhoto.caption}
                clueTitle={clueTitle("PHOTO CAPTION 01")}
                compact
                {...clueProps}
              />
            </span>
          </figcaption>
        </figure>
      </header>

      <dl className={s.facts}>
        {facts.map(([label, value, key]) => (
          <div key={key} className={s.fact}>
            <div>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
            <span className={s.save}>
              <SaveCultClueButton
                clueId={`cult-${cult.slug}-${key}`}
                clue={`${label}: ${value}`}
                clueTitle={clueTitle(label)}
                compact
                {...clueProps}
              />
            </span>
          </div>
        ))}
      </dl>

      <div className={s.layout}>
        <div className={s.main}>
          {cult.article.length > 0 && (
            <section id="dossier" className={s.section}>
              <SectionHead index="01" title="Досие" meta={`${cult.article.length} записа`} />
              <div className={s.article}>
                {cult.article.map((paragraph, i) => (
                  <div key={i} className={s.para}>
                    <span className={s.lineNo}>{pad(i + 1)}</span>
                    <p>{paragraph}</p>
                    <span className={s.save}>
                      <SaveCultClueButton
                        clueId={`cult-${cult.slug}-article-${i + 1}`}
                        clue={paragraph}
                        clueTitle={clueTitle(`DOSSIER ${pad(i + 1)}`)}
                        compact
                        {...clueProps}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={s.section}>
            <SectionHead
              index={cult.article.length > 0 ? "02" : "01"}
              title="Протокол на ритуала"
              meta={`${cult.rituals.length} процедури`}
            />
            <ol className={s.rituals}>
              {cult.rituals.map((ritual, i) => (
                <li key={ritual} className={s.ritual}>
                  <span className={s.ritualNo}>R-{pad(i + 1)}</span>
                  <span className={ritual.length <= 40 ? s.ritualTitle : s.ritualName}>{ritual}</span>
                  <span className={s.save}>
                    <SaveCultClueButton
                      clueId={`cult-${cult.slug}-ritual-${i + 1}`}
                      clue={ritual}
                      clueTitle={clueTitle(`РИТУАЛИ ${pad(i + 1)}`)}
                      compact
                      {...clueProps}
                    />
                  </span>
                </li>
              ))}
            </ol>

            {cult.ritualDescription && (
              <div className={s.log}>
                <div className={s.logHead}>
                  <span>ЛОГ // ОПИСАНИЕ НА РИТУАЛ</span>
                  <SaveCultClueButton
                    clueId={`cult-${cult.slug}-ritual-description`}
                    clue={cult.ritualDescription}
                    clueTitle={clueTitle("ОПИСАНИЕ НА РИТУАЛ")}
                    compact
                    {...clueProps}
                  />
                </div>
                <p>{cult.ritualDescription}</p>
              </div>
            )}

            {cult.result && (
              <div className={s.warning}>
                <span className={s.warnIcon}>!</span>
                <div>
                  <div className={s.warnLabel}>ПОСЛЕДСТВИЯ ЗА ЧЛЕНОВЕТЕ</div>
                  <p>{cult.result}</p>
                </div>
                <SaveCultClueButton
                  clueId={`cult-${cult.slug}-result`}
                  clue={cult.result}
                  clueTitle={clueTitle("РЕЗУЛТАТ")}
                  compact
                  {...clueProps}
                />
              </div>
            )}
          </section>
        </div>

        <aside className={s.aside}>
          <div className={s.note}>
            <div className={s.noteHead}>
              <span>ОПЕРАТИВНА БЕЛЕЖКА</span>
              <span>#{caseNo}</span>
            </div>
            <p>{cult.clue}</p>
            <SaveCultClueButton
              clueId={`cult-profile-${cult.slug}`}
              clue={cult.clue}
              clueTitle={clueTitle("ОПЕРАТИВНА БЕЛЕЖКА")}
              {...clueProps}
            />
          </div>

          <ProfileList title="ВЯРВАНИЯ" items={cult.beliefs} prefix={`cult-${cult.slug}-belief`} clueTitle={clueTitle} clueProps={clueProps} />
          <ProfileList title="ЦЕЛИ" items={cult.goals} prefix={`cult-${cult.slug}-goal`} clueTitle={clueTitle} clueProps={clueProps} />
          {cult.methods && (
            <ProfileList title="МЕТОДИ" items={cult.methods} prefix={`cult-${cult.slug}-method`} clueTitle={clueTitle} clueProps={clueProps} />
          )}
        </aside>
      </div>

      {archivePhotos.length > 0 && (
        <section className={s.section}>
          <SectionHead index="//" title="Веществени доказателства" meta={`${archivePhotos.length} кадъра`} />
          <div className={s.evidence}>
            {archivePhotos.map((photo, i) => {
              const n = i + 2
              return (
                <figure key={photo.src} className={s.exhibit}>
                  <div className={s.exhibitImg}>
                    <img src={photo.src} alt={photo.caption} />
                    <span className={s.tag}>EXHIBIT {EXHIBIT_LETTERS[i]}</span>
                  </div>
                  <figcaption>
                    <span>{photo.caption}</span>
                    <span className={s.save}>
                      <SaveCultClueButton
                        clueId={`cult-${cult.slug}-photo-caption-${n}`}
                        clue={photo.caption}
                        clueTitle={clueTitle(`PHOTO CAPTION ${pad(n)}`)}
                        compact
                        {...clueProps}
                      />
                    </span>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </section>
      )}

      <nav className={s.pager}>
        <Link href={`/hidden-wiki-2/cult/${prev.slug}`}>
          <span>← ПРЕДИШНО ДОСИЕ // {prev.id}</span>
          <strong>{prev.name}</strong>
        </Link>
        <Link href={`/hidden-wiki-2/cult/${next.slug}`}>
          <span>СЛЕДВАЩО ДОСИЕ // {next.id} →</span>
          <strong>{next.name}</strong>
        </Link>
      </nav>

      <CultOperatorsPanel cultName={cult.name} sourceRoute={sourceRoute} />
    </article>
  )
}

function SectionHead({ index, title, meta }: { index: string; title: string; meta?: string }) {
  return (
    <div className={s.sectionHead}>
      <span className={s.idx}>{index}</span>
      <h2>{title}</h2>
      <span className={s.rule} />
      {meta && <span className={s.meta}>{meta}</span>}
    </div>
  )
}

function ProfileList({
  title,
  items,
  prefix,
  clueTitle,
  clueProps,
}: {
  title: string
  items: string[]
  prefix: string
  clueTitle: (label: string) => string
  clueProps: { name: string; sourceRoute: string; confidence: number }
}) {
  return (
    <div className={s.block}>
      <div className={s.blockHead}>
        <h3>{title}</h3>
        <span className={s.count}>{pad(items.length)}</span>
      </div>
      <ul className={s.list}>
        {items.map((item, i) => (
          <li key={item} className={s.listItem}>
            <span className={s.prompt}>&gt;</span>
            <span>{item}</span>
            <span className={s.save}>
              <SaveCultClueButton
                clueId={`${prefix}-${i + 1}`}
                clue={item}
                clueTitle={clueTitle(`${title} ${pad(i + 1)}`)}
                compact
                {...clueProps}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
