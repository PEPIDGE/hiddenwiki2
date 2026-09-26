// ============================================================
// HIDDEN COIN — session tokens (server only)
//
// A session is a signed, self-contained token: base64url(payload).hmac.
// The payload holds the player code + issued-at. The HMAC (SHA-256 over
// the payload, keyed by HC_SESSION_SECRET) makes it tamper-proof — a
// client cannot forge or edit a session without the secret.
// ============================================================

import crypto from "node:crypto"
import { cookies } from "next/headers"
import { HC_COOKIE, HC_SESSION_TTL_MS } from "./config"

// In production ALWAYS set HC_SESSION_SECRET. The dev fallback is stable
// per-process so local sessions survive hot reloads but is not secret.
const SECRET =
  process.env.HC_SESSION_SECRET ||
  "dev-only-insecure-secret-change-me-in-prod-please-32b"

interface SessionPayload {
  code: string
  iat: number
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url")
}

function sign(payloadB64: string): string {
  return crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url")
}

// Constant-time comparison to avoid signature-timing leaks.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export function createToken(code: string): string {
  const payload: SessionPayload = { code, iat: Date.now() }
  const payloadB64 = b64url(JSON.stringify(payload))
  return `${payloadB64}.${sign(payloadB64)}`
}

export function verifyToken(token: string | undefined): string | null {
  if (!token || typeof token !== "string") return null
  const dot = token.indexOf(".")
  if (dot < 0) return null
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!safeEqual(sig, sign(payloadB64))) return null
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8"),
    ) as SessionPayload
    if (!payload?.code || typeof payload.iat !== "number") return null
    if (Date.now() - payload.iat > HC_SESSION_TTL_MS) return null
    return payload.code
  } catch {
    return null
  }
}

// Read the current player's code from the session cookie (or null).
export async function getSessionCode(): Promise<string | null> {
  const jar = await cookies()
  return verifyToken(jar.get(HC_COOKIE)?.value)
}
