// ============================================================
// HIDDEN COIN — shared types (safe to import on client & server)
// ============================================================

export type ClueStatus = "unverified" | "confirmed" | "suspicious"

export interface StoredClue {
  id: string
  title: string
  text: string
  sourceRoute: string
  confidence: number
  status: ClueStatus
  timestamp?: number
}

export interface FinalOutput {
  clues: StoredClue[]
  verdict: string
  caseId: string
}

// Everything the game remembers for one player. Stored in the database,
// never in the browser.
export interface PlayerProgress {
  unlockedRoutes: string[]
  visitedRoutes: string[]
  solvedPuzzles: string[]
  tokens: Record<string, boolean>
  clues: StoredClue[]
  attempts: Record<string, number>
  cooldownUntil: Record<string, number>
  finalOutput: FinalOutput | null
}

// The authoritative, server-side player record.
export interface PlayerRecord {
  code: string // login code (primary key)
  handle: string // display name for the player
  coins: number // only ever changed by the server (claim)
  completedTasks: string[] // HC task ids already rewarded (one-time)
  progress: PlayerProgress
  createdAt: number
  updatedAt: number
}

// What the client is allowed to see about itself (no login code).
export interface PublicPlayerState {
  handle: string
  coins: number
  completedTasks: string[]
  progress: PlayerProgress
}

export type TaskKind = "mission" | "quiz" | "puzzle"

// Public shape of a task — NEVER includes the answer.
export interface PublicTask {
  id: string
  kind: TaskKind
  category: "services" | "puzzels" | "trivia"
  title: string
  brief: string
  reward: number
  difficulty: "EASY" | "MEDIUM" | "HARD"
  requires: string[] // routes/pages the player should visit to solve it
  answerHint: string // what format the answer takes
  answerLabel: string // input placeholder
}

export function toPublicPlayer(p: PlayerRecord): PublicPlayerState {
  return {
    handle: p.handle,
    coins: p.coins,
    completedTasks: p.completedTasks,
    progress: p.progress,
  }
}
