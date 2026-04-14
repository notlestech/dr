'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { id: string; displayName: string }

interface BurstDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

// Particle for the burst/firework effect
interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
}

function randomBetween(a: number, b: number) { return a + Math.random() * (b - a) }

const PALETTE = (accent: string) => [accent, '#ffffff', accent + 'cc', '#ffd700', accent + '88']

export function BurstDraw({ entries, accent, winner, isSpinning, onComplete }: BurstDrawProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([])
  const particles    = useRef<Particle[]>([])
  const pidRef       = useRef(0)

  const [names, setNames]       = useState<string[]>([])
  const [nameIdx, setNameIdx]   = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [phase, setPhase]       = useState<'idle' | 'scanning' | 'reveal'>('idle')

  function clearAll() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    cancelAnimationFrame(rafRef.current)
    particles.current = []
  }

  // Burst factory
  function spawnBurst(x: number, y: number, count = 28) {
    const colors = PALETTE(accent)
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randomBetween(-0.3, 0.3)
      const speed = randomBetween(1.5, 4.5)
      particles.current.push({
        id: pidRef.current++,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randomBetween(0, 1.5),
        size: randomBetween(3, 7),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: randomBetween(0.5, 1),
      })
    }
  }

  // Canvas animation loop
  function startLoop() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let last = performance.now()

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      particles.current = particles.current.filter(p => p.alpha > 0.02)
      for (const p of particles.current) {
        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.12  // gravity
        p.vx *= 0.97  // air drag
        p.alpha -= dt / p.life * 0.9

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (!isSpinning || !winner) return

    setRevealed(false)
    setPhase('scanning')

    // Build name list
    const pool = [...entries].sort(() => Math.random() - 0.5)
    const list = Array.from({ length: 24 }, (_, i) => pool[i % pool.length].displayName)
    setNames(list)
    setNameIdx(0)

    startLoop()

    // Phase 1: rapid name cycling + mini burst every tick
    let idx = 0
    const canvas = canvasRef.current
    const W = canvas?.width ?? 320
    const H = canvas?.height ?? 200

    function cycleName() {
      setNameIdx(i => Math.min(i + 1, list.length - 1))
      if (canvas) spawnBurst(randomBetween(20, W - 20), randomBetween(20, H * 0.6), 8)
      idx++
    }

    const intervals: ReturnType<typeof setInterval>[] = []
    // Fast cycle with decelerating interval
    let delay = 80
    function schedNext() {
      if (idx >= 22) return
      timersRef.current.push(setTimeout(() => {
        cycleName()
        delay = Math.min(delay + 12, 320)
        schedNext()
      }, delay))
    }
    schedNext()

    // Big burst + reveal
    timersRef.current.push(setTimeout(() => {
      setPhase('reveal')
      setRevealed(true)
      if (canvas) {
        const cx = W / 2, cy = H / 2
        spawnBurst(cx, cy - 20, 60)
        spawnBurst(cx - 60, cy, 24)
        spawnBurst(cx + 60, cy, 24)
      }
    }, 2800))

    timersRef.current.push(setTimeout(() => onComplete(), 3600))

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  useEffect(() => {
    if (!isSpinning && !winner) {
      setRevealed(false)
      setPhase('idle')
      setNames([])
      setNameIdx(0)
      clearAll()
      // Clear canvas
      const canvas = canvasRef.current
      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isSpinning, winner])

  const displayName = revealed && winner
    ? winner.displayName
    : names[nameIdx] ?? (entries[0]?.displayName ?? '???')

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: 340, height: 260 }}
      role="region"
      aria-label="Burst draw animation"
      aria-live="polite"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        width={340}
        height={260}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Name display */}
      <div
        className="relative z-10 flex flex-col items-center gap-3"
        style={{ minWidth: 240 }}
      >
        {/* Outer glow ring when revealed */}
        {revealed && (
          <div
            style={{
              position: 'absolute',
              inset: -24,
              borderRadius: 24,
              background: `radial-gradient(ellipse, ${accent}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        <div
          style={{
            padding: '16px 28px',
            borderRadius: 16,
            border: `2px solid ${revealed ? accent : accent + '40'}`,
            background: revealed ? `${accent}18` : '#0f0f1a',
            boxShadow: revealed ? `0 0 40px ${accent}40, 0 0 80px ${accent}20` : 'none',
            transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            transform: revealed ? 'scale(1.08)' : 'scale(1)',
            textAlign: 'center',
            minWidth: 200,
          }}
        >
          <p
            style={{
              fontSize: revealed ? 24 : 16,
              fontWeight: revealed ? 800 : 500,
              color: revealed ? accent : 'rgba(255,255,255,0.75)',
              transition: 'all 0.35s ease',
              letterSpacing: revealed ? '0.04em' : 'normal',
            }}
          >
            {displayName}
          </p>
        </div>

        {/* Phase label */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: revealed ? accent : 'rgba(255,255,255,0.35)',
            transition: 'color 0.3s',
          }}
        >
          {phase === 'idle' ? 'Ready' : phase === 'scanning' ? 'Selecting…' : '🎉 Winner!'}
        </span>
      </div>

      <span className="sr-only">
        {revealed && winner ? `Winner: ${winner.displayName}` : 'Picking winner…'}
      </span>
    </div>
  )
}
