"use client"

import { useEffect, useRef, useCallback } from "react"

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<{ x: number; y: number; alpha: number; size: number }[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const dotRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Add new point
    trailRef.current.push({
      x: mouseRef.current.x,
      y: mouseRef.current.y,
      alpha: 0.7,
      size: 3,
    })

    // Keep only last 28 points
    if (trailRef.current.length > 28) trailRef.current.shift()

    // Draw trail
    trailRef.current.forEach((point, i) => {
      const ratio = i / trailRef.current.length
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.size * ratio, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0, 255, 65, ${point.alpha * ratio * 0.6})`
      ctx.fill()
      point.alpha *= 0.95
    })

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }
    window.addEventListener("mousemove", onMove)

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [draw])

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
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          background: "#00FF41",
          pointerEvents: "none",
          zIndex: 9991,
          boxShadow: "0 0 8px #00FF41, 0 0 16px rgba(0,255,65,0.4)",
          transition: "transform 0.05s linear",
        }}
      />
    </>
  )
}
