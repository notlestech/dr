import { cn } from '@/lib/utils'
import type { Plan } from '@/types/app'

const PLAN_STYLES: Record<Plan, string> = {
  free:     'bg-muted text-muted-foreground border-border',
  pro:      'bg-foreground/10 text-foreground border-foreground/20',
  business: 'bg-foreground/10 text-foreground border-foreground/20',
}

const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
}

export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wide',
      PLAN_STYLES[plan],
      className
    )}>
      {PLAN_LABELS[plan]}
    </span>
  )
}
