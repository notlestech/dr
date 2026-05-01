'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { id: string; displayName: string }

interface VaultDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

const DIAL_NOTCHES = 40
const DIAL_RADIUS  = 88

function Dial({ rotation, accent, isOpen }: { rotation: number; accent: string; isOpen: boolean }) {
  const notches = Array.from({ length: DIAL_NOTCHES })
  return (
    <svg width={200} height={200} viewBox="-100 -100 200 200" aria-hidden>
      {/* Outer ring */}
      <circle
        r={DIAL_RADIUS}
        fill="none"
        stroke={isOpen ? accent : '#444'}
        strokeWidth={isOpen ? 4 : 2.5}
        style={{
          filter: isOpen ? `drop-shadow(0 0 12px ${accent})` : 'none',
          transition: 'stroke 0.4s, stroke-width 0.4s, filter 0.4s',
        }}
      />

      {/* Notches */}
      {notches.map((_, i) => {
        const angle = (i / DIAL_NOTCHES) * Math.PI * 2
        const major = i % 5 === 0
        const r1 = DIAL_RADIUS - (major ? 10 : 5)
        const r2 = DIAL_RADIUS
        return (
          <line
            key={i}
            x1={Math.cos(angle) * r1}
            y1={Math.sin(angle) * r1}
            x2={Math.cos(angle) * r2}
            y2={Math.sin(angle) * r2}
            stroke={major ? (isOpen ? accent : '#666') : '#333'}
            strokeWidth={major ? 2 : 1}
          />
        )
      })}

      {/* Dial body */}
      <circle
        r={DIAL_RADIUS - 14}
        fill="url(#dialGrad)"
        stroke="#555"
        strokeWidth={1}
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '0 0', transition: 'none' }}
      />
      <defs>
        <radialGradient id="dialGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </radialGradient>
      </defs>

      {/* Indicator line on the dial */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-(DIAL_RADIUS - 18)}
        stroke={isOpen ? accent : '#888'}
        strokeWidth={3}
        strokeLinecap="round"
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '0 0', transition: 'stroke 0.4s' }}
      />

      {/* Center knob */}
      <circle r={10} fill="#2a2a2a" stroke={isOpen ? accent : '#555'} strokeWidth={2} />
      <circle r={4} fill={isOpen ? accent : '#444'} style={{ filter: isOpen ? `drop-shadow(0 0 6px ${accent})` : 'none' }} />

      {/* Top marker */}
      <polygon
        points="0,-96 -5,-86 5,-86"
        fill={accent}
        style={{ filter: `drop-shadow(0 0 4px ${accent}80)` }}
      />
    </svg>
  )
}

