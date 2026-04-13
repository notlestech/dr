import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntriesTable } from '@/components/entries/entries-table'
import { AdBanner } from '@/components/dashboard/ad-banner'
import type { Form, Entry, Plan } from '@/types/app'

interface Props { params: Promise<{ formId: string }> }

export default async function EntriesPage({ params }: Props) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase.from('forms').select('*').eq('id', formId).single()
  if (!form) notFound()

  const { data: membership } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
  const { data: sub } = membership
    ? await supabase.from('subscriptions').select('plan').eq('workspace_id', membership.workspace_id).maybeSingle()
    : { data: null }
  const plan = (sub?.plan ?? 'free') as Plan

  const { data: entries, count: totalCount } = await supabase
    .from('entries')
    .select('*', { count: 'exact' })
    .eq('form_id', formId)
    .order('entered_at', { ascending: false })
    .limit(5000)

  const total = totalCount ?? (entries ?? []).length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entries</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total.toLocaleString()} entries for {(form as Form).name}</p>
      </div>
      {/* Inline ad — mobile/tablet only, free plan only */}
      <div className="2xl:hidden">
        <AdBanner plan={plan} />
      </div>
      <EntriesTable form={form as Form} entries={(entries ?? []) as Entry[]} totalCount={total} />
    </div>
  )
}
