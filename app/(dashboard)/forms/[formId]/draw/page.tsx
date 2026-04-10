import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DrawClient } from './draw-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Live Draw' }

export default async function DrawPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  const { data: subscription } = membership
    ? await supabase
        .from('subscriptions')
        .select('status')
        .eq('workspace_id', membership.workspace_id)
        .eq('status', 'active')
        .maybeSingle()
    : { data: null }

  const isPro = !!subscription

  const { data: form } = await supabase
    .from('forms')
    .select('id, name, accent_color, draw_theme, status, subdomain')
    .eq('id', formId)
    .single()

  if (!form) notFound()

  // Fetch all confirmed, non-flagged entries
  const { data: entries } = await supabase
    .from('entries')
    .select('id, data')
    .eq('form_id', formId)
    .eq('status', 'confirmed')
    .eq('flagged', false)
    .eq('is_winner', false)

  const formattedEntries = (entries ?? []).map(e => ({
    id: e.id,
    displayName: (e.data as Record<string, string>).name || (e.data as Record<string, string>).email || 'Anonymous',
  }))

  return (
    <DrawClient
      form={form}
      entries={formattedEntries}
      userId={user.id}
      isPro={isPro}
    />
  )
}
