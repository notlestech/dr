'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { id: string; displayName: string }

interface PickerDrawProps {
  entries: Entry[]
  accent: string
  winner: Entry | null
  isSpinning: boolean
  onComplete: () => void
}

export function PickerDraw({ entries, accent, winner, isSpinning, onComplete }: PickerDrawProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [currentName, setCurrentName] = useState('')
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'typing' | 'done'>('idle')

  function clearAll() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!isSpinning || !winner) return

    setPhase('scanning')
    setTyped('')

    // Build shuffled name pool for the scan phase
    const pool = [...entries].sort(() => Math.random() - 0.5)
    const scanNames = Array.from({ length: 20 }, (_, i) => pool[i % pool.length].displayName)

    let delay = 55
    let idx = 0

    function showNext() {
      if (idx >= scanNames.length) {
        // Transition to typewriter reveal
        setPhase('typing')
        const name = winner!.displayName
        let charIdx = 0

        function typeChar() {
          charIdx++
          setTyped(name.slice(0, charIdx))
          if (charIdx < name.length) {
            timersRef.current.push(setTimeout(typeChar, 70 + Math.random() * 50))
          } else {
            timersRef.current.push(setTimeout(() => {
              setPhase('done')
              onComplete()
            }, 500))
          }
        }

        timersRef.current.push(setTimeout(typeChar, 320))
        return
      }

      setCurrentName(scanNames[idx])
      idx++
      delay = Math.min(delay + 16, 260)
      timersRef.current.push(setTimeout(showNext, delay))
    }

    timersRef.current.push(setTimeout(showNext, 0))
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning])

  useEffect(() => {
    if (!isSpinning && !winner) {
      setPhase('idle')
      setCurrentName('')
      setTyped('')
      clearAll()
    }
  }, [isSpinning, winner])

  const isDone = phase === 'done'
  const isTyping = phase === 'typing'
  const displayName = isTyping || isDone
    ? typed
    : (currentName || (entries[0]?.displayName ?? ''))

  return (
    <div
      className="flex flex-col items-center justify-center gap-5 select-none"
      style={{ minWidth: 320 }}
      role="region"
      aria-label="Name picker draw animation"
      aria-live="polite"
    >
      {/* Name display */}
      <div
        style={{
          padding: '28px 48px',
          borderRadius: 20,
          border: `2px solid ${isDone ? accent : accent + '35'}`,
          background: isDone ? `${accent}10` : 'transparent',
          boxShadow: isDone ? `0 0 48px ${accent}28, 0 0 0 1px ${accent}18` : 'none',
          transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isDone ? 'scale(1.06)' : 'scale(1)',
          minWidth: 280,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: isDone ? 26 : phase === 'idle' ? 14 : 17,
            fontWeight: isDone ? 800 : phase === 'idle' ? 400 : 500,
            color: isDone ? accent : phase === 'idle' ? 'var(--muted-foreground)' : 'var(--foreground)',
            transition: 'font-size 0.3s ease, font-weight 0.3s ease, color 0.3s ease',
            fontFamily: isTyping || isDone ? 'monospace' : 'inherit',
            letterSpacing: isDone ? '0.02em' : 'normal',
            minHeight: '1.4em',
          }}
        >
          {phase === 'idle' ? 'Ready to pick' : displayName}
          {isTyping && (
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                backgroundColor: accent,
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                animation: 'dv-blink 0.7s step-end infinite',
              }}
            />
          )}
        </p>
      </div>

      {/* Status label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: isDone ? accent : 'var(--muted-foreground)',
          transition: 'color 0.3s',
        }}
      >
        {phase === 'idle'
          ? 'Awaiting draw'
          : phase === 'scanning'
          ? 'Selecting winner…'
          : phase === 'typing'
          ? 'Revealing…'
          : '🎉 Winner!'}
      </p>

      {isDone && winner && <span className="sr-only">Winner: {winner.displayName}</span>}

      <style>{`@keyframes dv-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
