'use client'

import { useState, useEffect, useRef } from 'react'

interface TypingTextProps {
  text: string
  /** ms per character (default 42) */
  speed?: number
  /** initial delay before typing starts in ms (default 400) */
  delay?: number
  className?: string
  onComplete?: () => void
}

export function TypingText({ text, speed = 42, delay = 400, className, onComplete }: TypingTextProps) {
  const [index, setIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setIndex(0)
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setIndex((prev) => {
          const next = prev + 1
          if (next >= text.length) {
            clearInterval(interval)
            onCompleteRef.current?.()
          }
          return next
        })
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(startTimer)
  }, [text, speed, delay])

  const done = index >= text.length

  return (
    <span className={className}>
      {text.slice(0, index)}
      {!done && (
        <span className="animate-blink ml-0.5 opacity-70" aria-hidden>|</span>
      )}
    </span>
  )
}
