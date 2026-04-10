import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, Users, Layers, ArrowRight, Dice5, Clock } from 'lucide-react'
import { formatNumber, timeAgo } from '@/lib/utils'
import type { Form } from '@/types/app'

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

  const [{ data: forms }, { data: recentDraws }, { data: profile }] = await Promise.all([
    supabase.from('forms').select('*').eq('workspace_id', wid).order('updated_at', { ascending: false }).limit(3),
    supabase.from('draws').select('*, forms(name, accent_color)').order('drawn_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
  ])

  const formList = (forms ?? []) as Form[]
  let totalEntries = 0
  let totalWinners = 0
  let totalForms = 0

  const { count: fc } = await supabase
    .from('forms').select('*', { count: 'exact', head: true }).eq('workspace_id', wid)
  totalForms = fc ?? 0

  if (formList.length > 0) {
    const ids = formList.map(f => f.id)
    const [{ count: ec }, { count: wc }] = await Promise.all([
      supabase.from('entries').select('*', { count: 'exact', head: true }).in('form_id', ids),
      supabase.from('entries').select('*', { count: 'exact', head: true }).in('form_id', ids).eq('is_winner', true),
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
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getData(user.id)
  if (!data) redirect('/login')

  const { forms, totalForms, totalEntries, totalWinners, recentDraws, name } = data

  const stats = [
    { label: 'Forms',   value: totalForms,                    icon: Layers },
    { label: 'Entries', value: formatNumber(totalEntries),    icon: Users  },
    { label: 'Winners', value: formatNumber(totalWinners),    icon: Trophy },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-2xl mx-auto w-full">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {name ? `Hey, ${name}` : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your raffles.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
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
            {(recentDraws as any[]).map(draw => (
              <div key={draw.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="size-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (draw.forms?.accent_color ?? '#000') + '20', color: draw.forms?.accent_color }}
                >
                  <Trophy className="size-3" />
                </div>
                <span className="text-sm flex-1 min-w-0 truncate">{draw.forms?.name ?? 'Unknown form'}</span>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(draw.drawn_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
