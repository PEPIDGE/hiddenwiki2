"use client"

// ============================================================
// TORSHELL — GAME STATE MODEL
// ============================================================

export type ClueStatus = "unverified" | "confirmed" | "suspicious"

export interface Clue {
  id: string
  title: string
  text: string
  sourceRoute: string
  confidence: number // 0-5
  status: ClueStatus
  timestamp?: number
}

export interface GameState {
  unlockedRoutes: string[]
  visitedRoutes: string[]
  solvedPuzzles: string[]
  tokens: Record<string, boolean>
  clues: Clue[]
  attempts: Record<string, number>
  cooldownUntil: Record<string, number>
  progress: number
  hiddenCoins: number
}

export const INITIAL_STATE: GameState = {
  unlockedRoutes: [
    "/hidden-wiki-2/red-room",
    "/hidden-wiki-2/leaks",
    "/hidden-wiki-2/cult",
    "/hidden-wiki-2/events",
    "/hidden-wiki-2/forum",
    "/hidden-wiki-2/finance",
    "/hidden-wiki-2/getrich",
  ],
  visitedRoutes: [],
  solvedPuzzles: [],
  tokens: {},
  clues: [],
  attempts: {},
  cooldownUntil: {},
  progress: 0,
  hiddenCoins: 1000000,
}

export const ROUTES_CONFIG = [
  {
    id: "red-room",
    path: "/hidden-wiki-2/red-room",
    label: "RED ROOM",
    accentColor: "#FF0033",
    status: "ENTRY",
    locked: false,
    sublinks: ["/full-truth", "/donors", "/chat-replay", "/signal-log"],
  },
  {
    id: "leaks",
    path: "/hidden-wiki-2/leaks",
    label: "LEAKS",
    accentColor: "#FFD700",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/docs", "/archive", "/vehicles", "/cards", "/passwords"],
  },
  {
    id: "cult",
    path: "/hidden-wiki-2/cult",
    label: "CULT",
    accentColor: "#CC44FF",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/operators", "/chat-system"],
  },
  {
    id: "events",
    path: "/hidden-wiki-2/events",
    label: "EVENTS",
    accentColor: "#FF6B00",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/calendar", "/albums", "/guestbook"],
  },
  {
    id: "forum",
    path: "/hidden-wiki-2/forum",
    label: "FORUM",
    accentColor: "#00FF9F",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/threads", "/confessions", "/deadletters"],
  },
  {
    id: "finance",
    path: "/hidden-wiki-2/finance",
    label: "FINANCE",
    accentColor: "#FF3366",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/transactions", "/anomalies", "/beneficiaries"],
  },
  {
    id: "getrich",
    path: "/hidden-wiki-2/getrich",
    label: "GETRICH",
    accentColor: "#00FF41",
    status: "ACTIVE",
    locked: false,
    sublinks: [],
  },
  {
    id: "trace-node",
    path: "/hidden-wiki-2/trace-node",
    label: "TRACE-NODE",
    accentColor: "#00FF41",
    status: "FINAL",
    locked: false,
    sublinks: ["/terminal", "/nodes", "/trace", "/verification", "/output"],
  },
]

export const CANON_ANCHORS = [
  { id: "anchor-1", label: "22:09", description: "Черен Audi A3 пред бл. 14" },
  { id: "anchor-2", label: "22:12", description: "Последен сигнал на Лора" },
  { id: "anchor-3", label: "+359 88 412 1221", description: "Телефон на NightKiller / Братство" },
  { id: "anchor-4", label: "Захарна фабрика — стая 9", description: "Местоположение на Лора" },
  { id: "anchor-5", label: "Р. Алексиев / RedFox", description: "Организаторът — тетрабеназин" },
]

export function getGameState(): GameState {
  if (typeof window === "undefined") return INITIAL_STATE
  try {
    const raw = localStorage.getItem("torshell_state")
    if (!raw) return INITIAL_STATE
    return { ...INITIAL_STATE, ...JSON.parse(raw) }
  } catch {
    return INITIAL_STATE
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return
  localStorage.setItem("torshell_state", JSON.stringify(state))
}

export function isRouteUnlocked(path: string, state: GameState): boolean {
  return state.unlockedRoutes.includes(path)
}

export function hasCooldown(puzzleId: string, state: GameState): number {
  const until = state.cooldownUntil[puzzleId]
  if (!until) return 0
  const remaining = until - Date.now()
  return remaining > 0 ? remaining : 0
}

export function addVisitedRoute(path: string): GameState {
  const state = getGameState()
  if (state.visitedRoutes.includes(path)) return state
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

export function addCoins(state: GameState, amount: number): GameState {
  const newState = { ...state, hiddenCoins: (state.hiddenCoins ?? 0) + amount }
  saveGameState(newState)
  return newState
}

export function spendCoins(state: GameState, amount: number): GameState | null {
  if ((state.hiddenCoins ?? 0) < amount) return null
  const newState = { ...state, hiddenCoins: (state.hiddenCoins ?? 0) - amount }
  saveGameState(newState)
  return newState
}

export function getCoins(state: GameState): number {
  return state.hiddenCoins ?? 0
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
