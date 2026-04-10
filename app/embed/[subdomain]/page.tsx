import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PublicFormClient } from '@/app/f/[subdomain]/public-form-client'
import type { PublicForm } from '@/types/app'

interface Props { params: Promise<{ subdomain: string }> }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export const revalidate = 60

export default async function EmbedPage({ params }: Props) {
  const { subdomain } = await params

  const { data: form } = await supabase
    .from('forms')
    .select('id, name, description, subdomain, template, draw_theme, accent_color, logo_url, fields, status, max_entries, require_captcha, social_sharing, show_entry_count, winners_page, raffle_type, starts_at, ends_at, embed_enabled')
    .eq('subdomain', subdomain)
    .single()

  if (!form || !form.embed_enabled) notFound()

  const { count: entryCount } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', form.id)

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <PublicFormClient form={form as PublicForm} initialEntryCount={entryCount ?? 0} embedded />
    </div>
  )
}
