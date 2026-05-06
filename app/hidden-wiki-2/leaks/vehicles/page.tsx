"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

const VEHICLES = [
  { id: "V-001", brand: "Audi", model: "A3", year: 2005, color: "Черен", reg: "СА ○○○○ ХВ", phone: "+359 88 *** 1221", note: "Продава се срочно. Кожен салон.", city: "София", status: "AVAILABLE", match: true },
  { id: "V-002", brand: "BMW", model: "5 Series", year: 2008, color: "Тъмносив", reg: "ПВ ○○○○ АЕ", phone: "+359 87 *** 5543", note: "Внос Германия. Пълна история.", city: "Пловдив", status: "AVAILABLE", match: false },
  { id: "V-003", brand: "Audi", model: "A3", year: 2006, color: "Черен", reg: "СА ○○○○ КМ", phone: "+359 88 *** 1221", note: "Еднакъв телефон с V-001. Различна рег.", city: "София", status: "SOLD", match: true },
  { id: "V-004", brand: "VW", model: "Golf", year: 2010, color: "Бял", reg: "ВН ○○○○ ТТ", phone: "+359 86 *** 2200", note: "", city: "Варна", status: "AVAILABLE", match: false },
  { id: "V-005", brand: "Audi", model: "A4", year: 2007, color: "Черен", reg: "СА ○○○○ РХ", phone: "+359 89 *** 7744", note: "Подозрителна цена. Без история.", city: "София", status: "AVAILABLE", match: false },
  { id: "V-006", brand: "Toyota", model: "Corolla", year: 2012, color: "Сребрист", reg: "КН ○○○○ МС", phone: "+359 87 *** 3310", note: "", city: "Казанлък", status: "AVAILABLE", match: false },
  { id: "V-007", brand: "Audi", model: "A3", year: 2004, color: "Тъмночервен", reg: "БТ ○○○○ ЕА", phone: "+359 88 *** 8812", note: "Предна броня повредена.", city: "Бургас", status: "AVAILABLE", match: false },
  { id: "V-008", brand: "Mercedes", model: "C200", year: 2009, color: "Черен", reg: "СА ○○○○ ФВ", phone: "+359 88 *** 0071", note: "Бизнес кола. Заличен VIN.", city: "София", status: "AVAILABLE", match: false },
  { id: "V-009", brand: "Audi", model: "A3", year: 2005, color: "Черен", reg: "СА ○○○○ НМ", phone: "+359 88 *** 1221", note: "⚠ ТРЕТИ запис с еднакъв телефон +359 88 *** 1221. Различна рег.", city: "София", status: "AVAILABLE", match: true },
  { id: "V-010", brand: "Renault", model: "Megane", year: 2011, color: "Зелен", reg: "МН ○○○○ ВД", phone: "+359 86 *** 1190", note: "", city: "Монтана", status: "AVAILABLE", match: false },
  { id: "V-011", brand: "Opel", model: "Astra", year: 2013, color: "Бял", reg: "СА ○○○○ ТМ", phone: "+359 87 *** 4430", note: "", city: "София", status: "AVAILABLE", match: false },
  { id: "V-012", brand: "Skoda", model: "Octavia", year: 2014, color: "Сив", reg: "ПБ ○○○○ КА", phone: "+359 89 *** 6612", note: "", city: "Пазарджик", status: "AVAILABLE", match: false },
]

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#00FF41",
  SOLD: "#555",
}

