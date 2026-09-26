import { NextRequest, NextResponse } from "next/server"
import { getSessionCode } from "@/lib/hc/session"
import { updatePlayer } from "@/lib/hc/store"
import { toPublicPlayer } from "@/lib/hc/types"
import { checkAnswer, getServerTask } from "@/lib/hc/tasks"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Throttle wrong answers per player+task: max 15 / 5 min.
const guesses = new Map<string, { count: number; first: number }>()
const WINDOW_MS = 5 * 60 * 1000
const MAX_GUESSES = 15

function throttled(key: string): boolean {
  const now = Date.now()
  const rec = guesses.get(key)
  if (!rec || now - rec.first > WINDOW_MS) {
    guesses.set(key, { count: 1, first: now })
    return false
  }
  rec.count += 1
  return rec.count > MAX_GUESSES
}

export async function POST(req: NextRequest) {
  const code = await getSessionCode()
  if (!code) {
    return NextResponse.json(
      { error: "Не си влязъл. Логни се с код за достъп." },
      { status: 401 },
    )
  }

  let taskId = ""
  let answer = ""
  try {
    const body = await req.json()
    taskId = (body?.taskId ?? "").toString()
    answer = (body?.answer ?? "").toString()
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  const task = getServerTask(taskId)
  if (!task) {
    return NextResponse.json({ error: "Несъществуваща задача." }, { status: 404 })
  }

  if (throttled(`${code}:${taskId}`)) {
    return NextResponse.json(
      { error: "Твърде много опити. Изчакай малко." },
      { status: 429 },
    )
  }

  // The reward and the completed-guard are applied atomically inside the
  // store, so a burst of parallel requests cannot double-pay.
  let outcome: "correct" | "wrong" | "already" = "wrong"

  const updated = await updatePlayer(code, (p) => {
    if (p.completedTasks.includes(taskId)) {
      outcome = "already"
      return
    }
    if (!checkAnswer(task, answer)) {
      outcome = "wrong"
      return
    }
    outcome = "correct"
    p.coins += task.reward
    p.completedTasks.push(taskId)
    if (task.kind === "puzzle" && !p.solvedPuzzles.includes(taskId)) {
      p.solvedPuzzles.push(taskId)
    }
  })

  if (!updated) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 })
  }

  if (outcome === "wrong") {
    return NextResponse.json(
      { ok: false, outcome, error: "Грешен отговор." },
      { status: 200 },
    )
  }

  return NextResponse.json({
    ok: true,
    outcome,
    reward: outcome === "correct" ? task.reward : 0,
    player: toPublicPlayer(updated),
  })
}
