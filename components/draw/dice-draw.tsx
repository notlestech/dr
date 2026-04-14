'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { id: string; displayName: string }

interface DiceDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

// SVG dot layouts for dice faces 1–6
const DOTS: [number, number][][] = [
  [[50, 50]],                                                          // 1
  [[25, 25], [75, 75]],                                                // 2
  [[25, 25], [50, 50], [75, 75]],                                      // 3
  [[25, 25], [75, 25], [25, 75], [75, 75]],                            // 4
  [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],                  // 5
  [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],        // 6
]

function DieFace({ face, accent, size = 100 }: { face: number; accent: string; size?: number }) {
  const dots = DOTS[(face - 1) % 6]
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <rect
        x="2" y="2" width="96" height="96" rx="18"
        fill="#0f0f1a"
        stroke={accent}
        strokeWidth="3"
        style={{ filter: `drop-shadow(0 0 12px ${accent}60)` }}
      />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7" fill={accent} />
      ))}
    </svg>
  )
}

export function DiceDraw({ entries, accent, winner, isSpinning, onComplete }: DiceDrawProps) {
  const [faces, setFaces]       = useState([1, 2, 3])
  const [rolling, setRolling]   = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [shuffle, setShuffle]   = useState<string[]>([])
  const [shuffleIdx, setShuffleIdx] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = [] }

  useEffect(() => {
    if (!isSpinning || !winner) return

    setRevealed(false)
    setRolling(true)

    // Build name shuffle list
    const pool = [...entries].sort(() => Math.random() - 0.5)
    const nameList = Array.from({ length: 22 }, (_, i) => pool[i % pool.length].displayName)
    setShuffle(nameList)
    setShuffleIdx(0)

    // Roll dice frames fast then slow
    let step = 0
    const maxSteps = 28
    function rollStep() {
      if (step >= maxSteps) return
      setFaces([
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
      ])
      setShuffleIdx(i => Math.min(i + 1, nameList.length - 1))
      step++
      const delay = step < 12 ? 80 : step < 22 ? 140 : 260
      timers.current.push(setTimeout(rollStep, delay))
    }
    rollStep()

    // Reveal
    timers.current.push(setTimeout(() => {
      setRolling(false)
      setRevealed(true)
      setFaces([6, 6, 6]) // triple-six for dramatic effect
    }, 3200))

    timers.current.push(setTimeout(() => onComplete(), 3800))

    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  useEffect(() => {
    if (!isSpinning && !winner) {
      setRevealed(false)
      setFaces([1, 2, 3])
      setShuffle([])
      setShuffleIdx(0)
    }
  }, [isSpinning, winner])

  const displayName = revealed && winner
    ? winner.displayName
    : shuffle[shuffleIdx] ?? (entries[0]?.displayName ?? '???')

  return (
    <div
      className="flex flex-col items-center gap-6 select-none"
      role="region"
      aria-label="Dice draw animation"
      aria-live="polite"
    >
      {/* Dice row */}
      <div className="flex items-center gap-4">
        {faces.map((face, i) => (
          <div
            key={i}
            style={{
              transition: rolling ? 'transform 0.12s ease' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              transform: rolling
                ? `rotate(${(Math.random() - 0.5) * 20}deg) scale(${revealed ? 1.15 : 1})`
                : revealed
                  ? 'rotate(0deg) scale(1.2)'
                  : 'rotate(0deg) scale(1)',
              filter: revealed ? `drop-shadow(0 0 20px ${accent}80)` : undefined,
            }}
          >
            <DieFace face={face} accent={revealed ? accent : '#6b7280'} size={86} />
          </div>
        ))}
      </div>

      {/* Rolling name display */}
      <div
        style={{
          minWidth: 280,
          textAlign: 'center',
          padding: '12px 24px',
          borderRadius: 12,
          border: `1px solid ${accent}${revealed ? '80' : '30'}`,
          background: revealed ? `${accent}14` : '#0f0f1a',
          transition: 'all 0.4s ease',
          boxShadow: revealed ? `0 0 32px ${accent}30` : 'none',
        }}
      >
        <p
          style={{
            fontSize: revealed ? 22 : 16,
            fontWeight: revealed ? 800 : 500,
            color: revealed ? accent : 'rgba(255,255,255,0.7)',
            transition: 'all 0.3s ease',
            letterSpacing: revealed ? '0.03em' : 'normal',
          }}
        >
          {displayName}
        </p>
      </div>

      <span className="sr-only">
        {revealed && winner ? `Winner: ${winner.displayName}` : 'Rolling dice…'}
      </span>
    </div>
  )
}
