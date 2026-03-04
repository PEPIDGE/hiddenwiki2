"use client"
// v2 — single exports only
import { useEffect, useRef, useState } from "react"

interface GlitchTextProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p" | "div"
  intensity?: "low" | "medium" | "high"
  color?: string
}

export function GlitchText({
  text,
  className = "",
  as: Tag = "span",
  intensity = "medium",
  color,
}: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false)
  const [corruptedText, setCorruptedText] = useState(text)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const intervalMap = { low: 9000, medium: 5000, high: 2500 }
  const durationMap = { low: 250, medium: 420, high: 700 }
  const CORRUPT_CHARS = "█▓▒░▄▀■□▪▫◾◽▮▯"

  useEffect(() => {
    const corruptString = (s: string) =>
      s.split("").map((c) => {
        if (c === " ") return c
        if (Math.random() < 0.35) return CORRUPT_CHARS[Math.floor(Math.random() * CORRUPT_CHARS.length)]
        return c
      }).join("")

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        setGlitching(true)
        let frames = 0
        const corrupt = setInterval(() => {
          setCorruptedText(corruptString(text))
          frames++
          if (frames > 6) {
            clearInterval(corrupt)
            setCorruptedText(text)
            setGlitching(false)
            schedule()
          }
        }, durationMap[intensity] / 7)
      }, intervalMap[intensity] + Math.random() * 3000)
    }
    schedule()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [text, intensity])

  return (
    <Tag
      className={`font-mono ${className}`}
      data-text={text}
      style={{
        position: "relative",
        display: "inline-block",
        color: color || undefined,
        ...(glitching ? {
          transform: `translate(${Math.random() > 0.5 ? 2 : -2}px, ${Math.random() > 0.5 ? 1 : -1}px)`,
          filter: "brightness(1.4)",
          textShadow: `1px 0 rgba(255,255,255,0.15), -1px 0 rgba(0,0,0,0.8)`,
        } : {}),
        transition: glitching ? "none" : "transform 0.05s, filter 0.1s",
      }}
    >
      {glitching ? corruptedText : text}
    </Tag>
  )
}

export function TypewriterText({
  text,
  speed = 40,
  className = "",
  onComplete,
}: {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={`font-mono ${className}`}>
      {displayed}
      {!done && (
        <span style={{ animation: "blink-cursor 1s step-end infinite", color: "#00FF41" }}>_</span>
      )}
    </span>
  )
}
