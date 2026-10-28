// ============================================================
// HIDDEN COIN — shared config (client + server safe, no secrets)
// ============================================================

import type { PlayerProgress } from "./types"

export const HC_COOKIE = "hc_session"
export const HC_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
export const GAME_ROOT = "/hidden-wiki"
export const LEGACY_GAME_ROOT = "/hidden-wiki-2"

// Keep old saved progress and bookmarks working after the site rename.
export function canonicalGameRoute(route: string): string {
  if (route === LEGACY_GAME_ROOT) return GAME_ROOT
  if (route.startsWith(`${LEGACY_GAME_ROOT}/`)) {
    return `${GAME_ROOT}${route.slice(LEGACY_GAME_ROOT.length)}`
  }
  return route
}

// Routes every player can reach from the start.
export const INITIAL_UNLOCKED_ROUTES: string[] = [
  "/hidden-wiki/moneytasks",
  "/hidden-wiki/moneytasks/services",
  "/hidden-wiki/moneytasks/puzzels",
  "/hidden-wiki/moneytasks/trivia",
  "/hidden-wiki/red-room",
  "/hidden-wiki/leaks",
  "/hidden-wiki/cult",
  "/hidden-wiki/events",
  "/hidden-wiki/forum",
  "/hidden-wiki/trace-node",
  "/hidden-wiki/trace-node/terminal",
  "/hidden-wiki/trace-node/nodes",
  "/hidden-wiki/trace-node/trace",
  "/hidden-wiki/trace-node/output",
  "/hidden-wiki/trace-node/verification",
  "/hidden-wiki/red-room/full-truth",
  "/hidden-wiki/red-room/donors",
  "/hidden-wiki/red-room/chat-replay",
  "/hidden-wiki/red-room/signal-log",
  "/hidden-wiki/leaks/docs",
  "/hidden-wiki/leaks/archive",
  "/hidden-wiki/leaks/vehicles",
  "/hidden-wiki/leaks/cards",
  "/hidden-wiki/leaks/passwords",
  "/hidden-wiki/cult/operators",
  "/hidden-wiki/cult/chat-system",
  "/hidden-wiki/events/calendar",
  "/hidden-wiki/events/albums",
  "/hidden-wiki/events/guestbook",
  "/hidden-wiki/forum/threads",
  "/hidden-wiki/forum/confessions",
  "/hidden-wiki/forum/deadletters",
]

export function emptyProgress(): PlayerProgress {
  return {
    unlockedRoutes: [...INITIAL_UNLOCKED_ROUTES],
    visitedRoutes: [],
    solvedPuzzles: [],
    tokens: {},
    clues: [],
    attempts: {},
    cooldownUntil: {},
    finalOutput: null,
  }
}