export default function LeaksVehiclesPage() {
  const [captchaPassed, setCaptchaPassed] = useState(false)
  const [captchaInput, setCaptchaInput] = useState("")
  const [captchaError, setCaptchaError] = useState("")
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [filterMatch, setFilterMatch] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [captchaCode] = useState(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  })

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleCaptcha = () => {
    if (captchaInput.toUpperCase() === captchaCode) {
      setCaptchaPassed(true)
    } else {
      setCaptchaError("Невалиден код. Опитай отново.")
      setCaptchaInput("")
      setTimeout(() => setCaptchaError(""), 2500)
    }
  }

  const handleSave = (v: typeof VEHICLES[number], field: string, text: string) => {
    const id = `vehicles-${v.id}-${field}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[VEHICLES] ${v.brand} ${v.model} — ${field}`,
      text, sourceRoute: "/leaks/vehicles",
      confidence: v.match ? 4 : 2, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const displayed = filterMatch ? VEHICLES.filter((v) => v.match) : VEHICLES
  const selectedV = selected ? VEHICLES.find((v) => v.id === selected) : null

  if (!captchaPassed) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
          <div style={{ marginTop: 10 }}>
            <GlitchText text="VEHICLES" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
        </div>
        <div style={{ padding: "28px 24px", background: "#080808", border: `1px solid ${ACCENT}20` }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.2em", marginBottom: 14 }}>
            ANTI-BOT VERIFICATION
          </div>
          <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 20px", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
            Въведи кода по-долу за да получиш достъп до базата данни с превозни средства.
          </p>
          <div style={{ padding: "12px 16px", background: "#0d0d0d", border: `1px solid #2a2a2a`, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontFamily: "var(--font-mono)", color: "#e0e0e0", letterSpacing: "0.4em", fontWeight: 700,
              textDecoration: "line-through", textDecorationColor: "#333", userSelect: "none",
              background: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,0,51,0.05) 2px, rgba(255,0,51,0.05) 4px)",
            }}>
              {captchaCode.split("").join(" ")}
            </div>
          </div>
          <input value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleCaptcha()}
            placeholder="Въведи кода..."
            maxLength={5}
            style={{ width: "100%", padding: "8px 12px", background: "#111", border: `1px solid #2a2a2a`, color: "#e0e0e0", fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.3em", marginBottom: 10, outline: "none" }} />
          {captchaError && <div style={{ fontSize: 10, color: ACCENT, fontFamily: "var(--font-mono)", marginBottom: 8 }}>{captchaError}</div>}
          <button onClick={handleCaptcha}
            style={{ width: "100%", padding: "8px 0", background: `${ACCENT}22`, border: `1px solid ${ACCENT}50`, color: ACCENT, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", cursor: "pointer" }}>
            VERIFY →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <GlitchText text="VEHICLES" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", marginLeft: "auto" }}>{VEHICLES.length} ЗАПИСА</span>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d0000", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Черен пазар — превозни средства. Сравни модел, цвят и година с <span style={{ color: ACCENT }}>черния Audi A3 (2005)</span> от случая. Обърни внимание на повтарящи се телефонни номера.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setFilterMatch(!filterMatch)}
          style={{ padding: "5px 14px", fontSize: 8, fontFamily: "var(--font-mono)", background: filterMatch ? `${ACCENT}22` : "#0d0d0d", color: filterMatch ? ACCENT : "#666", border: `1px solid ${filterMatch ? ACCENT + "50" : "#1e1e1e"}`, cursor: "pointer", letterSpacing: "0.1em" }}>
          {filterMatch ? "★ САМО СЪВПАДЕНИЯ" : "САМО СЪВПАДЕНИЯ"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["МАРКА/МОДЕЛ", "ГОДИНА", "ЦВЯТ", "РЕГ. №", "ТЕЛЕФОН", "СТАТУС", ""].map((h) => (
                  <th key={h} style={{ padding: "7px 10px", fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.12em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((v) => {
                const isSelected = selected === v.id
                const isRepeatPhone = VEHICLES.filter((x) => x.phone === v.phone).length > 1
                return (
                  <tr key={v.id} onClick={() => setSelected(isSelected ? null : v.id)}
                    style={{ borderBottom: "1px solid #141414", cursor: "pointer", background: isSelected ? `${ACCENT}0a` : v.match ? "#0d0000" : "transparent", transition: "background 0.1s" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: v.match ? ACCENT : "#c0c0c0", fontWeight: v.match ? 700 : 400 }}>
                        {v.brand} {v.model}
                      </span>
                      {v.match && <span style={{ marginLeft: 6, fontSize: 7, color: ACCENT, border: `1px solid ${ACCENT}40`, padding: "1px 5px" }}>MATCH</span>}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "#aaa", fontFamily: "var(--font-mono)" }}>{v.year}</td>
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "#aaa", fontFamily: "var(--font-mono)" }}>{v.color}</td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#777", fontFamily: "var(--font-mono)" }}>{v.reg}</td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: isRepeatPhone ? "#CC44FF" : "#666", fontFamily: "var(--font-mono)" }}>
                      {v.phone}{isRepeatPhone && <span style={{ marginLeft: 4, fontSize: 7, color: "#CC44FF" }}>×REP</span>}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: STATUS_COLORS[v.status] }}>{v.status}</span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(v, "row", `${v.brand} ${v.model} ${v.year} ${v.color} — ${v.reg} — ${v.phone}`) }}
                        style={{ padding: "2px 7px", fontSize: 7, fontFamily: "var(--font-mono)", background: savedClues.includes(`vehicles-${v.id}-row`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`vehicles-${v.id}-row`) ? ACCENT : "#555", border: `1px solid ${savedClues.includes(`vehicles-${v.id}-row`) ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer" }}>
                        {savedClues.includes(`vehicles-${v.id}-row`) ? "✓" : "SAVE"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <div style={{ background: "#080808", border: "1px solid #1e1e1e", padding: 16, height: "fit-content" }}>
          {selectedV ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedV.id}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 12 }}>VEHICLE DETAIL</div>
              <div style={{ fontSize: 18, fontFamily: "var(--font-mono)", color: selectedV.match ? ACCENT : "#e0e0e0", fontWeight: 700, marginBottom: 14 }}>
                {selectedV.brand} {selectedV.model} {selectedV.year}
              </div>
              {[
                { label: "ID", value: selectedV.id },
                { label: "ЦВЯТ", value: selectedV.color },
                { label: "РЕГ. №", value: selectedV.reg },
                { label: "ТЕЛЕФОН", value: selectedV.phone },
                { label: "ГРАД", value: selectedV.city },
                { label: "СТАТУС", value: selectedV.status, color: STATUS_COLORS[selectedV.status] },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.1em" }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: row.color ?? "#aaa" }}>{row.value}</span>
                </div>
              ))}
              {selectedV.note && (
                <div style={{ marginBottom: 12, padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1e1e1e", fontSize: 10, color: "#FFD700", fontFamily: "var(--font-mono)" }}>
                  {selectedV.note}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { field: "reg", text: `Рег. №: ${selectedV.reg}` },
                  { field: "phone", text: `Телефон: ${selectedV.phone}` },
                  { field: "note", text: `Бележка: ${selectedV.note || "—"}` },
                ].map((a) => (
                  <button key={a.field} onClick={() => handleSave(selectedV, a.field, a.text)}
                    style={{ padding: "4px 10px", fontSize: 8, fontFamily: "var(--font-mono)", background: savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? ACCENT : "#777", border: `1px solid ${savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? ACCENT + "40" : "#222"}`, cursor: "pointer", textAlign: "left" }}>
                    {savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? "✓ " : ""}{a.text.split(":")[0]} → SAVE
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333", textAlign: "center", padding: "30px 0" }}>
              Цъкни ред за детайли
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
