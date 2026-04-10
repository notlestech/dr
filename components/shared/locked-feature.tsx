'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/app'
import { PlanBadge } from './plan-badge'
import Link from 'next/link'

interface Props {
  requiredPlan: Plan
  children: React.ReactNode
  className?: string
  blur?: boolean
}

export function LockedFeature({ requiredPlan, children, className, blur = true }: Props) {
  return (
    <div className={cn('relative', className)}>
      {blur && (
        <div className="absolute inset-0 z-10 rounded-lg backdrop-blur-sm bg-background/80 flex flex-col items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Requires
            <PlanBadge plan={requiredPlan} />
          </div>
          <Link
            href="/upgrade"
            className="mt-1 text-xs text-foreground underline underline-offset-2 hover:no-underline"
          >
            Upgrade →
          </Link>
        </div>
      )}
      <div className={cn(blur && 'pointer-events-none select-none')}>
        {children}
      </div>
    </div>
  )
}
