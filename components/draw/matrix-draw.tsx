'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { id: string; displayName: string }

interface MatrixDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

export function MatrixDraw({ entries, accent, winner, isSpinning, onComplete }: MatrixDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const timerRef  = useRef<ReturnType<typeof setTimeout>[]>([])

  const [phase, setPhase]       = useState<'idle' | 'rain' | 'converge' | 'reveal'>('idle')
  const [displayName, setDisplayName] = useState('')
  const [revealedName, setRevealedName] = useState('')

  function clearAll() {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
    cancelAnimationFrame(rafRef.current)
  }

  useEffect(() => {
    if (!isSpinning || !winner) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const COL_W = 14
    const cols = Math.floor(W / COL_W)

    // Each column tracks its y position
    const drops = Array.from({ length: cols }, () => Math.random() * -50)

    setPhase('rain')
    setRevealedName('')
    setDisplayName('???')

    let frame = 0

    function rain() {
      // Semi-transparent black overlay (trail effect)
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, W, H)

      ctx.font = `bold 13px monospace`

      for (let i = 0; i < cols; i++) {
        // Head char — brighter
        ctx.fillStyle = '#ffffff'
        ctx.fillText(randomChar(), i * COL_W, drops[i] * COL_W)

        // Trail chars — accent colored
        ctx.fillStyle = accent + 'cc'
        ctx.fillText(randomChar(), i * COL_W, (drops[i] - 1) * COL_W)
        ctx.fillStyle = accent + '60'
        ctx.fillText(randomChar(), i * COL_W, (drops[i] - 2) * COL_W)

        if (drops[i] * COL_W > H && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5
      }

      frame++
      rafRef.current = requestAnimationFrame(rain)
    }

    rafRef.current = requestAnimationFrame(rain)

    // Phase: start cycling random names
    let cycleCount = 0
    const pool = entries.map(e => e.displayName)
    function cycle() {
      const name = pool[Math.floor(Math.random() * pool.length)]
      setDisplayName(name)
      cycleCount++
    }

    let delay = 60
    function sched() {
      if (cycleCount >= 20) return
      timerRef.current.push(setTimeout(() => {
        cycle()
        delay = Math.min(delay + 18, 300)
        sched()
      }, delay))
    }
    sched()

    // Converge phase: rain slows and winner name starts revealing
    timerRef.current.push(setTimeout(() => {
      setPhase('converge')
    }, 2200))

    // Reveal
    timerRef.current.push(setTimeout(() => {
      cancelAnimationFrame(rafRef.current)

      // Flash the canvas white then fade to black
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fillRect(0, 0, W, H)
      setPhase('reveal')
      setRevealedName(winner.displayName)
      setDisplayName(winner.displayName)

      // Fade canvas to black
      let alpha = 0.9
      function fadeOut() {
        alpha -= 0.06
        if (alpha <= 0) {
          ctx.clearRect(0, 0, W, H)
          ctx.fillStyle = 'rgba(0,0,0,1)'
          ctx.fillRect(0, 0, W, H)
          return
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fillRect(0, 0, W, H)
        rafRef.current = requestAnimationFrame(fadeOut)
      }
      rafRef.current = requestAnimationFrame(fadeOut)
    }, 3200))

    timerRef.current.push(setTimeout(() => onComplete(), 3800))

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  useEffect(() => {
    if (!isSpinning && !winner) {
      setPhase('idle')
      setDisplayName('')
      setRevealedName('')
      clearAll()
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [isSpinning, winner])

  const isRevealed = phase === 'reveal'

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: 340, height: 280 }}
      role="region"
      aria-label="Matrix draw animation"
      aria-live="polite"
    >
      <canvas
        ref={canvasRef}
        width={340}
        height={280}
        className="absolute inset-0 rounded-xl"
        style={{ background: '#000' }}
      />

      {/* Name display overlay */}
      <div className="relative z-10 flex flex-col items-center gap-3 pointer-events-none">
        <div
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: `1px solid ${isRevealed ? accent : accent + '40'}`,
            background: isRevealed ? `${accent}20` : 'rgba(0,0,0,0.7)',
            boxShadow: isRevealed ? `0 0 40px ${accent}60` : 'none',
            transition: 'all 0.5s ease',
            minWidth: 200,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: isRevealed ? 22 : 15,
              fontWeight: isRevealed ? 800 : 600,
              color: isRevealed ? accent : '#00ff41',
              textShadow: isRevealed
                ? `0 0 20px ${accent}`
                : '0 0 8px #00ff41',
              transition: 'all 0.4s ease',
              letterSpacing: '0.06em',
            }}
          >
            {phase === 'idle' ? (
              <span style={{ color: '#00ff4160' }}>AWAITING DRAW</span>
            ) : displayName}
          </p>
        </div>

        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: isRevealed ? accent : '#00ff4160',
            transition: 'color 0.3s',
          }}
        >
          {phase === 'idle' ? 'READY' : phase === 'rain' ? 'SCANNING MATRIX…' : phase === 'converge' ? 'LOCKING ON…' : '✓ WINNER FOUND'}
        </span>
      </div>

      <span className="sr-only">
        {isRevealed && winner ? `Winner: ${winner.displayName}` : 'Scanning for winner…'}
      </span>
    </div>
  )
}
