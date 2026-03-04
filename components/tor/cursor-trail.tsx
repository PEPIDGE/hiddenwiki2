"use client"

import { useEffect, useRef, useCallback } from "react"

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<{ x: number; y: number; alpha: number }[]>([])
  const mouseRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>(0)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const isHoverRef = useRef(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    trailRef.current.push({ x: mouseRef.current.x, y: mouseRef.current.y, alpha: 0.5 })
    if (trailRef.current.length > 20) trailRef.current.shift()

    trailRef.current.forEach((pt, i) => {
      const ratio = i / trailRef.current.length
      ctx.beginPath()
      ctx.rect(pt.x - 1, pt.y - 1, 2, 2)
      ctx.fillStyle = `rgba(0,255,65,${pt.alpha * ratio * 0.5})`
      ctx.fill()
      pt.alpha *= 0.9
    })

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${e.clientX - 14}px, ${e.clientY - 14}px)`
      }
      // Check if hovering a link or button
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const isInteractive = el?.closest("a, button, [role='button'], [tabindex], input, textarea") !== null
      if (isInteractive !== isHoverRef.current) {
        isHoverRef.current = isInteractive
        if (dotRef.current) {
          dotRef.current.style.background = isInteractive ? "#ffffff" : "#00FF41"
          dotRef.current.style.boxShadow = isInteractive
            ? "0 0 6px #ffffff, 0 0 12px rgba(255,255,255,0.3)"
            : "0 0 6px #00FF41, 0 0 12px rgba(0,255,65,0.3)"
        }
        if (ringRef.current) {
          ringRef.current.style.opacity = isInteractive ? "0.6" : "0.2"
          ringRef.current.style.transform = `translate(${e.clientX - 14}px, ${e.clientY - 14}px) scale(${isInteractive ? 1.5 : 1})`
        }
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
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9990 }} />
      {/* Square dot */}
      <div ref={dotRef} style={{
        position: "fixed", top: 0, left: 0, width: 6, height: 6,
        background: "#00FF41", pointerEvents: "none", zIndex: 9993,
        boxShadow: "0 0 6px #00FF41, 0 0 12px rgba(0,255,65,0.3)",
        transition: "background 0.1s, box-shadow 0.1s, transform 0.04s linear",
      }} />
      {/* Outer ring */}
      <div ref={ringRef} style={{
        position: "fixed", top: 0, left: 0, width: 28, height: 28,
        border: "1px solid rgba(0,255,65,0.4)", pointerEvents: "none", zIndex: 9992,
        transition: "opacity 0.15s, transform 0.12s linear, scale 0.15s",
        opacity: 0.2,
      }} />
    </>
  )
}


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
