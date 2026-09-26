// ============================================================
// HIDDEN COIN — player store (server only)
//
// Backend is chosen at runtime:
//   • DATABASE_URL set  → Neon Postgres (tables are created on first use)
//   • otherwise         → JSON file at <cwd>/.data/hc-players.json (dev)
//
// Every player owns one row: coins, rewarded task ids and the full game
// progress (clues, puzzles, tokens, attempts, visited/unlocked pages,
// final verdict). Coin payouts also go into an append-only ledger whose
// UNIQUE(code, task_id) makes a double payout impossible.
// ============================================================

import { promises as fs } from "node:fs"
import path from "node:path"
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { emptyProgress } from "./config"
import { normalizeStoredProgress } from "./progress"
import type { PlayerProgress, PlayerRecord } from "./types"

// ── Seed player ────────────────────────────────────────────────────
// In development a default test code exists. In production a seed player
// is created only when HC_SEED_CODE is explicitly configured.
const DEV_SEED_CODE = "HW2-ALPHA-7731"
const SEED_HANDLE = "agent-01"

function seedCode(): string | null {
  const fromEnv = process.env.HC_SEED_CODE?.trim()
  if (fromEnv && !fromEnv.includes("XXXX")) return fromEnv
  return process.env.NODE_ENV === "production" ? null : DEV_SEED_CODE
}

export interface AwardResult {
  player: PlayerRecord
  awarded: boolean
}

interface Backend {
  getPlayer(code: string): Promise<PlayerRecord | null>
  createPlayer(code: string, handle: string): Promise<PlayerRecord>
  awardTask(code: string, taskId: string, amount: number): Promise<AwardResult | null>
  saveProgress(code: string, progress: PlayerProgress): Promise<PlayerRecord | null>
}

// ── Neon backend ───────────────────────────────────────────────────

interface PlayerRow {
  code: string
  handle: string
  coins: number
  completed_tasks: unknown
  progress: unknown
  created_at: string | Date
  updated_at: string | Date
}

function rowToPlayer(r: PlayerRow): PlayerRecord {
  return {
    code: r.code,
    handle: r.handle,
    coins: Number(r.coins) || 0,
    completedTasks: Array.isArray(r.completed_tasks) ? (r.completed_tasks as string[]) : [],
    progress: normalizeStoredProgress(r.progress),
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }
}

