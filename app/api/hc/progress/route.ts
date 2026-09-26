import { NextRequest, NextResponse } from "next/server"
import { sanitizeProgress } from "@/lib/hc/progress"
import { getSessionCode } from "@/lib/hc/session"
import { saveProgress } from "@/lib/hc/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 512 * 1024

// Saves the player's game progress (clues, puzzles, tokens, attempts,
// visited/unlocked pages, final verdict) to the database. The payload is
// sanitised and can never touch coins or rewarded tasks.
export async function POST(req: NextRequest) {
  const code = await getSessionCode()
  if (!code) {
    return NextResponse.json({ error: "Не си влязъл." }, { status: 401 })
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Прогресът е твърде голям." }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  const progress = sanitizeProgress((body as { progress?: unknown })?.progress)
  const player = await saveProgress(code, progress)
  if (!player) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, updatedAt: player.updatedAt })
}
