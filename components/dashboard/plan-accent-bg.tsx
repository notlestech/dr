'use client'

import { useEffect, useRef } from 'react'

const PLAN_CONFIG = {
  free:     null,
  pro:      { color: '139, 92, 246' },   // violet-500
  business: { color: '245, 158, 11' },   // amber-500
}

export function PlanAccentBg({ plan }: { plan: string }) {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] ?? null
  const ref = useRef<HTMLDivElement>(null)

  // Animate the gradient position slowly
  useEffect(() => {
    if (!config || !ref.current) return
    const el = ref.current
    let frame: number
    let t = 0

    function tick() {
      t += 0.003
      const x = 50 + Math.sin(t) * 20
      const y = 50 + Math.cos(t * 0.7) * 20
      el.style.background = `radial-gradient(ellipse 60% 50% at ${x}% ${y}%, rgba(${config!.color}, 0.07) 0%, transparent 70%)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [config])

  if (!config) return null

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  )
}
