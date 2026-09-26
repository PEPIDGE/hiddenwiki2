"use client"

// ============================================================
// TORSHELL — GAME STATE MODEL
//
// The player's progress lives in the database (see lib/hc). This module
// keeps an in-memory copy for the current tab: it is hydrated from the
// server right after login (HcProvider) and every saveGameState() is
// pushed back to /api/hc/progress. Nothing is kept in localStorage, so
// two players on the same browser never see each other's progress.
// ============================================================

import { emptyProgress, INITIAL_UNLOCKED_ROUTES } from "@/lib/hc/config"
import type { ClueStatus, FinalOutput, PlayerProgress, StoredClue } from "@/lib/hc/types"

export type { ClueStatus }
export type Clue = StoredClue

export interface GameState {
  unlockedRoutes: string[]
  visitedRoutes: string[]
  solvedPuzzles: string[]
  tokens: Record<string, boolean>
  clues: Clue[]
  attempts: Record<string, number>
  cooldownUntil: Record<string, number>
  finalOutput: FinalOutput | null
  progress: number
}

export const INITIAL_STATE: GameState = {
  unlockedRoutes: [...INITIAL_UNLOCKED_ROUTES],
  visitedRoutes: [],
  solvedPuzzles: [],
  tokens: {},
  clues: [],
  attempts: {},
  cooldownUntil: {},
  finalOutput: null,
  progress: 0,
}

// ============================================================
// PALETTE — three colors only.
//   GREEN  = system / most sections
//   AMBER  = leaks family + highlights
//   RED    = red-room / danger / destructive
// ============================================================
export const PALETTE = {
  green: "#00FF41",
  amber: "#FFB000",
  red: "#FF0033",
} as const

export const ROUTES_CONFIG = [
  {
    id: "moneytasks",
    path: "/hidden-wiki-2/moneytasks",
    label: "MONEYTASKS",
    accentColor: PALETTE.green,
    status: "ACTIVE",
    locked: false,
    sublinks: ["/services", "/puzzels", "/trivia"],
  },
  {
    id: "red-room",
    path: "/hidden-wiki-2/red-room",
    label: "RED ROOM",
    accentColor: PALETTE.red,
    status: "ENTRY",
    locked: false,
    sublinks: ["/full-truth", "/donors", "/chat-replay", "/signal-log"],
  },
  {
    id: "leaks",
    path: "/hidden-wiki-2/leaks",
    label: "LEAKS",
    accentColor: PALETTE.amber,
    status: "ACTIVE",
    locked: false,
    sublinks: ["/docs", "/archive", "/vehicles", "/cards", "/passwords"],
  },
  {
    id: "cult",
    path: "/hidden-wiki-2/cult",
    label: "CULT",
    accentColor: PALETTE.green,
    status: "ACTIVE",
    locked: false,
    sublinks: [],
  },
  {
    id: "events",
    path: "/hidden-wiki-2/events",
    label: "EVENTS",
    accentColor: PALETTE.green,
    status: "ACTIVE",
    locked: false,
    sublinks: ["/calendar", "/albums", "/guestbook"],
  },
  {
    id: "forum",
    path: "/hidden-wiki-2/forum",
    label: "FORUM",
    accentColor: PALETTE.green,
    status: "ACTIVE",
    locked: false,
    sublinks: ["/threads", "/confessions", "/deadletters"],
  },
  {
    id: "finance",
    path: "/hidden-wiki-2/finance",
    label: "FINANCE",
    accentColor: PALETTE.green,
    status: "ACTIVE",
    locked: false,
    sublinks: ["/transactions", "/anomalies", "/beneficiaries"],
  },
  {
    id: "trace-node",
    path: "/hidden-wiki-2/trace-node",
    label: "TRACE-NODE",
    accentColor: PALETTE.green,
    status: "FINAL",
    locked: false,
    sublinks: ["/terminal", "/nodes", "/trace", "/verification", "/output"],
  },
]

// Map any clue sourceRoute to one of the three palette colors.
export function routeColor(route: string): string {
  if (route.includes("red-room")) return PALETTE.red
  if (route.includes("leaks")) return PALETTE.amber
  return PALETTE.green
}

// Clues store routes inconsistently ("/leaks/archive" vs "/hidden-wiki-2/finance").
// Normalize so navigation always lands on a real page.
export function resolveClueRoute(route: string): string {
  if (!route) return "/hidden-wiki-2"
  return route.startsWith("/hidden-wiki-2") ? route : `/hidden-wiki-2${route}`
}

