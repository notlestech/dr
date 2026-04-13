import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SharePanel } from '@/components/shared/share-panel'
import { BackButton } from '@/components/dashboard/back-button'
import { FormDetailActions } from '@/components/forms/form-detail-actions'
import { Users, Trophy, BarChart2, Settings, Dice5, ExternalLink, Clock, History } from 'lucide-react'
import { formatNumber, timeAgo } from '@/lib/utils'
import type { Form } from '@/types/app'
import { AdBanner } from '@/components/dashboard/ad-banner'

interface Props { params: Promise<{ formId: string }> }

const STATUS_COLORS: Record<string, string> = {
  active:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft:   'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  closed:  'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function FormOverviewPage({ params }: Props) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase.from('forms').select('*').eq('id', formId).single()
  if (!form) notFound()

  const f = form as Form

  // Plan
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()
  const { data: sub } = membership
    ? await supabase.from('subscriptions').select('plan').eq('workspace_id', membership.workspace_id).maybeSingle()
    : { data: null }
  const isPro = sub?.plan === 'pro' || sub?.plan === 'business'

  // Stats
  const { count: totalEntries } = await supabase
    .from('entries').select('*', { count: 'exact', head: true }).eq('form_id', formId)

  const { count: winnerCount } = await supabase
    .from('entries').select('*', { count: 'exact', head: true }).eq('form_id', formId).eq('is_winner', true)

  const { count: drawCount } = await supabase
    .from('draws').select('*', { count: 'exact', head: true }).eq('form_id', formId)

  // Last entry
  const { data: lastEntry } = await supabase
    .from('entries').select('entered_at').eq('form_id', formId).order('entered_at', { ascending: false }).limit(1).single()

  const stats = [
    { label: 'Total Entries', value: formatNumber(totalEntries ?? 0), icon: Users },
    { label: 'Winners Drawn', value: formatNumber(winnerCount ?? 0), icon: Trophy },
    { label: 'Draws Run', value: formatNumber(drawCount ?? 0), icon: Dice5 },
  ]

  const quickLinks = [
    { href: `/forms/${formId}/entries`,  icon: Users,    label: 'Entries'  },
    { href: `/forms/${formId}/draw`,     icon: Dice5,    label: 'Draw'     },
    { href: `/forms/${formId}/draws`,    icon: History,  label: 'History'  },
    { href: `/forms/${formId}/analytics`,icon: BarChart2,label: 'Analytics'},
    { href: `/forms/${formId}/settings`, icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <BackButton href="/forms" label="All forms" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight">{f.name}</h1>
            <Badge className={STATUS_COLORS[f.status]}>{f.status}</Badge>
          </div>
          {f.description && <p className="text-muted-foreground text-sm">{f.description}</p>}
          {lastEntry && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last entry {timeAgo(lastEntry.entered_at)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FormDetailActions formId={formId} status={f.status} subdomain={f.subdomain} isPro={isPro} />
          <Link href={`/forms/${formId}/draw`}>
            <Button size="sm" className="gap-1.5">
              <Dice5 className="w-3.5 h-3.5" />
              Draw
            </Button>
          </Link>
        </div>
      </div>

      {/* Share */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Share Link</p>
        <SharePanel subdomain={f.subdomain} formName={f.name} isPro={isPro} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Inline ad — mobile/tablet only, free plan only */}
      <div className="2xl:hidden">
        <AdBanner plan={isPro ? 'pro' : 'free'} />
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {quickLinks.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="border hover:border-foreground/40 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Accent preview */}
      <div className="border rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: f.accent_color }} />
        <div>
          <p className="text-sm font-medium">{f.template} template · {f.draw_theme} draw</p>
          <p className="text-xs text-muted-foreground">{f.accent_color} · {f.fields.length} fields</p>
        </div>
      </div>
    </div>
  )
}
