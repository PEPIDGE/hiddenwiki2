import { NextRequest, NextResponse } from "next/server"

// ─── HIDDEN WIKI 2 — TERMINAL API ───────────────────────────────────────────
// Secret codes and puzzle answers are validated server-side here.
// Frontend sends: { cmd: string, args: string[], sessionId?: string }
// Server returns: { lines: string[], success?: boolean, token?: string }

const SECRET_CODES: Record<string, { answer: string; reward: string; lines: string[] }> = {
  "rf-gate": {
    answer: "REDFOX",
    reward: "RF-GATE",
    lines: [
      "Verifying RF-GATE access key...",
      "Checking signature chain...",
      "SUCCESS: RF-GATE token issued.",
      "Token: RF-GATE-7X9K — save this.",
    ],
  },
  "circuit-3": {
    answer: "MIRROR",
    reward: "CIRCUIT-3",
    lines: [
      "CIRCUIT-3 authentication...",
      "Cross-referencing mirror index...",
      "SUCCESS: CIRCUIT-3 token issued.",
      "Token: CIRCUIT-3-M1R — save this.",
    ],
  },
  "node7": {
    answer: "TRACE",
    reward: "NODE7",
    lines: [
      "NODE7 handshake...",
      "RF-TRACE::NODE7 — verifying...",
      "SUCCESS: NODE7 access confirmed.",
      "You may proceed to TRACE-NODE.",
    ],
  },
}

const HELP_TEXT = [
  "HIDDEN WIKI 2 — MASTER TERMINAL",
  "─────────────────────────────────────────────",
  "COMMANDS:",
  "  help                    — this list",
  "  status                  — session status",
  "  ls                      — list evidence files",
  "  scan                    — scan all active nodes",
  "  whoami                  — current session info",
  "  decode hex <value>      — hex → ASCII decode",
  "  decode rot13 <value>    — ROT-13 cipher",
  "  decode base64 <value>   — Base64 decode",
  "  decode reverse <value>  — reverse string",
  "  crack <rf-gate|circuit-3|node7> <answer>",
  "                          — crack a gate token",
  "  verify coords           — verify coordinates",
  "  clear                   — clear screen",
  "─────────────────────────────────────────────",
  "Secrets are case-insensitive. Type 'scan' to start.",
]

const EVIDENCE_FILES = [
  "evidence/",
  "  rf_gate_token.enc       — RED ROOM gate key",
  "  circuit3_shard.txt      — MIRRORS circuit token",
  "  calm_voice_log.bin      — forum confession #4",
  "  ARS_timeline.log        — 03:17 → 22:17 pattern",
  "  coords_encrypted.bin    — LAT/LON hex strings",
  "  R_alexiev_id.enc        — identity fragment",
  "  _chain_ref_node7.bin    — NODE7 chain signature",
]

function decodeHex(hex: string): string | null {
  try {
    const clean = hex.replace(/\s/g, "")
    if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) return null
    let result = ""
    for (let i = 0; i < clean.length; i += 2) {
      result += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16))
    }
    return result
  } catch {
    return null
  }
}

