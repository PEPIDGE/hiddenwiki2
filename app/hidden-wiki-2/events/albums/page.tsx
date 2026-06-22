"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

const ALBUMS = [
  {
    id: "ALB-01", title: "Огледален преход — 21.09.2025", date: "2025-09-21", photos: 18,
    coverNote: "Групово събитие в NDK. 40+ участника. Лора Костова е видима в снимки #7 и #14.",
    anomaly: true,
    photos_detail: [
      { n: 7, desc: "Лора Костова — стои до две непознати жени. Усмива се. Облечена с бял пуловер." },
      { n: 11, desc: "Група от 5 лица — три секти. Ляво: ToxicBabe (без маска). Дясно: OutsiderX." },
      { n: 14, desc: "Лора и мъж с черна качулка — мъжът е обърнат с гръб. Силует съответства на NightKiller." },
      { n: 18, desc: "Задна врата — черен Audi A3 паркиран пред NDK. Рег. частично четима: СА ○○○○." },
    ],
    clue: "Лора Костова на Огледален преход 21.09.2025 — снимки #7 и #14. Черен Audi A3 пред NDK",
  },
  {
    id: "ALB-02", title: "Захарна фабрика — октомври 2025", date: "2025-10-16", photos: 6,
    coverNote: "Само 6 снимки. Три от тях са размазани или с ниска резолюция. Западно крило.",
    anomaly: true,
    photos_detail: [
      { n: 1, desc: "Външен вид — западно крило на Захарна фабрика. Нощна снимка, около 01:30." },
      { n: 3, desc: "Врата с жълто-черна лента. Стая 9. Вратата е залостена отвътре." },
      { n: 5, desc: "Коридор — телефон с разбит екран на пода. Последно обаждане в 22:12." },
      { n: 6, desc: "Стол с въжета в стая 9. Следи от задържане." },
    ],
    clue: "Захарна фабрика, западно крило — стая 9 с жълто-черна лента, стол с въжета, телефон на пода",
  },
  {
    id: "ALB-03", title: "Братство — вътрешна среща, септември", date: "2025-09-01", photos: 9,
    coverNote: "Ритуална среща. Лицата са заличени. Символ на Братството виден в 3 снимки.",
    anomaly: false,
    photos_detail: [
      { n: 2, desc: "Символ на Братството — гравиран на стена. Вижда се и на фенерчето от стая 7." },
      { n: 9, desc: "Група от 7 членове в кръг. Ритуална постановка." },
    ],
    clue: "Ритуална среща на Братството — символ съвпада с фенерчето от стая 7 на Захарна фабрика",
  },
  {
    id: "ALB-04", title: "Лора Костова — лични снимки (изтеглени)", date: "2025-10-17", photos: 4,
    coverNote: "Изтеглени от телефона на Лора след намирането му. Последните снимки преди изчезването.",
    anomaly: true,
    photos_detail: [
      { n: 1, desc: "Самостоятелно — Лора пред огледало. Облечена за излизане. Дата: 15.10.2025, 20:00." },
      { n: 2, desc: "Покана за Огледален преход на 15.10 — ръкописна. Без адрес." },
      { n: 3, desc: "Записка на входната врата: 'Знаем за теб. Огледален преход, 15 окт.'" },
      { n: 4, desc: "Сенки пред прозореца — снимката е ъъглова. Заснета в 22:10." },
    ],
    clue: "Телефонни снимки на Лора — последна снимка в 22:10 на 15.10.2025. Записка с покана от Братството",
  },
]

export default function EventsAlbumsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (alb: typeof ALBUMS[number]) => {
    const id = `albums-${alb.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, { id, title: `[ALBUMS] ${alb.title}`, text: alb.clue, sourceRoute: "/events/albums", confidence: alb.anomaly ? 4 : 2, status: "unverified" })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>← EVENTS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="ALBUMS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d0500", border: `1px solid ${ACCENT}20`, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Фото архив от 4 събитийни албума. Лора Костова е видима в <span style={{ color: ACCENT }}>ALB-01 и ALB-04</span>. Цъкни за детайли по снимки.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, marginBottom: 20 }}>
        {ALBUMS.map((alb) => {
          const id = `albums-${alb.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === alb.id
          return (
            <div key={alb.id}>
              <motion.div whileHover={{ scale: 1.01 }} onClick={() => setSelected(isSelected ? null : alb.id)} style={{
                background: isSelected ? `${ACCENT}08` : "#090909",
                border: `1px solid ${isSelected ? `${ACCENT}35` : alb.anomaly ? `${ACCENT}18` : "#141414"}`,
                padding: "16px", cursor: "pointer",
              }}>
                <div style={{ height: 90, background: alb.anomaly ? "repeating-linear-gradient(135deg,#140500,#140500 2px,#0a0300 2px,#0a0300 10px)" : "#060606", marginBottom: 12, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: alb.anomaly ? `${ACCENT}50` : "#1a1a1a", letterSpacing: "0.2em" }}>
                    {alb.anomaly ? "[ ANOMALY ]" : `${alb.photos} PHOTOS`}
                  </div>
                  <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: 7, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>{alb.id}</div>
                  {isSaved && <div style={{ position: "absolute", top: 4, left: 6, fontSize: 7, fontFamily: "var(--font-mono)", color: ACCENT }}>✓</div>}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#c0c0c0", fontWeight: 700, marginBottom: 4 }}>{alb.title}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444" }}>{alb.date} — {alb.photos} снимки</div>
              </motion.div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "#060300", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <p style={{ fontSize: 10, color: "#c0c0c0", margin: "0 0 12px", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>{alb.coverNote}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                        {alb.photos_detail.map((ph) => (
                          <div key={ph.n} style={{ padding: "6px 10px", background: "#0a0200", border: "1px solid #1a0a00", display: "flex", gap: 10 }}>
                            <span style={{ fontSize: 9, color: ACCENT, fontFamily: "var(--font-mono)", flexShrink: 0 }}>#{ph.n}</span>
                            <span style={{ fontSize: 10, color: "#b0b0b0", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>{ph.desc}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(alb) }} disabled={isSaved}
                        style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                        {isSaved ? "✓ SAVED" : "SAVE CLUE"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
