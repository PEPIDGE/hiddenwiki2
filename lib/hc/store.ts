// ============================================================
// HIDDEN COIN — player store (server only)
//
// Default backend: JSON file at <cwd>/.data/hc-players.json, mirrored
// in an in-process cache so reads are instant and writes are atomic.
//
// Production/Neon: set DATABASE_URL and implement the two functions in
// the `neon` branch (a `players` table with a JSONB `data` column is
// enough). The rest of the app talks only to load()/save() below, so
// swapping the backend changes nothing else.
// ============================================================

import { promises as fs } from "node:fs"
import path from "node:path"
import { INITIAL_UNLOCKED_ROUTES } from "./config"
import type { PlayerRecord } from "./types"

const DATA_DIR = path.join(process.cwd(), ".data")
const DATA_FILE = path.join(DATA_DIR, "hc-players.json")

// The seed access code shipped for the first player. Give this to the
// tester; new codes are added with createPlayer().
export const SEED_CODE = process.env.HC_SEED_CODE || "HW2-ALPHA-7731"
const SEED_HANDLE = "agent-01"

type DB = Record<string, PlayerRecord>

let cache: DB | null = null
let writeQueue: Promise<void> = Promise.resolve()

function freshPlayer(code: string, handle: string): PlayerRecord {
  const now = Date.now()
  return {
    code,
    handle,
    coins: 0,
    completedTasks: [],
    solvedPuzzles: [],
    unlockedRoutes: [...INITIAL_UNLOCKED_ROUTES],
    clues: [],
    createdAt: now,
    updatedAt: now,
  }
}

async function readFile(): Promise<DB> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(raw) as DB
  } catch {
    return {}
  }
}

async function ensureLoaded(): Promise<DB> {
  if (cache) return cache
  const db = await readFile()
  // Guarantee the seed player exists so the tester can always log in.
  if (!db[SEED_CODE]) {
    db[SEED_CODE] = freshPlayer(SEED_CODE, SEED_HANDLE)
  }
  cache = db
  return cache
}

async function persist(): Promise<void> {
  // Serialise writes; best-effort on read-only filesystems (e.g. Vercel).
  writeQueue = writeQueue.then(async () => {
    if (!cache) return
    try {
      await fs.mkdir(DATA_DIR, { recursive: true })
      await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2), "utf-8")
    } catch {
      // In-memory cache stays authoritative for this process lifetime.
    }
  })
  return writeQueue
}

export async function getPlayer(code: string): Promise<PlayerRecord | null> {
  const db = await ensureLoaded()
  return db[code] ?? null
}

export async function savePlayer(player: PlayerRecord): Promise<PlayerRecord> {
  const db = await ensureLoaded()
  player.updatedAt = Date.now()
  db[player.code] = player
  await persist()
  return player
}

export async function createPlayer(code: string, handle: string): Promise<PlayerRecord> {
  const db = await ensureLoaded()
  if (db[code]) return db[code]
  const player = freshPlayer(code, handle)
  db[code] = player
  await persist()
  return player
}

// Atomically mutate a player under a lock-free read-modify-write.
export async function updatePlayer(
  code: string,
  mutate: (p: PlayerRecord) => void,
): Promise<PlayerRecord | null> {
  const db = await ensureLoaded()
  const player = db[code]
  if (!player) return null
  mutate(player)
  player.updatedAt = Date.now()
  await persist()
  return player
}
