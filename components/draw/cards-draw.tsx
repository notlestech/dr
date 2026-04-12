'use client'

import { useEffect, useState } from 'react'

interface Entry { id: string; displayName: string }

interface CardsDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

const CARD_ROTATIONS = [-18, -9, 0, 9, 18]
const CARD_TRANSLATE_Y = [8, -4, -12, -4, 8]

export function CardsDraw({ entries, accent, winner, isSpinning, onComplete }: CardsDrawProps) {
  const [flipped, setFlipped] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const [shuffleOffset, setShuffleOffset] = useState<number[]>([0, 0, 0, 0, 0])

  const count = Math.min(entries.length, 5)
  const cardSlots = Array.from({ length: count }, (_, i) => i)
  const centerIdx = Math.floor(count / 2)

  useEffect(() => {
    if (!isSpinning || !winner) return

    setFlipped(false)
    setShuffling(true)

    // Shuffle animation: cards scatter then return
    let frame = 0
    const intervals = [0, 80, 160, 240, 320]
    const timers: ReturnType<typeof setTimeout>[] = []

    // Scatter
    cardSlots.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setShuffleOffset(prev => {
          const next = [...prev]
          next[i] = (Math.random() - 0.5) * 60
          return next
        })
      }, intervals[i] ?? i * 80))
    })

    // Return to position
    timers.push(setTimeout(() => {
      setShuffleOffset([0, 0, 0, 0, 0])
    }, 700))

    // Flip center card
    timers.push(setTimeout(() => {
      setShuffling(false)
      setFlipped(true)
    }, 1100))

    // Complete
    timers.push(setTimeout(() => {
      onComplete()
    }, 1600))

    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  // Reset flip when idle
  useEffect(() => {
    if (!isSpinning && !winner) {
      setFlipped(false)
      setShuffleOffset([0, 0, 0, 0, 0])
    }
  }, [isSpinning, winner])

  if (count === 0) return null

  return (
    <div
      className="relative flex items-end justify-center gap-0"
      style={{ height: 220, width: 360 }}
      role="region"
      aria-label={flipped && winner ? `Winner drawn: ${winner.displayName}` : 'Card draw animation'}
      aria-live="polite"
      aria-atomic="true"
    >
      {cardSlots.map((_, i) => {
        const isCenter = i === centerIdx
        const rot = CARD_ROTATIONS[i] ?? 0
        const ty = CARD_TRANSLATE_Y[i] ?? 0

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(i / (count - 1 || 1)) * 80 + 10}%`,
              bottom: 0,
              transform: `
                rotate(${rot}deg)
                translateY(${ty + shuffleOffset[i]}px)
              `,
              transition: shuffling ? 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' : 'transform 0.5s ease',
              zIndex: isCenter ? 10 : 5 - Math.abs(i - centerIdx),
              perspective: 1000,
            }}
          >
            <div
              style={{
                width: 90,
                height: 130,
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: isCenter && flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Card back */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  borderRadius: 10,
                  background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
                  border: `2px solid ${accent}40`,
                  boxShadow: isCenter
                    ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${accent}30`
                    : '0 4px 16px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Card back pattern */}
                <div
                  style={{
                    width: 60,
                    height: 90,
                    borderRadius: 6,
                    border: `1px solid ${accent}30`,
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 4px,
                      ${accent}08 4px,
                      ${accent}08 8px
                    )`,
                  }}
                />
              </div>

              {/* Card front (winner) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)`,
                  border: `2px solid ${accent}`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 32px ${accent}50`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">🏆</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: accent,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    lineHeight: 1.3,
                  }}
                >
                  {winner?.displayName ?? ''}
                </span>
                <span className="sr-only">Winner: {winner?.displayName ?? ''}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
