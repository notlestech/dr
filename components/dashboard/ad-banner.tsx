'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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
const DISMISSED_KEY = 'dv_adblock_dismissed'

export function AdBanner({ plan, slot = '8572604713' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)
  const [adBlocked, setAdBlocked] = useState(false)
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  useEffect(() => {
    // Don't show the nudge if user already dismissed it
    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === '1'
    setDismissed(wasDismissed)

    if (pushed.current || slot === PLACEHOLDER) return

    // Try to push the ad
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // script blocked or not yet loaded
    }

    // After 2.5s, check if the ad actually rendered
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector('ins.adsbygoogle') as HTMLElement | null
      const blocked = !ins || ins.offsetHeight === 0

      if (blocked) {
        // Collapse empty container
        if (containerRef.current) containerRef.current.style.display = 'none'
        // Show nudge only if user hasn't dismissed it before
        if (!localStorage.getItem(DISMISSED_KEY)) {
          setAdBlocked(true)
          setDismissed(false)
        }
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [slot])

  if (plan !== 'free' || slot === PLACEHOLDER) return null

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <>
      {/* Ad slot */}
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

      {/* Ad blocker nudge — shown once, dismissible */}
      {adBlocked && !dismissed && (
        <div className="w-full rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 flex items-start justify-between gap-3 text-xs text-muted-foreground">
          <p className="leading-relaxed">
            Looks like you&apos;re using an ad blocker. Ads keep DrawVault free — no popups, no trackers, just small banners.{' '}
            <Link href="/upgrade" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Upgrade to Pro
            </Link>{' '}
            to remove them entirely.
          </p>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="shrink-0 hover:text-foreground transition-colors mt-0.5 text-base leading-none"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
