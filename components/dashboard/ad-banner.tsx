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

const PLACEHOLDER = '0000000000'

export function AdBanner({ plan, slot = '8572604713' }: Props) {
  const pushed = useRef(false)

  useEffect(() => {
    // Don't push until we have a real slot ID
    if (pushed.current || slot === PLACEHOLDER) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [slot])

  // Paid users never see ads; also skip if slot not yet configured
  if (plan !== 'free' || slot === PLACEHOLDER) return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%' }}
      data-ad-client="ca-pub-7840488343669346"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
