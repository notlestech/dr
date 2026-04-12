'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { id: string; displayName: string }

interface SpotlightDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

// How many names to show in the spotlight stage (capped at entries.length)
function getDisplayCount(total: number) {
  return Math.max(1, Math.min(total, 7))
}

export function SpotlightDraw({ entries, accent, winner, isSpinning, onComplete }: SpotlightDrawProps) {
  const displayCount = getDisplayCount(entries.length)
  const centerIdx = Math.floor(displayCount / 2)

  const [beamX, setBeamX] = useState(50)
  const [activeIdx, setActiveIdx] = useState(0)
  const [caught, setCaught] = useState(false)
  const [names, setNames] = useState(() =>
    entries.slice(0, displayCount).map(e => e.displayName)
  )
  const rafRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Shuffle names display when idle
  useEffect(() => {
    if (isSpinning || entries.length === 0) return
    const t = setInterval(() => {
      const shuffled = [...entries].sort(() => Math.random() - 0.5).slice(0, displayCount)
      setNames(shuffled.map(e => e.displayName))
    }, 1800)
    return () => clearInterval(t)
  }, [entries, isSpinning, displayCount])

  useEffect(() => {
    if (!isSpinning || !winner) return

    setCaught(false)
    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 1: rapid beam scanning with cycling names (1.8s)
    const scanInterval = setInterval(() => {
      setBeamX(20 + Math.random() * 60)
      setActiveIdx(Math.floor(Math.random() * displayCount))
    }, 120)
    timers.push(setTimeout(() => clearInterval(scanInterval), 1800))

    // Phase 2: slow down (1s)
    timers.push(setTimeout(() => {
      let slowStep = 0
      const slowInterval = setInterval(() => {
        setBeamX(prev => prev + (50 - prev) * 0.3)
        slowStep++
        if (slowStep > 6) clearInterval(slowInterval)
      }, 180)
      timers.push(setTimeout(() => clearInterval(slowInterval), 1100))
    }, 1800))

    // Phase 3: center on winner
    timers.push(setTimeout(() => {
      setBeamX(50)
      const winnerName = winner.displayName
      setNames(prev => {
        const next = [...prev]
        // Make sure next has enough slots
        while (next.length <= centerIdx) next.push('')
        next[centerIdx] = winnerName
        return next
      })
      setActiveIdx(centerIdx)
    }, 3000))

    // Phase 4: caught
    timers.push(setTimeout(() => {
      setCaught(true)
    }, 3400))

    // Complete
    timers.push(setTimeout(() => {
      onComplete()
    }, 4000))

    rafRef.current = timers
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  useEffect(() => {
    if (!isSpinning && !winner) {
      setCaught(false)
      setBeamX(50)
    }
  }, [isSpinning, winner])

  const displayNames = (isSpinning || caught)
    ? names
    : entries.slice(0, displayCount).map(e => e.displayName)

  return (
    <div
      className="relative w-full max-w-md rounded-2xl overflow-hidden select-none"
      style={{ height: 320, background: '#06060f', border: `1px solid ${accent}20` }}
      role="region"
      aria-label="Spotlight draw"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Spotlight beam */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: `${beamX}%`,
          transform: 'translateX(-50%)',
          width: caught ? 160 : 120,
          height: '100%',
          background: `conic-gradient(from 270deg at 50% 0%, transparent 30deg, ${accent}18 60deg, ${accent}25 90deg, ${accent}18 120deg, transparent 150deg)`,
          transition: caught ? 'left 0.3s ease, width 0.3s ease' : 'left 0.15s linear',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Stage floor line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
          zIndex: 3,
        }}
      />

      {/* Names grid */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2"
        style={{ zIndex: 4, paddingBottom: 24 }}
      >
        {displayNames.map((name, i) => {
          const isActive = i === activeIdx && isSpinning
          const isFinal = caught && i === activeIdx

          return (
            <div
              key={i}
              style={{
                fontSize: isFinal ? 22 : isActive ? 18 : 13,
                fontWeight: isFinal ? 800 : isActive ? 700 : 400,
                color: isFinal ? accent : isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease',
                textShadow: isFinal
                  ? `0 0 20px ${accent}, 0 0 40px ${accent}80`
                  : isActive
                    ? `0 0 12px rgba(255,255,255,0.4)`
                    : 'none',
                letterSpacing: isFinal ? '0.05em' : 'normal',
                transform: isFinal ? 'scale(1.1)' : 'scale(1)',
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
          )
        })}
      </div>

      {/* Source light at top */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -8,
          left: `${beamX}%`,
          transform: 'translateX(-50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 16px 4px ${accent}80`,
          transition: caught ? 'left 0.3s ease' : 'left 0.15s linear',
          zIndex: 5,
        }}
      />

      {/* LIVE badge */}
      {isSpinning && !caught && (
        <div
          aria-hidden="true"
          className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: 'pulse 1s infinite' }} />
          <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Live</span>
        </div>
      )}
    </div>
  )
}
