"use client"

import { useState, type ReactNode } from "react"
import { usePlayer } from "@/lib/hc/client"

const ACCENT = "#00FF41"

export function LoginGate({ children }: { children: ReactNode }) {
  const { loading, authenticated } = usePlayer()

  if (loading) {
    return (
      <div style={wrap}>
        <div style={{ fontFamily: "var(--font-mono)", color: ACCENT, fontSize: 12, letterSpacing: "0.2em" }}>
          УСТАНОВЯВАНЕ НА СЕСИЯ…
        </div>
      </div>
    )
  }

  if (!authenticated) return <LoginScreen />

  return <>{children}</>
}

function LoginScreen() {
  const { login } = usePlayer()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy) return
    setError("")
    setBusy(true)
    const res = await login(code.trim())
    setBusy(false)
    if (!res.ok) setError(res.error ?? "Неуспешен вход.")
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${ACCENT}30`, background: `${ACCENT}0a` }}>
          <span style={{ width: 7, height: 7, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.22em", fontWeight: 700 }}>
            HIDDEN WIKI 2 // ACCESS
          </span>
        </div>

        <div style={{ padding: "22px 20px" }}>
          <p style={{ fontSize: 12, color: "#c0c0c0", fontFamily: "var(--font-mono)", lineHeight: 1.7, margin: "0 0 18px" }}>
            Въведи личния код от физическото си копие. Оттук нататък влизаш в опасно пространство — бъди готов на всичко вътре.
          </p>

          <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", marginBottom: 6 }}>
            КОД ЗА ДОСТЪП
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="HW2-XXXX-XXXX"
            autoFocus
            style={{
              width: "100%", padding: "11px 14px", background: "#050505",
              border: `1px solid ${error ? "#FF003360" : "#222"}`, color: ACCENT,
              fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em",
              outline: "none", caretColor: ACCENT, marginBottom: 14,
            }}
          />

          {error && (
            <div style={{ padding: "9px 12px", background: "#1a0000", border: "1px solid #FF003340", color: "#FF0033", fontSize: 11, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy || !code.trim()}
            style={{
              width: "100%", padding: "11px 0", background: busy ? "#0a0a0a" : `${ACCENT}18`,
              border: `1px solid ${ACCENT}55`, color: ACCENT, fontFamily: "var(--font-mono)",
              fontSize: 11, letterSpacing: "0.2em", fontWeight: 700,
              cursor: busy || !code.trim() ? "default" : "pointer", opacity: !code.trim() ? 0.5 : 1,
            }}
          >
            {busy ? "ПРОВЕРКА…" : "ВЛЕЗ"}
          </button>

          <p style={{ fontSize: 10, color: "#7c4a4a", fontFamily: "var(--font-mono)", lineHeight: 1.7, margin: "16px 0 0", letterSpacing: "0.04em" }}>
            ⚠ Няма връщане назад. Каквото видиш вътре, остава с теб.
          </p>
        </div>
      </div>
    </div>
  )
}

const wrap: React.CSSProperties = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
}

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "#0a0a0a",
  border: `1px solid ${ACCENT}40`,
  boxShadow: `0 0 30px ${ACCENT}12`,
}
