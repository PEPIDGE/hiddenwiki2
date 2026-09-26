import { NextResponse } from "next/server"
import { HC_COOKIE } from "@/lib/hc/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(HC_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return res
}
