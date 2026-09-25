"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/tor/ui"
import s from "./red-room.module.css"

const ACCENT = "#FF0033"

export default function RedRoomPage() {
  const [recBlink, setRecBlink] = useState(true)
  const [signalNoise, setSignalNoise] = useState(false)
  useEffect(() => {
    const blink = setInterval(() => setRecBlink((b) => !b), 750)
    const noise = setInterval(() => {
      setSignalNoise(true)
      setTimeout(() => setSignalNoise(false), 160)
    }, 5000 + Math.random() * 5000)
    return () => { clearInterval(blink); clearInterval(noise) }
  }, [])

  return (
    <div className={s.page}>
      <PageHeader
        title="RED ROOM"
        accent={ACCENT}
        intensity="medium"
        kicker={
          <>
            <span className={s.rec}>
              <span className={s.recDot} data-on={recBlink ? "" : undefined} />
              REC
            </span>
            BROADCAST NODE — ENTRY POINT — SITE 01
          </>
        }
        aside={
          <div className={s.signal}>
            <motion.div animate={{ color: signalNoise ? ACCENT : "#aaaaaa" }} transition={{ duration: 0.1 }}>
              {signalNoise ? "// SIGNAL UNSTABLE" : "// SIGNAL STABLE"}
            </motion.div>
            <div className={s.bars}>
              {[4, 7, 3, 9, 5, 6, 8, 3, 7, 4].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: signalNoise ? [h * 2, h * 4, h * 2] : [h * 2, h * 2 + 2, h * 2],
                    opacity: signalNoise ? 1 : 0.45,
                  }}
                  transition={{ duration: 0.3, delay: i * 0.04, repeat: Infinity, repeatType: "reverse" }}
                />
              ))}
            </div>
          </div>
        }
      />

      <div className={s.monitor}>
        <div className={s.monitorBar}>
          <span className={s.live}>{recBlink ? "● LIVE" : "○ LIVE"}</span>
          <span>NODE-7 // RED ROOM // FEED-01</span>
          <span className={s.viewers}>1,247 зрители</span>
        </div>

        <div className={s.screen}>
          <video
            src="https://pub-8b860d446af44b4ba4c3681a0af03bcf.r2.dev/FINAL-low-res.mp4"
            controls
            muted
            playsInline
            preload="metadata"
            title="RED ROOM LIVE FEED"
          />
          <div className={s.scan} />
          {signalNoise && <div className={s.noise} />}
          <i className={s.corner} />
          <i className={s.corner} />
          <i className={s.corner} />
          <i className={s.corner} />
          <div className={`${s.wm} ${s.wmLeft}`}>NODE-7 // ENCRYPTED</div>
          <div className={`${s.wm} ${s.wmRight}`}>15.10.2025 • 03:17</div>
        </div>

        <div className={s.monitorFoot}>
          <span style={{ color: ACCENT }}>
            <span style={{ opacity: recBlink ? 1 : 0.2 }}>●</span> REC
          </span>
          <div className={s.progress}>
            <i />
          </div>
          <span>01:22 / 02:20</span>
          <span style={{ color: signalNoise ? "#FF8800" : "#9a9a9a" }}>
            {signalNoise ? "SIGNAL UNSTABLE" : "SIGNAL OK"}
          </span>
        </div>
      </div>

      <div className={s.ctas}>
        <Link href="/hidden-wiki-2/red-room/chat-replay" className={s.cta}>
          <span>CHAT REPLAY</span>
          <i>→</i>
        </Link>
        <Link href="/hidden-wiki-2/red-room/full-truth" className={s.cta}>
          <span>FULL TRUTH</span>
          <i>→</i>
        </Link>
      </div>
    </div>
  )
}