export function VaultDraw({ entries, accent, winner, isSpinning, onComplete }: VaultDrawProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const rafRef   = useRef<number>(0)

  const [rotation, setRotation]   = useState(0)
  const [phase, setPhase]         = useState<'idle' | 'spinning' | 'unlocking' | 'open'>('idle')
  const [displayName, setDisplayName] = useState('')
  const [clicks, setClicks]       = useState(0)

  function clearAll() {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
    cancelAnimationFrame(rafRef.current)
  }

  useEffect(() => {
    if (!isSpinning || !winner) return
    const w = winner  // capture non-null ref for nested callbacks

    setPhase('spinning')
    setClicks(0)
    setDisplayName('???')

    // Animate rapid spinning with variable speed
    let speed = 8
    let totalAngle = 0
    const maxAngle = 360 * 6 + Math.random() * 360 // 6+ full rotations

    function tick() {
      totalAngle += speed
      setRotation(r => (r + speed) % 360)

      // Decelerate after 60% of rotation
      if (totalAngle > maxAngle * 0.6) {
        speed = Math.max(0.3, speed * 0.987)
      }

      if (totalAngle < maxAngle) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Stopped — click sound effect (visual)
        setPhase('unlocking')

        let clickCount = 0
        function doClick() {
          clickCount++
          setClicks(clickCount)
          // Small rotation nudge per click
          setRotation(r => r + 12)
          if (clickCount < 3) {
            timerRef.current.push(setTimeout(doClick, 280))
          } else {
            // OPEN!
            timerRef.current.push(setTimeout(() => {
              setPhase('open')
              setDisplayName(w.displayName)
            }, 350))
            timerRef.current.push(setTimeout(() => onComplete(), 900))
          }
        }
        timerRef.current.push(setTimeout(doClick, 200))
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  useEffect(() => {
    if (!isSpinning && !winner) {
      setPhase('idle')
      setDisplayName('')
      setClicks(0)
      clearAll()
    }
  }, [isSpinning, winner])

  const isOpen = phase === 'open'

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none gap-4"
      style={{ width: 340, height: 300 }}
      role="region"
      aria-label="Vault safe draw animation"
      aria-live="polite"
    >
      {/* Vault door frame */}
      <div
        className="flex items-center justify-center rounded-2xl relative"
        style={{
          width: 220,
          height: 220,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          border: `3px solid ${isOpen ? accent : '#333'}`,
          boxShadow: isOpen
            ? `0 0 60px ${accent}40, 0 0 120px ${accent}20, inset 0 0 30px ${accent}10`
            : '0 8px 32px rgba(0,0,0,0.6)',
          transition: 'border-color 0.5s, box-shadow 0.5s',
        }}
      >
        {/* Corner bolts */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y], i) => (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: isOpen ? `radial-gradient(circle at 35% 35%, ${accent}cc, ${accent}44)` : '#2a2a2a',
              border: `1px solid ${isOpen ? accent + '80' : '#444'}`,
              top: y === -1 ? 10 : undefined,
              bottom: y === 1 ? 10 : undefined,
              left: x === -1 ? 10 : undefined,
              right: x === 1 ? 10 : undefined,
              transition: 'background 0.5s, border-color 0.5s',
            }}
          />
        ))}

        {/* Dial */}
        <Dial rotation={rotation} accent={accent} isOpen={isOpen} />

        {/* Click flashes */}
        {clicks > 0 && phase === 'unlocking' && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `${accent}15`,
              animation: 'ping 0.15s ease-out',
            }}
          />
        )}
      </div>

      {/* Name display */}
      <div
        style={{
          padding: '10px 24px',
          borderRadius: 10,
          border: `1px solid ${isOpen ? accent : '#333'}`,
          background: isOpen ? `${accent}15` : 'transparent',
          boxShadow: isOpen ? `0 0 24px ${accent}30` : 'none',
          minWidth: 200,
          textAlign: 'center',
          transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isOpen ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: isOpen ? 20 : 14,
            fontWeight: isOpen ? 800 : 500,
            color: isOpen ? accent : 'rgba(255,255,255,0.4)',
            letterSpacing: isOpen ? '0.04em' : 'normal',
            transition: 'all 0.4s ease',
          }}
        >
          {phase === 'idle'
            ? <span style={{ color: 'rgba(255,255,255,0.2)' }}>VAULT LOCKED</span>
            : phase === 'unlocking'
            ? '— — —'
            : displayName}
        </p>
      </div>

      <span
        style={{
          fontSize: 10,
          fontFamily: 'monospace',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: isOpen ? accent : 'rgba(255,255,255,0.2)',
          transition: 'color 0.3s',
        }}
      >
        {phase === 'idle'
          ? 'READY'
          : phase === 'spinning'
          ? 'CRACKING THE CODE…'
          : phase === 'unlocking'
          ? '— CLICK — CLICK — CLICK —'
          : '🔓 VAULT OPEN · WINNER REVEALED'}
      </span>

      <span className="sr-only">
        {isOpen && winner ? `Winner: ${winner.displayName}` : 'Cracking vault to find winner…'}
      </span>
    </div>
  )
}
