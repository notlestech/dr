'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { PlanKey } from '@/lib/stripe'

const PLANS = [
  {
    key: 'free',
    planId: 'free' as const,
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect to get started',
    features: ['3 forms', '500 entries per form', '3 fields per form', '1 draw per form', '4 form templates', 'DrawVault branding'],
    cta: 'Current Plan',
    popular: false,
  },
  {
    key: 'pro_monthly' as PlanKey,
    planId: 'pro' as const,
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 79,
    description: 'For creators & streamers',
    features: ['Unlimited forms', '10,000 entries per form', '10 fields per form', 'Unlimited draws', 'All 10 templates', 'No branding', 'Analytics + CSV export'],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    key: 'business_monthly' as PlanKey,
    planId: 'business' as const,
    name: 'Business',
    monthlyPrice: 29,
    yearlyPrice: 249,
    description: 'For agencies & companies',
    features: ['Everything in Pro', 'Unlimited entries', '3 workspaces', 'Auto-draw scheduling', 'Webhooks', 'Audit logs', 'Priority support'],
    cta: 'Upgrade to Business',
    popular: false,
  },
]

interface Props { currentPlan: 'free' | 'pro' | 'business' }

export function UpgradeClient({ currentPlan }: Props) {
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(planKey: PlanKey) {
    setLoading(planKey)
    const key = yearly ? planKey.replace('monthly', 'yearly') as PlanKey : planKey
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey: key, successUrl: `${window.location.origin}/dashboard?upgraded=1`, cancelUrl: window.location.href }),
    })
    const { url, error } = await res.json()
    if (error) { toast.error(error); setLoading(null); return }
    window.location.href = url
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Choose your plan</h1>
        <p className="text-muted-foreground">Run live draws for your community, no limits.</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-sm ${!yearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setYearly(v => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors ${yearly ? 'bg-foreground' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 size-4 bg-white rounded-full transition-transform shadow-sm ${yearly ? 'translate-x-5' : ''}`} />
          </button>
          <span className={`text-sm ${yearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Yearly <Badge variant="outline" className="ml-1 text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-[10px]">save ~30%</Badge>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.planId === currentPlan
          const isDowngrade = (
            (currentPlan === 'business' && plan.planId !== 'business') ||
            (currentPlan === 'pro' && plan.planId === 'free')
          )
          const disabled = isCurrent || isDowngrade

          return (
            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-foreground shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 gap-1">
                    <Zap className="size-3" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[10px]">
                      Current plan
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline gap-1 pt-1">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">
                        ${yearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
                {yearly && plan.yearlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground">billed ${plan.yearlyPrice}/year</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-emerald-400 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => !disabled && plan.key !== 'free' && checkout(plan.key as PlanKey)}
                  disabled={disabled || loading === plan.key}
                  className="w-full"
                  variant={plan.popular && !isCurrent ? 'default' : 'outline'}
                >
                  {loading === plan.key ? 'Redirecting...' : isCurrent ? 'Current Plan' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        All plans include a 14-day money-back guarantee · Cancel anytime
      </p>

      <Separator />

      {/* FAQ */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto w-full">
        {[
          { q: 'Can I cancel anytime?', a: 'Yes — cancel from the billing portal, no questions asked. You keep access until the end of the billing period.' },
          { q: 'What happens to my forms if I downgrade?', a: 'Existing forms stay intact. You just lose access to Pro features on new forms.' },
          { q: 'Is there a free trial?', a: 'The Free plan is free forever. All paid plans come with a 14-day money-back guarantee.' },
          { q: 'Do you support multiple team members?', a: 'Business plan includes 3 workspaces with editor/viewer roles.' },
        ].map(({ q, a }) => (
          <div key={q}>
            <p className="text-sm font-medium mb-1">{q}</p>
            <p className="text-sm text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