function neonBackend(url: string): Backend {
  const sql: NeonQueryFunction<false, false> = neon(url)
  let ready: Promise<void> | null = null

  const init = () => {
    if (!ready) {
      ready = (async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS hc_players (
            code            TEXT PRIMARY KEY,
            handle          TEXT NOT NULL,
            coins           INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
            completed_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
            progress        JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
          )`
        await sql`
          CREATE TABLE IF NOT EXISTS hc_ledger (
            id         BIGSERIAL PRIMARY KEY,
            code       TEXT NOT NULL REFERENCES hc_players(code) ON DELETE CASCADE,
            task_id    TEXT NOT NULL,
            amount     INTEGER NOT NULL CHECK (amount > 0),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (code, task_id)
          )`
        const seed = seedCode()
        if (seed) {
          await sql`
            INSERT INTO hc_players (code, handle, progress)
            VALUES (${seed}, ${SEED_HANDLE}, ${JSON.stringify(emptyProgress())}::jsonb)
            ON CONFLICT (code) DO NOTHING`
        }
      })().catch((err) => {
        ready = null // retry on the next request
        throw err
      })
    }
    return ready
  }

  const getPlayer = async (code: string) => {
    await init()
    const rows = (await sql`SELECT * FROM hc_players WHERE code = ${code}`) as PlayerRow[]
    return rows[0] ? rowToPlayer(rows[0]) : null
  }

  return {
    getPlayer,

    async createPlayer(code, handle) {
      await init()
      await sql`
        INSERT INTO hc_players (code, handle, progress)
        VALUES (${code}, ${handle}, ${JSON.stringify(emptyProgress())}::jsonb)
        ON CONFLICT (code) DO NOTHING`
      return (await getPlayer(code))!
    },

    async awardTask(code, taskId, amount) {
      await init()
      // One statement: the ledger insert and the balance update either both
      // happen or neither does; a repeat claim hits the UNIQUE constraint.
      const rows = (await sql`
        WITH ins AS (
          INSERT INTO hc_ledger (code, task_id, amount)
          SELECT ${code}, ${taskId}, ${amount}
          WHERE EXISTS (SELECT 1 FROM hc_players WHERE code = ${code})
          ON CONFLICT (code, task_id) DO NOTHING
          RETURNING amount
        )
        UPDATE hc_players p
        SET coins = p.coins + ins.amount,
            completed_tasks = p.completed_tasks || jsonb_build_array(${taskId}::text),
            updated_at = now()
        FROM ins
        WHERE p.code = ${code}
        RETURNING p.*`) as PlayerRow[]
      if (rows[0]) return { player: rowToPlayer(rows[0]), awarded: true }
      const player = await getPlayer(code)
      return player ? { player, awarded: false } : null
    },

    async saveProgress(code, progress) {
      await init()
      const rows = (await sql`
        UPDATE hc_players
        SET progress = ${JSON.stringify(progress)}::jsonb, updated_at = now()
        WHERE code = ${code}
        RETURNING *`) as PlayerRow[]
      return rows[0] ? rowToPlayer(rows[0]) : null
    },
  }
}

// ── File backend (local development) ──────────────────────────────

function fileBackend(): Backend {
  const dataDir = path.join(process.cwd(), ".data")
  const dataFile = path.join(dataDir, "hc-players.json")
  let cache: Record<string, PlayerRecord> | null = null
  let writeQueue: Promise<void> = Promise.resolve()

  const fresh = (code: string, handle: string): PlayerRecord => {
    const now = Date.now()
    return { code, handle, coins: 0, completedTasks: [], progress: emptyProgress(), createdAt: now, updatedAt: now }
  }

  const load = async () => {
    if (cache) return cache
    let db: Record<string, PlayerRecord> = {}
    try {
      db = JSON.parse(await fs.readFile(dataFile, "utf-8"))
    } catch {
      db = {}
    }
    for (const p of Object.values(db)) {
      p.completedTasks = Array.isArray(p.completedTasks) ? p.completedTasks : []
      p.progress = normalizeStoredProgress(p.progress)
    }
    const seed = seedCode()
    if (seed && !db[seed]) db[seed] = fresh(seed, SEED_HANDLE)
    cache = db
    return cache
  }

  const persist = () => {
    writeQueue = writeQueue.then(async () => {
      if (!cache) return
      await fs.mkdir(dataDir, { recursive: true })
      const tmp = `${dataFile}.tmp`
      await fs.writeFile(tmp, JSON.stringify(cache, null, 2), "utf-8")
      await fs.rename(tmp, dataFile)
    })
    return writeQueue
  }

  return {
    async getPlayer(code) {
      return (await load())[code] ?? null
    },
    async createPlayer(code, handle) {
      const db = await load()
      if (!db[code]) {
        db[code] = fresh(code, handle)
        await persist()
      }
      return db[code]
    },
    async awardTask(code, taskId, amount) {
      const p = (await load())[code]
      if (!p) return null
      // Node runs this synchronously between awaits, so check+write is atomic.
      if (p.completedTasks.includes(taskId)) return { player: p, awarded: false }
      p.coins += amount
      p.completedTasks.push(taskId)
      p.updatedAt = Date.now()
      await persist()
      return { player: p, awarded: true }
    },
    async saveProgress(code, progress) {
      const p = (await load())[code]
      if (!p) return null
      p.progress = progress
      p.updatedAt = Date.now()
      await persist()
      return p
    },
  }
}

// ── Backend selection ──────────────────────────────────────────────

let backend: Backend | null = null

function getBackend(): Backend {
  if (backend) return backend
  const url = process.env.DATABASE_URL?.trim()
  if (url && !url.includes("XXXX")) {
    backend = neonBackend(url)
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("[hidden-coin] DATABASE_URL is not set — using the local file store. Data will not persist on serverless hosts.")
    }
    backend = fileBackend()
  }
  return backend
}

export const getPlayer = (code: string) => getBackend().getPlayer(code)
export const createPlayer = (code: string, handle: string) => getBackend().createPlayer(code, handle)
export const awardTask = (code: string, taskId: string, amount: number) => getBackend().awardTask(code, taskId, amount)
export const saveProgress = (code: string, progress: PlayerProgress) => getBackend().saveProgress(code, progress)
