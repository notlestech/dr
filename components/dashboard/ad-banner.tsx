'use client'

import { useEffect, useRef } from 'react'
import type { Plan } from '@/types/app'

interface Props {
  plan: Plan
  slot?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

const PLACEHOLDER = '0000000000'

export function AdBanner({ plan, slot = '8572604713' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current || slot === PLACEHOLDER) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // adsbygoogle not ready yet
    }

    // Hide the container if AdSense leaves the slot empty after 3s
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector('ins.adsbygoogle') as HTMLElement | null
      if (ins && ins.offsetHeight === 0) {
        if (containerRef.current) containerRef.current.style.display = 'none'
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [slot])

  if (plan !== 'free' || slot === PLACEHOLDER) return null

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-7840488343669346"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
