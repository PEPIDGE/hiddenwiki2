// ============================================================
// Hidden Coin — player admin (Neon)
//
//   npm run hc -- add HW2-ABCD-1234 agent-02   add a player code
//   npm run hc -- list                         list players + balances
//   npm run hc -- remove HW2-ABCD-1234         delete a player (and ledger)
//
// Reads DATABASE_URL from .env.local.
// ============================================================

import { neon } from "@neondatabase/serverless"

const url = process.env.DATABASE_URL?.trim()
if (!url || url.includes("XXXX")) {
  console.error("DATABASE_URL is not set in .env.local")
  process.exit(1)
}
const sql = neon(url)

const EMPTY_PROGRESS = {
  unlockedRoutes: [],
  visitedRoutes: [],
  solvedPuzzles: [],
  tokens: {},
  clues: [],
  attempts: {},
  cooldownUntil: {},
  finalOutput: null,
}

async function ensureSchema() {
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
}

const [cmd, arg1, arg2] = process.argv.slice(2)
await ensureSchema()

if (cmd === "add") {
  const code = (arg1 ?? "").trim().toUpperCase()
  if (!/^[A-Z0-9-]{4,64}$/.test(code)) {
    console.error("Code must be 4-64 chars: A-Z, 0-9, '-'")
    process.exit(1)
  }
  const handle = (arg2 ?? "agent").slice(0, 40)
  const rows = await sql`
    INSERT INTO hc_players (code, handle, progress)
    VALUES (${code}, ${handle}, ${JSON.stringify(EMPTY_PROGRESS)}::jsonb)
    ON CONFLICT (code) DO NOTHING
    RETURNING code`
  console.log(rows.length ? `added ${code} (${handle})` : `${code} already exists`)
} else if (cmd === "list") {
  const rows = await sql`
    SELECT code, handle, coins, jsonb_array_length(completed_tasks) AS tasks,
           jsonb_array_length(COALESCE(progress->'clues', '[]'::jsonb)) AS clues, updated_at
    FROM hc_players ORDER BY created_at`
  console.table(rows)
} else if (cmd === "remove") {
  const code = (arg1 ?? "").trim().toUpperCase()
  const rows = await sql`DELETE FROM hc_players WHERE code = ${code} RETURNING code`
  console.log(rows.length ? `removed ${code}` : `${code} not found`)
} else {
  console.log("usage: npm run hc -- add <CODE> [handle] | list | remove <CODE>")
}
