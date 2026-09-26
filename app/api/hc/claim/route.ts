import { NextRequest, NextResponse } from "next/server"
import { getSessionCode } from "@/lib/hc/session"
import { awardTask, getPlayer } from "@/lib/hc/store"
import { checkAnswer, getServerTask } from "@/lib/hc/tasks"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Throttle guesses per player+task: max 15 per 5 minutes (per instance).
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
    return NextResponse.json({ error: "Не си влязъл." }, { status: 401 })
  }

  let taskId = ""
  let answer = ""
  try {
    const body = await req.json()
    taskId = String(body?.taskId ?? "").slice(0, 64)
    answer = String(body?.answer ?? "").slice(0, 200)
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  const task = getServerTask(taskId)
  if (!task) {
    return NextResponse.json({ error: "Несъществуваща задача." }, { status: 404 })
  }

  const player = await getPlayer(code)
  if (!player) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 })
  }

  if (player.completedTasks.includes(taskId)) {
    return NextResponse.json({ ok: true, outcome: "already", reward: 0, coins: player.coins, completedTasks: player.completedTasks })
  }

  if (throttled(`${code}:${taskId}`)) {
    return NextResponse.json({ error: "Твърде много опити. Изчакай малко." }, { status: 429 })
  }

  if (!checkAnswer(task, answer)) {
    return NextResponse.json({ ok: false, outcome: "wrong", error: "Грешен отговор." })
  }

  // Atomic payout — a parallel duplicate request gets awarded:false.
  const result = await awardTask(code, taskId, task.reward)
  if (!result) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    outcome: result.awarded ? "correct" : "already",
    reward: result.awarded ? task.reward : 0,
    coins: result.player.coins,
    completedTasks: result.player.completedTasks,
  })
}
