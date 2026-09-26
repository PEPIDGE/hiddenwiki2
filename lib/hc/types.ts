// ============================================================
// HIDDEN COIN — shared types (safe to import on client & server)
// ============================================================

export interface StoredClue {
  id: string
  title: string
  text: string
  sourceRoute: string
  confidence: number
  status: "unverified" | "confirmed" | "suspicious"
  timestamp: number
}

// The authoritative, server-side player record.
export interface PlayerRecord {
  code: string // login code (primary key)
  handle: string // display name for the player
  coins: number
  completedTasks: string[] // task ids already rewarded (one-time)
  solvedPuzzles: string[]
  unlockedRoutes: string[]
  clues: StoredClue[]
  createdAt: number
  updatedAt: number
}

// What the client is allowed to see about itself.
export interface PublicPlayerState {
  handle: string
  coins: number
  completedTasks: string[]
  solvedPuzzles: string[]
  unlockedRoutes: string[]
  clues: StoredClue[]
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
    solvedPuzzles: p.solvedPuzzles,
    unlockedRoutes: p.unlockedRoutes,
    clues: p.clues,
  }
}
