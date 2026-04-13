'use client'

import { useEffect, useRef } from 'react'
import type { Plan } from '@/types/app'

interface Props {
  plan: Plan
  // Replace with your actual ad-slot ID from Google AdSense dashboard
  slot?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdBanner({ plan, slot = '0000000000' }: Props) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [])

  // Paid users never see ads
  if (plan !== 'free') return null

  return (
    <div className="ads w-full overflow-hidden rounded-xl border border-dashed border-border/50 bg-muted/20 min-h-[90px] flex items-center justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
        data-ad-client="ca-pub-7840488343669346"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
