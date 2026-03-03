"use client"

import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"

const SITES = [
  { id: "leaks", label: "LEAKS", color: "#FFD700", sublinks: ["/vault", "/docs", "/hash-lab", "/members"], step: 4 },
  { id: "events", label: "EVENTS", color: "#FF6B00", sublinks: ["/calendar", "/albums", "/tickets", "/venues"], step: 4 },
  { id: "cult", label: "CULT", color: "#CC44FF", sublinks: ["/doctrine", "/ritual", "/status", "/operators", "/forum"], step: 4 },
  { id: "forum", label: "FORUM", color: "#00FF9F", sublinks: ["/threads", "/confessions", "/deadletters"], step: 5 },
  { id: "finance", label: "FINANCE", color: "#FF3366", sublinks: ["/transactions", "/anomalies", "/beneficiaries"], step: 5, locked: true },
  { id: "trace-node", label: "TRACE-NODE", color: "#00FF41", sublinks: ["/terminal", "/nodes", "/trace", "/verification", "/output"], step: 6, locked: true },
]

function PlaceholderPage({ siteId }: { siteId: string }) {
  const site = SITES.find((s) => s.id === siteId)!
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", letterSpacing: "0.3em", marginBottom: 10 }}>
          {site.locked ? "LOCKED SITE" : "ACTIVE SITE"} — {site.label}
        </div>
        <GlitchText text={site.label} as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={site.color} />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${site.color}, transparent)`, marginTop: 10, opacity: 0.4 }} />
      </div>

      {site.locked && (
        <div style={{ padding: "16px", border: "1px solid #FF003340", background: "#0d0505", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#FF0033", letterSpacing: "0.1em" }}>
            [LOCKED] — Изисква специфични токени от предишни сайтове.
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {site.sublinks.map((sub) => (
          <div key={sub} style={{ padding: "8px 16px", fontSize: 10, fontFamily: "var(--font-mono)", color: "#222222", letterSpacing: "0.1em", background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
            {sub.replace("/", "").toUpperCase()}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "12px 14px", border: "1px solid #1a1a1a", fontSize: 9, fontFamily: "var(--font-mono)", color: "#222222" }}>
        [COMING IN STEP {site.step}]
      </div>
    </div>
  )
}

export function LeaksPage() { return <PlaceholderPage siteId="leaks" /> }
export function EventsPage() { return <PlaceholderPage siteId="events" /> }
export function CultPage() { return <PlaceholderPage siteId="cult" /> }
export function ForumPage() { return <PlaceholderPage siteId="forum" /> }
export function FinancePage() { return <PlaceholderPage siteId="finance" /> }
export function TraceNodePage() { return <PlaceholderPage siteId="trace-node" /> }
