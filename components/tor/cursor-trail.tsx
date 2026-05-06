"use client"

import React, { useEffect, useMemo, useRef } from "react"

type Point = { x: number; y: number; a: number }

export function CursorTrail({
  color = "#00FF41",
  maxPoints = 14,
  fade = 0.9,
}: {
  color?: string
  maxPoints?: number
  fade?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  const rafRef = useRef<number | null>(null)
  const trailRef = useRef<Point[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const lastRef = useRef({ x: -1000, y: -1000 })
  const hoveringRef = useRef(false)

  const movingRef = useRef(false)
  const stopTimerRef = useRef<number | null>(null)

  const isTouchLike = useMemo(() => {
    if (typeof window === "undefined") return false
    return matchMedia("(pointer: coarse)").matches
  }, [])

  useEffect(() => {
    if (isTouchLike) return

    const canvas = canvasRef.current
    const dot = dotRef.current
    if (!canvas || !dot) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize)

    const findInteractive = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      if (!el) return false
      return (
        el.closest(
          "a,button,[role='button'],[tabindex]:not([tabindex='-1']),input,textarea,select"
        ) !== null
      )
    }

    const startLoopIfNeeded = () => {
      if (movingRef.current) return
      movingRef.current = true

      const loop = () => {
        // ако вече не се движи – спираме да рендваме
        if (!movingRef.current) return

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

        const { x, y } = mouseRef.current
        const { x: lx, y: ly } = lastRef.current
        const moved = Math.abs(x - lx) + Math.abs(y - ly) > 0.5

        if (moved) {
          lastRef.current = { x, y }
          trailRef.current.push({ x, y, a: 0.5 })
          if (trailRef.current.length > maxPoints) trailRef.current.shift()
        }

        const pts = trailRef.current
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i]
          const t = (i + 1) / pts.length
          ctx.fillStyle = `rgba(0,255,65,${p.a * t * 0.45})`
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2)
          p.a *= fade
        }

        // плавно угасване след като спрем движението
        if (!moved && pts.length) {
          // оставяме още малко да доизгасне
          const allFaded = pts.every((p) => p.a < 0.02)
          if (allFaded) {
            trailRef.current = []
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
            movingRef.current = false
            rafRef.current = null
            return
          }
        }

        rafRef.current = requestAnimationFrame(loop)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      mouseRef.current = { x, y }

      // dot follow
      dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`

      // hover pulse
      const isInteractive = findInteractive(x, y)
      if (isInteractive !== hoveringRef.current) {
        hoveringRef.current = isInteractive
        dot.dataset.hover = isInteractive ? "1" : "0"
      }

      // start draw loop on movement + stop after short idle
      startLoopIfNeeded()
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = window.setTimeout(() => {
        // не го спирам веднага — loop сам ще приключи като изгасне trail
        // просто не добавяме нови точки ако няма движение
      }, 120)
    }

    window.addEventListener("mousemove", onMove, { passive: true })

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current)
    }
  }, [color, fade, isTouchLike, maxPoints])

  if (isTouchLike) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9990,
        }}
      />

      <div
        ref={dotRef}
        data-hover="0"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          background: color,
          pointerEvents: "none",
          zIndex: 9993,
          boxShadow: `0 0 8px rgba(0,255,65,0.35)`,
          transition: "transform 0.03s linear",
          // hover pulse via CSS vars-ish
          animation: "none",
        }}
      />

      {/* local CSS (можеш да го сложиш в globals.css вместо това) */}
      <style>{`
        [data-hover="1"]{
          width: 10px !important;
          height: 10px !important;
          box-shadow: 0 0 10px rgba(0,255,65,0.55), 0 0 18px rgba(0,255,65,0.25) !important;
          animation: cursorPulse 0.9s ease-in-out infinite;
        }
        @keyframes cursorPulse{
          0%   { transform: translate(var(--x, 0px), var(--y, 0px)) scale(1);   opacity: 1; }
          50%  { transform: translate(var(--x, 0px), var(--y, 0px)) scale(1.35); opacity: .85; }
          100% { transform: translate(var(--x, 0px), var(--y, 0px)) scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  )
}