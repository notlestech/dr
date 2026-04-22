import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, Users, Layers, ArrowRight, Dice5, Clock, Zap, Star, Building2 } from 'lucide-react'
import { formatNumber, timeAgo } from '@/lib/utils'
import type { Form, Plan } from '@/types/app'
import { UpgradeToast } from '@/components/dashboard/upgrade-toast'
import { AdBanner } from '@/components/dashboard/ad-banner'

interface RecentDraw {
  id: string
  drawn_at: string
  // Supabase returns a one-to-many join as an array; we take the first element
  forms: { name: string; accent_color: string }[] | null
}

export const metadata = { title: 'Dashboard' }

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  draft:  'bg-muted text-muted-foreground border-border',
  closed: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
}

async function getData(userId: string) {
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()

  if (!membership) return null
  const wid = membership.workspace_id

  // Use allSettled so a single failing query doesn't crash the entire dashboard
  const [formsRes, drawsRes, profileRes, subRes] = await Promise.allSettled([
    supabase.from('forms').select('*').eq('workspace_id', wid).order('updated_at', { ascending: false }).limit(3),
    supabase.from('draws').select('id, drawn_at, forms(name, accent_color)').eq('forms.workspace_id', wid).order('drawn_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
    supabase.from('subscriptions').select('plan').eq('workspace_id', wid).maybeSingle(),
  ])

  const forms      = formsRes.status   === 'fulfilled' ? formsRes.value.data   : null
  const rawDraws   = drawsRes.status   === 'fulfilled' ? drawsRes.value.data   : null
  const profile    = profileRes.status === 'fulfilled' ? profileRes.value.data : null
  const sub        = subRes.status     === 'fulfilled' ? subRes.value.data     : null
  const recentDraws: RecentDraw[] = (rawDraws ?? []) as RecentDraw[]
  const plan = (sub?.plan ?? 'free') as Plan

  const formList = (forms ?? []) as Form[]
  let totalEntries = 0
  let totalWinners = 0
  let totalForms = 0

  const { count: fc, data: allForms } = await supabase
    .from('forms').select('id', { count: 'exact' }).eq('workspace_id', wid)
  totalForms = fc ?? 0

  const allFormIds = (allForms ?? []).map(f => f.id)
  if (allFormIds.length > 0) {
    const [{ count: ec }, { count: wc }] = await Promise.all([
      supabase.from('entries').select('*', { count: 'exact', head: true }).in('form_id', allFormIds),
      supabase.from('entries').select('*', { count: 'exact', head: true }).in('form_id', allFormIds).eq('is_winner', true),
    ])
    totalEntries = ec ?? 0
    totalWinners = wc ?? 0
  }

  return {
    forms: formList,
    totalForms,
    totalEntries,
    totalWinners,
    recentDraws: recentDraws ?? [],
    name: profile?.full_name?.split(' ')[0] ?? null,
    plan,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getData(user.id)
  if (!data) redirect('/login')

  const { forms, totalForms, totalEntries, totalWinners, recentDraws, name, plan } = data

  const planAccent = plan === 'business' ? '#f59e0b' : plan === 'pro' ? '#8b5cf6' : undefined

  const stats = [
    { label: 'Forms',   value: totalForms,                    icon: Layers },
    { label: 'Entries', value: formatNumber(totalEntries),    icon: Users  },
    { label: 'Winners', value: formatNumber(totalWinners),    icon: Trophy },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-2xl mx-auto w-full">
      <Suspense><UpgradeToast /></Suspense>

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {name ? `Hey, ${name}` : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your raffles.
        </p>
      </div>

      {/* Plan banner */}
      {plan === 'free' && (
        <Link href="/settings/billing">
          <div className="border border-dashed rounded-xl p-4 flex items-center gap-4 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group cursor-pointer">
            <div className="size-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <Zap className="size-4 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Free plan</p>
              <p className="text-xs text-muted-foreground">Unlock unlimited forms, pro templates & more</p>
            </div>
            <span className="text-xs font-semibold text-violet-500 group-hover:underline shrink-0">Upgrade →</span>
          </div>
        </Link>
      )}

      {plan === 'pro' && (
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(168,85,247,0.06) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <div className="size-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
            <Star className="size-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-violet-300">Pro</p>
            <p className="text-xs text-violet-400/70">Unlimited forms · 10k entries/form · All templates</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 shrink-0">Active</span>
        </div>
      )}

      {plan === 'business' && (
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(251,191,36,0.05) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="size-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <Building2 className="size-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-300">Business</p>
            <p className="text-xs text-amber-400/70">Unlimited everything · 3 workspaces · Spotlight draw</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 shrink-0">Active</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border rounded-xl p-4 space-y-2"
            style={planAccent ? { borderColor: planAccent + '40', boxShadow: `0 0 0 1px ${planAccent}18` } : undefined}
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Inline ad — mobile/tablet only (side columns handle wide screens) */}
      <div className="2xl:hidden">
        <AdBanner plan={plan} />
      </div>

      {/* Recent forms (top 3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Recent forms</p>
          <Link href="/forms" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center">
            <Layers className="size-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No forms yet. Create your first raffle.</p>
            <Link href="/forms/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" /> Create a form
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y border rounded-xl overflow-hidden">
            {forms.map(form => (
              <div key={form.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: form.accent_color }} />
                <Link href={`/forms/${form.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{form.name}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="size-3" />{timeAgo(form.updated_at)}
                  </p>
                </Link>
                <Link
                  href={`/forms/${form.id}/draw`}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  title="Run draw"
                >
                  <Dice5 className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New form CTA */}
      <Link href="/forms/new">
        <div className="border border-dashed rounded-xl p-5 flex items-center gap-4 hover:border-foreground/40 hover:bg-muted/20 transition-all group cursor-pointer">
          <div className="size-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors shrink-0">
            <Plus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium">New form</p>
            <p className="text-xs text-muted-foreground">Create a raffle, giveaway, or waitlist</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      {/* Recent draws */}
      {recentDraws.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Recent draws</p>
          <div className="divide-y border rounded-xl overflow-hidden">
            {recentDraws.map(draw => {
              const form = Array.isArray(draw.forms) ? draw.forms[0] : draw.forms
              return (
                <div key={draw.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="size-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (form?.accent_color ?? '#000') + '20', color: form?.accent_color }}
                  >
                    <Trophy className="size-3" />
                  </div>
                  <span className="text-sm flex-1 min-w-0 truncate">{form?.name ?? 'Unknown form'}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(draw.drawn_at)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
