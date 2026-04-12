'use client'

import { useRef, useEffect, useCallback } from 'react'

interface Entry { id: string; displayName: string }

interface WheelDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#84cc16',
  '#10b981', '#f59e0b', '#ef4444', '#d946ef',
]

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export function WheelDraw({ entries, accent, winner, isSpinning, onComplete }: WheelDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const rafRef = useRef<number>(0)

  const segments = entries.slice(0, 16)
  const n = segments.length

  const draw = useCallback((rotation: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width: W, height: H } = canvas
    const cx = W / 2
    const cy = H / 2
    const r = Math.min(cx, cy) - 8

    ctx.clearRect(0, 0, W, H)

    const slice = (2 * Math.PI) / n

    for (let i = 0; i < n; i++) {
      const start = rotation + i * slice - Math.PI / 2
      const end = start + slice

      // Segment fill
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = PALETTE[i % PALETTE.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation + i * slice + slice / 2 - Math.PI / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${n > 8 ? 11 : 13}px sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4

      const name = segments[i].displayName
      const label = name.length > 14 ? name.slice(0, 13) + '…' : name
      ctx.fillText(label, r - 12, 4)
      ctx.restore()
    }

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI)
    ctx.fillStyle = '#0a0a0a'
    ctx.fill()
    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    ctx.stroke()
  }, [n, segments, accent])

  // Draw initial state
  useEffect(() => {
    draw(rotationRef.current)
  }, [draw])

  // Spin when isSpinning becomes true
  useEffect(() => {
    if (!isSpinning || !winner) return

    const winnerIdx = segments.findIndex(e => e.id === winner.id)
    if (winnerIdx === -1) { onComplete(); return }

    const slice = (2 * Math.PI) / n
    // We want the pointer (top, -PI/2) to land on the center of the winner's segment
    // Winner segment center angle (without rotation): winnerIdx * slice + slice/2
    // We need: rotation + winnerIdx * slice + slice/2 - PI/2 = -PI/2  (mod 2PI)
    // => rotation = -winnerIdx * slice - slice/2  (+ full rotations)
    const targetAngle = -(winnerIdx * slice + slice / 2)
    const fullSpins = 5 * 2 * Math.PI
    const finalRotation = targetAngle - fullSpins

    const startRotation = rotationRef.current
    const delta = finalRotation - startRotation
    const duration = 5000
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(t)
      rotationRef.current = startRotation + delta * eased
      draw(rotationRef.current)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onComplete()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  if (n === 0) return null

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `24px solid ${accent}`,
          filter: `drop-shadow(0 2px 8px ${accent}80)`,
        }}
      />
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="rounded-full"
        style={{ boxShadow: `0 0 40px ${accent}30` }}
      />
    </div>
  )
}