function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cmd, args = [] }: { cmd: string; args: string[] } = body

    const command = cmd?.toLowerCase()?.trim()

    if (!command) {
      return NextResponse.json({ lines: ["No command received."] })
    }

    // ── help ──
    if (command === "help") {
      return NextResponse.json({ lines: HELP_TEXT })
    }

    // ── status ──
    if (command === "status") {
      return NextResponse.json({
        lines: [
          `SESSION: ${Date.now().toString(36).toUpperCase()}`,
          `SERVER TIME: ${new Date().toISOString()}`,
          "ENCRYPTION: AES-256 / TOR RELAY",
          "NODES ONLINE: 7/7",
          "ENTROPY: HIGH",
          "STATUS: ACTIVE",
        ],
      })
    }

    // ── whoami ──
    if (command === "whoami") {
      return NextResponse.json({
        lines: [
          "Analyst // HIDDEN WIKI 2",
          "Role: Investigator",
          "Clearance: Level 2 (Evidence Review)",
          "Authorization: Pending final verification",
        ],
      })
    }

    // ── ls ──
    if (command === "ls") {
      return NextResponse.json({ lines: EVIDENCE_FILES })
    }

    // ── scan ──
    if (command === "scan") {
      return NextResponse.json({
        lines: [
          "Scanning node signatures...",
          "  NODE-A (RED ROOM)    — RF-GATE token: required",
          "  NODE-B (MIRRORS)     — CIRCUIT-3 token: required",
          "  NODE-C (LEAKS)       — R.A. identity fragment: active",
          "  NODE-D (EVENTS)      — Timeline 03:17: active",
          "  NODE-E (CULT)        — Ritual status: active",
          "  NODE-F (FORUM)       — Confession #4: active",
          "  NODE-7 (TRACE)       — RF-TRACE::NODE7: locked",
          "",
          "Convergence: 4/7 nodes active.",
          "Use 'crack <gate> <answer>' to unlock tokens.",
        ],
      })
    }

    // ── decode ──
    if (command === "decode") {
      const method = args[0]?.toLowerCase()
      const value = args.slice(1).join(" ")

      if (!method || !value) {
        return NextResponse.json({
          lines: ["Usage: decode <hex|rot13|base64|reverse> <value>"],
        })
      }

      if (method === "hex") {
        const decoded = decodeHex(value)
        if (!decoded) {
          return NextResponse.json({ lines: ["[!] Invalid hex string."] })
        }
        return NextResponse.json({
          lines: [`HEX INPUT: ${value}`, `→ ASCII: ${decoded}`, "", `Result: ${decoded}`],
          success: decoded === "42.6977" || decoded === "23.3219",
        })
      }

      if (method === "rot13") {
        const decoded = rot13(value)
        return NextResponse.json({
          lines: [`ROT13: ${value} → ${decoded}`],
        })
      }

      if (method === "base64") {
        try {
          const decoded = Buffer.from(value, "base64").toString("utf-8")
          return NextResponse.json({
            lines: [`BASE64: ${value} → ${decoded}`],
          })
        } catch {
          return NextResponse.json({ lines: ["[!] Invalid base64 string."] })
        }
      }

      if (method === "reverse") {
        const decoded = value.split("").reverse().join("")
        return NextResponse.json({ lines: [`REVERSE: ${value} → ${decoded}`] })
      }

      return NextResponse.json({ lines: [`Unknown decode method: ${method}`] })
    }

    // ── crack ──
    if (command === "crack") {
      const gate = args[0]?.toLowerCase()
      const answer = args.slice(1).join(" ").toUpperCase()

      if (!gate) {
        return NextResponse.json({
          lines: [
            "Usage: crack <gate> <answer>",
            "Gates: rf-gate, circuit-3, node7",
          ],
        })
      }

      const gateConfig = SECRET_CODES[gate]
      if (!gateConfig) {
        return NextResponse.json({
          lines: [`Unknown gate: ${gate}`, "Available: rf-gate, circuit-3, node7"],
        })
      }

      if (!answer) {
        return NextResponse.json({
          lines: [`Cracking ${gate}...`, "You need to provide an answer.", `Usage: crack ${gate} <answer>`],
        })
      }

      if (answer === gateConfig.answer) {
        return NextResponse.json({
          lines: gateConfig.lines,
          success: true,
          token: gateConfig.reward,
        })
      }

      return NextResponse.json({
        lines: [
          `Attempting ${gate} with key: ${answer}`,
          "[!] Authentication failed — wrong answer.",
          "Hint: look deeper in the related section.",
        ],
        success: false,
      })
    }

    // ── verify coords ──
    if (command === "verify" && args[0]?.toLowerCase() === "coords") {
      return NextResponse.json({
        lines: [
          "Verifying coordinate pair against Canon anchors...",
          "  42.6977°N — cross-check Audi A3 trace: MATCH",
          "  23.3219°E — cross-check 22:17 phone drop: MATCH",
          "  Огледален преход invitation: MATCH",
          "",
          "SUCCESS: COORDINATES VERIFIED",
          "Location confirmed: 42.6977°N, 23.3219°E",
          "Run 'bundle' to generate final evidence package.",
        ],
        success: true,
      })
    }

    // ── bundle ──
    if (command === "bundle") {
      return NextResponse.json({
        lines: [
          "Generating evidence bundle...",
          "  Identity:    Румен Алексиев (RedFox)",
          "  Coordinates: 42.6977°N, 23.3219°E",
          "  Token chain: RF-GATE → CIRCUIT-3 → RF-TRACE::NODE7",
          "  Canon match: 3/3 anchors confirmed",
          "",
          "SUCCESS: BUNDLE READY",
          "Proceed to: sluchayat.com/verify",
        ],
        success: true,
      })
    }

    // ── cat ──
    if (command === "cat") {
      const file = args[0]
      const fileMap: Record<string, string[]> = {
        "coords_encrypted.bin": [
          "Binary content (hex encoded):",
          "LAT: 34322e36393737",
          "LON: 32332e33323139",
          "",
          "Use: decode hex 34322e36393737",
        ],
        "_chain_ref_node7.bin": [
          "RF-TRACE::NODE7",
          "Chain signature: VALID",
          "Source: DataCracker6 @ 2024-10-16 00:03",
        ],
        "rf_gate_token.enc": [
          "Encrypted. Answer: what is RedFox's handle?",
          "Use: crack rf-gate <answer>",
        ],
      }
      return NextResponse.json({
        lines: fileMap[file] ?? [`cat: ${file ?? "(no file)"}: No such file or directory`],
      })
    }

    // ── clear ── (handled client-side, but acknowledge)
    if (command === "clear") {
      return NextResponse.json({ lines: [], clear: true })
    }

    return NextResponse.json({
      lines: [`bash: ${command}: command not found — type 'help'`],
    })
  } catch (err) {
    return NextResponse.json({ lines: ["Internal server error."] }, { status: 500 })
  }
}
