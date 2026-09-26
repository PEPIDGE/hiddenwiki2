// ============================================================
// HIDDEN COIN — progress sanitiser (server only)
//
// The browser sends its whole game progress; nothing is trusted as-is.
// Every field is type-checked, trimmed and capped before it is stored.
// Coins and rewarded tasks are NOT part of progress — the client can
// never change them through this path.
// ============================================================

import { emptyProgress } from "./config"
import type { ClueStatus, FinalOutput, PlayerProgress, StoredClue } from "./types"

const LIMITS = {
  routes: 400,
  routeLen: 200,
  puzzles: 300,
  keyLen: 120,
  records: 300,
  clues: 500,
  clueId: 200,
  clueTitle: 300,
  clueText: 2000,
  verdict: 2000,
  caseId: 64,
}

const STATUSES: ClueStatus[] = ["unverified", "confirmed", "suspicious"]

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : ""
}

function strList(v: unknown, maxItems: number, maxLen: number, filter?: (s: string) => boolean): string[] {
  if (!Array.isArray(v)) return []
  const out = new Set<string>()
  for (const item of v) {
    if (out.size >= maxItems) break
    const s = str(item, maxLen).trim()
    if (s && (!filter || filter(s))) out.add(s)
  }
  return [...out]
}

function numRecord(v: unknown, min: number, max: number): Record<string, number> {
  const out: Record<string, number> = {}
  if (!v || typeof v !== "object" || Array.isArray(v)) return out
  let n = 0
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (n >= LIMITS.records) break
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue
    out[k.slice(0, LIMITS.keyLen)] = Math.min(max, Math.max(min, Math.floor(raw)))
    n++
  }
  return out
}

function boolRecord(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  if (!v || typeof v !== "object" || Array.isArray(v)) return out
  let n = 0
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (n >= LIMITS.records) break
    if (typeof raw !== "boolean") continue
    out[k.slice(0, LIMITS.keyLen)] = raw
    n++
  }
  return out
}

function clue(v: unknown): StoredClue | null {
  if (!v || typeof v !== "object") return null
  const c = v as Record<string, unknown>
  const id = str(c.id, LIMITS.clueId).trim()
  if (!id) return null
  const status = STATUSES.includes(c.status as ClueStatus) ? (c.status as ClueStatus) : "unverified"
  const confidence = typeof c.confidence === "number" && Number.isFinite(c.confidence) ? Math.min(5, Math.max(0, Math.round(c.confidence))) : 0
  const timestamp = typeof c.timestamp === "number" && Number.isFinite(c.timestamp) ? Math.floor(c.timestamp) : Date.now()
  return {
    id,
    title: str(c.title, LIMITS.clueTitle) || id,
    text: str(c.text, LIMITS.clueText),
    sourceRoute: str(c.sourceRoute, LIMITS.routeLen),
    confidence,
    status,
    timestamp,
  }
}

function clueList(v: unknown, max: number): StoredClue[] {
  if (!Array.isArray(v)) return []
  const seen = new Set<string>()
  const out: StoredClue[] = []
  for (const item of v) {
    if (out.length >= max) break
    const c = clue(item)
    if (c && !seen.has(c.id)) {
      seen.add(c.id)
      out.push(c)
    }
  }
  return out
}

function finalOutput(v: unknown): FinalOutput | null {
  if (!v || typeof v !== "object") return null
  const f = v as Record<string, unknown>
  const verdict = str(f.verdict, LIMITS.verdict)
  const caseId = str(f.caseId, LIMITS.caseId)
  if (!verdict || !caseId) return null
  return { clues: clueList(f.clues, 3), verdict, caseId }
}

const isGameRoute = (s: string) => s.startsWith("/hidden-wiki-2") || s === "/"

export function sanitizeProgress(input: unknown): PlayerProgress {
  const base = emptyProgress()
  if (!input || typeof input !== "object") return base
  const p = input as Record<string, unknown>
  return {
    unlockedRoutes: strList(p.unlockedRoutes, LIMITS.routes, LIMITS.routeLen, isGameRoute),
    visitedRoutes: strList(p.visitedRoutes, LIMITS.routes, LIMITS.routeLen, isGameRoute),
    solvedPuzzles: strList(p.solvedPuzzles, LIMITS.puzzles, LIMITS.keyLen),
    tokens: boolRecord(p.tokens),
    clues: clueList(p.clues, LIMITS.clues),
    attempts: numRecord(p.attempts, 0, 1_000_000),
    cooldownUntil: numRecord(p.cooldownUntil, 0, 32_503_680_000_000),
    finalOutput: finalOutput(p.finalOutput),
  }
}

// Fill in anything missing from records written by older versions.
export function normalizeStoredProgress(v: unknown): PlayerProgress {
  if (!v || typeof v !== "object" || Object.keys(v as object).length === 0) return emptyProgress()
  return sanitizeProgress(v)
}
