"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/tor/ui"
import { usePlayer } from "@/lib/hc/client"

const ACCENT = "#00FF41"

const CATEGORIES = [
  { slug: "services", label: "SERVICES", desc: "Договори от тъмната мрежа — мисии за странични секти. Свързвай записи в /leaks и подавай решението.", color: "#00FF41" },
  { slug: "puzzels", label: "PUZZELS", desc: "Шифри и логика — hex, ROT-13, огледални думи и повтарящи се следи през TRACE-NODE.", color: "#FFB000" },
  { slug: "trivia", label: "TRIVIA", desc: "Въпроси за сектите. Прочети досиетата в /cult и докажи, че знаеш кой какъв е.", color: "#FF6B33" },
]

export default function MoneyTasksPage() {
  const { authenticated, player, tasks, coins } = usePlayer()

  const total = tasks.length
  const done = player?.completedTasks.filter((id) => tasks.some((t) => t.id === id)).length ?? 0
  const earnable = tasks.reduce((s, t) => s + t.reward, 0)

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        title="MONEYTASKS"
        accent={ACCENT}
        kicker="HIDDEN WIKI 2 // МИСИИ ЗА HIDDEN COINS"
      />

      {/* Balance strip */}
      <Link href="/hidden-wiki-2/moneytasks/services#bm-dead-drop" style={{ display: "block", marginBottom: 24, padding: "18px 20px", border: "1px solid #58613c", background: "#161c0e", color: "#d5e78b", fontSize: 12 }}>
        СПЕЦИАЛНА МИСИЯ ↗ Некро пощенско клеймо<br /><span style={{ fontSize: 10, color: "#a6b18c" }}>Отключи BLACKMARKET + вземи 50 HC за първата си услуга.</span>
      </Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#111", marginBottom: 24 }}>
        {[
          { label: "БАЛАНС", value: `${coins.toLocaleString("bg-BG")} HC`, color: ACCENT },
          { label: "ИЗПЪЛНЕНИ", value: `${done}/${total}`, color: "#FFD700" },
          { label: "ВЪЗМОЖНИ", value: `${earnable} HC`, color: "#cccccc" },
        ].map((b) => (
          <div key={b.label} style={{ background: "#080808", padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.2em", marginBottom: 8 }}>{b.label}</div>
            <div style={{ fontSize: 26, fontFamily: "var(--font-mono)", fontWeight: 900, color: b.color, letterSpacing: "0.04em" }}>{b.value}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ padding: "16px 18px", background: "#080808", border: `1px solid ${ACCENT}22`, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.18em", fontWeight: 700, marginBottom: 10 }}>
          КАК СЕ СЪБИРАТ HIDDEN COINS
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, color: "#c4c4c4", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.9 }}>
          <li>Влизаш с личния си код — балансът ти е индивидуален и се пази на сървъра.</li>
          <li>Отваряш <b style={{ color: ACCENT }}>services</b>, <b style={{ color: "#FFB000" }}>puzzels</b> или <b style={{ color: "#FF6B33" }}>trivia</b>.</li>
          <li>Всяка задача сочи страници в сайта (напр. /leaks, /cult, /trace-node). Разследваш там.</li>
          <li>Подаваш отговора. Сървърът го проверява и начислява HC <b>еднократно</b>.</li>
          <li>Прогресът (пари, улики, отключени страници) остава закачен за твоя код.</li>
        </ol>
      </div>

      {!authenticated && (
        <div style={{ padding: "12px 16px", background: "#1a0000", border: "1px solid #FF003330", color: "#FF6b6b", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>
          Не си влязъл. Логни се с код за достъп, за да отключиш начисляването на монети.
        </div>
      )}

      {/* Category cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
        {CATEGORIES.map((c, i) => {
          const catTasks = tasks.filter((t) => t.category === c.slug)
          const catDone = catTasks.filter((t) => player?.completedTasks.includes(t.id)).length
          return (
            <motion.div key={c.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link
                href={`/hidden-wiki-2/moneytasks/${c.slug}`}
                style={{ display: "block", textDecoration: "none", background: "#0a0a0a", border: `1px solid ${c.color}33`, padding: "18px 18px", height: "100%" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 700, color: c.color, letterSpacing: "0.1em" }}>{c.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a" }}>{catDone}/{catTasks.length}</span>
                </div>
                <p style={{ fontSize: 11, color: "#b0b0b0", fontFamily: "var(--font-mono)", lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
                <div style={{ marginTop: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: c.color, letterSpacing: "0.1em" }}>ОТВОРИ →</div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, padding: "12px 16px", background: "#060606", border: "1px solid #181818" }}>
        <p style={{ fontSize: 11, color: "#909090", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Hidden Coins са вътрешна валута — не се теглят. Проверката на всеки отговор е на сървъра, така че балансът не може да се фалшифицира от браузъра.
        </p>
      </div>
    </div>
  )
}
