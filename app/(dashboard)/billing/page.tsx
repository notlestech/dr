import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BillingPortalButton } from '@/components/billing/billing-portal-button'
import { FormLimitControl } from '@/components/billing/form-limit-control'
import {
  Zap, Crown, Sparkles, CreditCard, Layers,
  Users, BarChart2, AlertTriangle,
} from 'lucide-react'
import type { Form, Plan } from '@/types/app'

export const metadata = { title: 'Billing' }

const PLAN_LIMITS: Record<Plan, { forms: number | null; entries: number | null; label: string }> = {
  free:     { forms: 3,    entries: 500,   label: 'Free' },
  pro:      { forms: null, entries: 10000, label: 'Pro' },
  business: { forms: null, entries: null,  label: 'Business' },
}

const PLAN_STYLE: Record<Plan, { icon: React.ElementType; badge: string; ring: string }> = {
  free:     { icon: Sparkles, badge: 'bg-muted text-muted-foreground border-border',                        ring: 'border-border' },
  pro:      { icon: Zap,      badge: 'bg-violet-500/10 text-violet-500 border-violet-500/30',               ring: 'border-violet-500/30' },
  business: { icon: Crown,    badge: 'bg-amber-500/10  text-amber-600  border-amber-500/30',                ring: 'border-amber-500/30' },
}

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const warning = limit && pct >= 80
  const over    = limit && pct >= 100

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium tabular-nums ${over ? 'text-destructive' : warning ? 'text-amber-500' : ''}`}>
          {used.toLocaleString()}{limit ? ` / ${limit.toLocaleString()}` : ' / ∞'}
        </span>
      </div>
      {limit ? (
        <Progress
          value={pct}
          className={`h-1.5 ${over ? '[&>div]:bg-destructive' : warning ? '[&>div]:bg-amber-500' : ''}`}
        />
      ) : (
        <div className="h-1.5 rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-emerald-500/40" />
        </div>
      )}
    </div>
  )
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
  if (!membership) redirect('/login')

  const wid = membership.workspace_id

  const [{ data: sub }, { data: forms }] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('workspace_id', wid).maybeSingle(),
    supabase.from('forms').select('*, entries(count)').eq('workspace_id', wid).order('created_at', { ascending: false }),
  ])

  // Fetch entry count separately so we can use the resolved form IDs
  const formIds = forms?.map(f => f.id) ?? ['00000000-0000-0000-0000-000000000000']
  const { count: totalEntries } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .in('form_id', formIds)

  const plan   = (sub?.plan ?? 'free') as Plan
  const limits = PLAN_LIMITS[plan]
  const style  = PLAN_STYLE[plan]
  const Icon   = style.icon

  const formList = (forms ?? []) as (Form & { entries: { count: number }[] })[]
  const formCount = formList.length

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing & Usage</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor your usage and manage your plan</p>
      </div>

      {/* Current plan */}
      <Card className={`border-2 ${style.ring}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {limits.label} Plan
                  <Badge className={`text-[10px] border px-1.5 py-0 ${style.badge}`}>{limits.label}</Badge>
                </CardTitle>
                <CardDescription>
                  {plan === 'free' && 'Free forever · Upgrade to unlock more'}
                  {plan === 'pro' && (renewalDate ? `Renews ${renewalDate}` : 'Active subscription')}
                  {plan === 'business' && (renewalDate ? `Renews ${renewalDate}` : 'Active subscription')}
                </CardDescription>
              </div>
            </div>
            {plan !== 'free' ? (
              <BillingPortalButton />
            ) : (
              <Link href="/upgrade">
                <Button size="sm" className="gap-1.5 shrink-0">
                  <Zap className="size-3.5" /> Upgrade
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Usage overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart2 className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Usage</CardTitle>
          </div>
          <CardDescription>How much of your plan you&apos;ve used this period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <UsageBar used={formCount}           limit={limits.forms}   label="Forms" />
          <UsageBar used={totalEntries ?? 0}   limit={null}           label="Total entries (all forms)" />

          {/* Warn if near form limit */}
          {limits.forms && formCount >= limits.forms && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle className="size-3.5 shrink-0" />
              You&apos;ve reached your form limit. <Link href="/upgrade" className="underline ml-1">Upgrade to create more.</Link>
            </div>
          )}
          {limits.forms && formCount >= limits.forms * 0.8 && formCount < limits.forms && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 rounded-lg px-3 py-2">
              <AlertTriangle className="size-3.5 shrink-0" />
              You&apos;re approaching your form limit ({formCount} of {limits.forms}).
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-form entry limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Form entry limits</CardTitle>
          </div>
          <CardDescription>
            Control how many entries each form accepts.
            {limits.entries && ` Max ${limits.entries.toLocaleString()} per form on ${limits.label} plan.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No forms yet.</p>
          ) : (
            formList.map(form => {
              const entryCount = form.entries?.[0]?.count ?? 0
              return (
                <div key={form.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: form.accent_color }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{form.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Users className="size-3" />
                        {entryCount.toLocaleString()} entries
                        {form.max_entries ? ` / ${form.max_entries.toLocaleString()} limit` : ' · no limit'}
                      </div>
                      {form.max_entries && (
                        <Progress
                          value={Math.min(100, Math.round((entryCount / form.max_entries) * 100))}
                          className="h-1 mt-1.5 w-32"
                        />
                      )}
                    </div>
                  </div>
                  <FormLimitControl
                    formId={form.id}
                    currentLimit={form.max_entries ?? null}
                    planMax={limits.entries}
                  />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {plan === 'free' && (
        <Card className="border-dashed">
          <CardContent className="pt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Remove ads &amp; unlock more</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Pro for unlimited forms, 10k entries, and no ads.</p>
            </div>
            <Link href="/upgrade">
              <Button size="sm" className="gap-1.5 shrink-0">
                <Zap className="size-3.5" /> Upgrade →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
