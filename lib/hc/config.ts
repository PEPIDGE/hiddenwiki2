// ============================================================
// HIDDEN COIN — shared config (client + server safe, no secrets)
// ============================================================

import type { PlayerProgress } from "./types"

export const HC_COOKIE = "hc_session"
export const HC_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

// Routes every player can reach from the start.
export const INITIAL_UNLOCKED_ROUTES: string[] = [
  "/hidden-wiki-2/moneytasks",
  "/hidden-wiki-2/moneytasks/services",
  "/hidden-wiki-2/moneytasks/puzzels",
  "/hidden-wiki-2/moneytasks/trivia",
  "/hidden-wiki-2/red-room",
  "/hidden-wiki-2/leaks",
  "/hidden-wiki-2/cult",
  "/hidden-wiki-2/events",
  "/hidden-wiki-2/forum",
  "/hidden-wiki-2/finance",
  "/hidden-wiki-2/trace-node",
  "/hidden-wiki-2/trace-node/terminal",
  "/hidden-wiki-2/trace-node/nodes",
  "/hidden-wiki-2/trace-node/trace",
  "/hidden-wiki-2/trace-node/output",
  "/hidden-wiki-2/trace-node/verification",
  "/hidden-wiki-2/red-room/full-truth",
  "/hidden-wiki-2/red-room/donors",
  "/hidden-wiki-2/red-room/chat-replay",
  "/hidden-wiki-2/red-room/signal-log",
  "/hidden-wiki-2/leaks/docs",
  "/hidden-wiki-2/leaks/archive",
  "/hidden-wiki-2/leaks/vehicles",
  "/hidden-wiki-2/leaks/cards",
  "/hidden-wiki-2/leaks/passwords",
  "/hidden-wiki-2/cult/operators",
  "/hidden-wiki-2/cult/chat-system",
  "/hidden-wiki-2/events/calendar",
  "/hidden-wiki-2/events/albums",
  "/hidden-wiki-2/events/guestbook",
  "/hidden-wiki-2/forum/threads",
  "/hidden-wiki-2/forum/confessions",
  "/hidden-wiki-2/forum/deadletters",
  "/hidden-wiki-2/finance/transactions",
  "/hidden-wiki-2/finance/anomalies",
  "/hidden-wiki-2/finance/beneficiaries",
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