export const CANON_ANCHORS = [
  { id: "anchor-1", label: "22:09", description: "Черен Audi A3 пред бл. 14" },
  { id: "anchor-2", label: "22:12", description: "Последен сигнал на Лора" },
  { id: "anchor-3", label: "+359 88 412 1221", description: "Телефон на NightKiller / Братство" },
  { id: "anchor-4", label: "Захарна фабрика — стая 9", description: "Местоположение на Лора" },
  { id: "anchor-5", label: "Р. Алексиев / RedFox", description: "Организаторът — тетрабеназин" },
]

// ============================================================
// SERVER-BACKED STATE
// ============================================================

let cache: GameState | null = null
let syncTimer: ReturnType<typeof setTimeout> | null = null
let pending = false
const SYNC_DELAY_MS = 350

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

function toProgress(state: GameState): PlayerProgress {
  return {
    unlockedRoutes: state.unlockedRoutes,
    visitedRoutes: state.visitedRoutes,
    solvedPuzzles: state.solvedPuzzles,
    tokens: state.tokens,
    clues: state.clues,
    attempts: state.attempts,
    cooldownUntil: state.cooldownUntil,
    finalOutput: state.finalOutput,
  }
}

function pushToServer(keepalive = false) {
  if (!cache || !pending) return
  pending = false
  const body = JSON.stringify({ progress: toProgress(cache) })
  fetch("/api/hc/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: keepalive && body.length < 60_000,
  }).catch(() => {
    pending = true // retry with the next change / flush
  })
}

function scheduleSync() {
  pending = true
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    syncTimer = null
    pushToServer()
  }, SYNC_DELAY_MS)
}

// Send anything unsaved before the tab goes away.
export function flushGameState() {
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
  pushToServer(true)
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushGameState)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushGameState()
  })
  // Legacy local copies from before progress moved to the database.
  try {
    localStorage.removeItem("torshell_state")
    localStorage.removeItem("torshell_final_output")
    localStorage.removeItem("gr_claimed")
  } catch {
    // storage blocked — nothing to clean
  }
}

// Called once after login with the progress stored in the database.
export function hydrateGameState(progress: PlayerProgress | null | undefined) {
  const p = progress ?? emptyProgress()
  const state: GameState = {
    ...INITIAL_STATE,
    ...clone(p),
    unlockedRoutes: p.unlockedRoutes?.length ? [...p.unlockedRoutes] : [...INITIAL_UNLOCKED_ROUTES],
    progress: 0,
  }
  state.progress = calculateProgress(state)
  cache = state
  pending = false
}

export function isGameStateHydrated(): boolean {
  return cache !== null
}

// Wipe the in-memory copy (logout).
export function clearGameState() {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = null
  pending = false
  cache = null
}

export function getGameState(): GameState {
  return clone(cache ?? INITIAL_STATE)
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return
  cache = clone(state)
  scheduleSync()
}

export function isRouteUnlocked(_path: string, _state: GameState): boolean {
  return true
}

export function hasCooldown(puzzleId: string, state: GameState): number {
  const until = state.cooldownUntil[puzzleId]
  if (!until) return 0
  const remaining = until - Date.now()
  return remaining > 0 ? remaining : 0
}

export function addVisitedRoute(path: string): GameState {
  const state = getGameState()
  if (!cache || state.visitedRoutes.includes(path)) return state
  const newState = { ...state, visitedRoutes: [...state.visitedRoutes, path] }
  saveGameState(newState)
  return newState
}

export function addClue(state: GameState, clue: Clue): GameState {
  const exists = state.clues.find((c) => c.id === clue.id)
  if (exists) return state
  const newState = {
    ...state,
    clues: [...state.clues, { ...clue, timestamp: Date.now() }],
  }
  newState.progress = calculateProgress(newState)
  return newState
}

export function removeClue(state: GameState, clueId: string): GameState {
  const newState = {
    ...state,
    clues: state.clues.filter((c) => c.id !== clueId),
  }
  newState.progress = calculateProgress(newState)
  saveGameState(newState)
  return newState
}

export function calculateProgress(state: GameState): number {
  const totalPuzzles = 12
  const solved = state.solvedPuzzles.length
  const confirmed = state.clues.filter((c) => c.status === "confirmed").length
  const tokenCount = Object.values(state.tokens).filter(Boolean).length
  return Math.min(
    100,
    Math.round((solved / totalPuzzles) * 50 + (confirmed / 3) * 35 + (tokenCount / 5) * 15)
  )
}
