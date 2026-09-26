// ============================================================
// HIDDEN COIN — session helpers for route handlers (server only)
// ============================================================

import { cookies } from "next/headers"
import { HC_COOKIE, HC_SESSION_TTL_MS } from "./config"
import { createToken, verifyToken } from "./token"

export { createToken, verifyToken }

// Read the current player's code from the session cookie (or null).
export async function getSessionCode(): Promise<string | null> {
  const jar = await cookies()
  return verifyToken(jar.get(HC_COOKIE)?.value)
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.floor(HC_SESSION_TTL_MS / 1000),
}
