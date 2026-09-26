"use client"

import { useState } from "react"

const ACCENT = "#00FF41"
const RED = "#FF0033"

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/login")) return "/hidden-wiki-2"
  return raw
}

function LoginForm() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const value = code.trim()
    if (busy || !value) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/hc/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        // Full navigation so the gate sees the new session cookie.
        window.location.replace(safeNext(new URLSearchParams(window.location.search).get("next")))
        return
      }
      setError(data?.error ?? "Достъпът е отказан.")
    } catch {
      setError("Няма връзка със сървъра.")
    }
    setBusy(false)
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${ACCENT}30`, background: `${ACCENT}0a` }}>
        <span style={{ width: 7, height: 7, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.22em", fontWeight: 700 }}>
          HIDDEN WIKI 2 // ACCESS
        </span>
      </div>

      <div style={{ padding: "24px 20px 22px" }}>
        <p style={{ fontSize: 13, color: "#d0d0d0", fontFamily: "var(--font-mono)", lineHeight: 1.75, margin: "0 0 20px" }}>
          Въведи личния код от физическото си копие. Оттук нататък влизаш в опасно пространство — бъди готов на всичко вътре.
        </p>

        <label htmlFor="access-code" style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", marginBottom: 6 }}>
          КОД ЗА ДОСТЪП
        </label>
        <input
          id="access-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="HW2-XXXX-XXXX"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          style={{
            width: "100%", padding: "12px 14px", background: "#050505",
            border: `1px solid ${error ? `${RED}60` : "#262626"}`, color: ACCENT,
            fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.16em",
            outline: "none", caretColor: ACCENT, marginBottom: 14,
          }}
        />

        {error && (
          <div role="alert" style={{ padding: "9px 12px", background: "#1a0000", border: `1px solid ${RED}40`, color: RED, fontSize: 11, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy || !code.trim()}
          style={{
            width: "100%", padding: "12px 0", background: `${ACCENT}18`,
            border: `1px solid ${ACCENT}55`, color: ACCENT, fontFamily: "var(--font-mono)",
            fontSize: 12, letterSpacing: "0.24em", fontWeight: 700,
            cursor: busy || !code.trim() ? "default" : "pointer", opacity: !code.trim() ? 0.5 : 1,
          }}
        >
          {busy ? "ПРОВЕРКА…" : "ВЛЕЗ"}
        </button>

        <p style={{ fontSize: 11, color: "#9a4a4a", fontFamily: "var(--font-mono)", lineHeight: 1.7, margin: "18px 0 0", letterSpacing: "0.04em" }}>
          ⚠ Няма връщане назад. Каквото видиш вътре, остава с теб.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#030303" }}>
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)",
        }}
      />
      <LoginForm />
    </main>
  )
}

const card: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 440,
  background: "#0a0a0a",
  border: `1px solid ${ACCENT}40`,
  boxShadow: `0 0 36px ${ACCENT}14`,
}
