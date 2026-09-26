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
import { emptyMarket, type MarketState } from "@/lib/blackmarket/types"

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
  saveMarket(expected: PlayerRecord, market: MarketState, cost: number): Promise<boolean>
}

// ── Neon backend ───────────────────────────────────────────────────

interface PlayerRow {
  code: string
  handle: string
  coins: number
  completed_tasks: unknown
  progress: unknown
  blackmarket: MarketState | null
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
    blackmarket: { ...emptyMarket(), ...r.blackmarket },
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
        await sql`ALTER TABLE hc_players ADD COLUMN IF NOT EXISTS blackmarket JSONB NOT NULL DEFAULT '{}'::jsonb`
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

    async saveMarket(expected, market, cost) {
      await init()
      // Optimistic transaction: debit and deliver together. A competing request
      // retries from fresh state, preventing duplicate purchases and lost messages.
      const rows = await sql`
        UPDATE hc_players
        SET coins = coins - ${cost}, blackmarket = ${JSON.stringify(market)}::jsonb, updated_at = now()
        WHERE code = ${expected.code} AND coins = ${expected.coins} AND coins >= ${cost}
          AND COALESCE((blackmarket->>'revision')::int, 0) = ${expected.blackmarket.revision}
        RETURNING code`
      return rows.length === 1
    },

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
  const dataDir = path.resolve(process.env.HW2_DATA_DIR || path.join(process.cwd(), ".data"))
  const dataFile = path.join(dataDir, "hc-players.json")

  const fresh = (code: string, handle: string): PlayerRecord => {
    const now = Date.now()
    return { code, handle, coins: 0, completedTasks: [], blackmarket: emptyMarket(), progress: emptyProgress(), createdAt: now, updatedAt: now }
  }

  const load = async () => {
    let db: Record<string, PlayerRecord> = {}
    try {
      db = JSON.parse(await fs.readFile(dataFile, "utf-8"))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    }
    for (const p of Object.values(db)) {
      p.completedTasks = Array.isArray(p.completedTasks) ? p.completedTasks : []
      p.progress = normalizeStoredProgress(p.progress)
      p.blackmarket = { ...emptyMarket(), ...p.blackmarket }
    }
    const seed = seedCode()
    if (seed && !db[seed]) db[seed] = fresh(seed, SEED_HANDLE)
    return db
  }

  // RSC and API handlers can have different module instances. Read fresh data
  // and serialize file writes across them, just as the database does in production.
  const update = async <T,>(change: (db: Record<string, PlayerRecord>) => T): Promise<T> => {
    await fs.mkdir(dataDir, { recursive: true })
    const lockFile = `${dataFile}.lock`
    let lock: Awaited<ReturnType<typeof fs.open>> | undefined
    for (let attempt = 0; attempt < 200; attempt++) {
      try { lock = await fs.open(lockFile, "wx"); break }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }
    if (!lock) throw new Error("Player store is busy. Retry the request.")
    try {
      const db = await load()
      const result = change(db)
      const tmp = `${dataFile}.tmp`
      await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf-8")
      await fs.rename(tmp, dataFile)
      return result
    } finally {
      await lock.close()
      await fs.unlink(lockFile)
    }
  }

  return {
    async saveMarket(expected, market, cost) {
      return update((db) => {
        const p = db[expected.code]
        if (!p || p.coins !== expected.coins || p.coins < cost || p.blackmarket.revision !== expected.blackmarket.revision) return false
        p.coins -= cost
        p.blackmarket = market
        p.updatedAt = Date.now()
        return true
      })
    },
    async getPlayer(code) {
      const p = (await load())[code]
      return p ? structuredClone(p) : null
    },
    async createPlayer(code, handle) {
      return update((db) => {
        if (!db[code]) db[code] = fresh(code, handle)
        return db[code]
      })
    },
    async awardTask(code, taskId, amount) {
      return update((db) => {
        const p = db[code]
        if (!p) return null
        if (p.completedTasks.includes(taskId)) return { player: p, awarded: false }
        p.coins += amount
        p.completedTasks.push(taskId)
        p.updatedAt = Date.now()
        return { player: p, awarded: true }
      })
    },
    async saveProgress(code, progress) {
      return update((db) => {
        const p = db[code]
        if (!p) return null
        p.progress = progress
        p.updatedAt = Date.now()
        return p
      })
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
export const saveMarket = (expected: PlayerRecord, market: MarketState, cost: number) => getBackend().saveMarket(expected, market, cost)
