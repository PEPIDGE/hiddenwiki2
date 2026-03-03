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
}

export const INITIAL_STATE: GameState = {
  unlockedRoutes: [
    "/hidden-wiki-2/red-room",
    "/hidden-wiki-2/mirrors",
    "/hidden-wiki-2/leaks",
    "/hidden-wiki-2/events",
    "/hidden-wiki-2/cult",
    "/hidden-wiki-2/forum",
  ],
  visitedRoutes: [],
  solvedPuzzles: [],
  tokens: {},
  clues: [],
  attempts: {},
  cooldownUntil: {},
  progress: 0,
}

export const ROUTES_CONFIG = [
  {
    id: "red-room",
    path: "/hidden-wiki-2/red-room",
    label: "RED ROOM",
    accentColor: "#FF0033",
    status: "ENTRY",
    locked: false,
    sublinks: ["/frames", "/chat-replay", "/operator-view"],
  },
  {
    id: "mirrors",
    path: "/hidden-wiki-2/mirrors",
    label: "MIRRORS",
    accentColor: "#00BFFF",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/gallery", "/quotes", "/cache"],
  },
  {
    id: "leaks",
    path: "/hidden-wiki-2/leaks",
    label: "LEAKS",
    accentColor: "#FFD700",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/vault", "/docs", "/hash-lab", "/members"],
  },
  {
    id: "events",
    path: "/hidden-wiki-2/events",
    label: "EVENTS",
    accentColor: "#FF6B00",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/calendar", "/albums", "/tickets", "/venues"],
  },
  {
    id: "cult",
    path: "/hidden-wiki-2/cult",
    label: "CULT",
    accentColor: "#CC44FF",
    status: "ACTIVE",
    locked: false,
    sublinks: ["/doctrine", "/ritual", "/status", "/operators", "/forum"],
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
    status: "LOCKED",
    locked: true,
    sublinks: ["/transactions", "/anomalies", "/beneficiaries"],
  },
  {
    id: "trace-node",
    path: "/hidden-wiki-2/trace-node",
    label: "TRACE-NODE",
    accentColor: "#00FF41",
    status: "FINAL",
    locked: true,
    sublinks: ["/terminal", "/nodes", "/trace", "/verification", "/output"],
  },
]

export const CANON_ANCHORS = [
  { id: "anchor-1", label: "18:30", description: "Час на излизане" },
  { id: "anchor-2", label: "Черен Audi A3", description: "Превозно средство" },
  { id: "anchor-3", label: "22:17", description: "Телефонът пада" },
  { id: "anchor-4", label: "03:17", description: "Повтарящ се мотив" },
  { id: "anchor-5", label: "Огледален преход", description: "Покана — без локация" },
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
