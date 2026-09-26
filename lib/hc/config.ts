// ============================================================
// HIDDEN COIN — shared config (client + server safe, no secrets)
// ============================================================

export const HC_COOKIE = "hc_session"
export const HC_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

// Routes every player can reach from the start. Locked/earned routes are
// added to a player's record as they progress.
export const INITIAL_UNLOCKED_ROUTES: string[] = [
  "/hidden-wiki-2",
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
  "/hidden-wiki-2/getrich",
  "/hidden-wiki-2/trace-node",
]
