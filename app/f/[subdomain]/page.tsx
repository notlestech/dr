import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PublicFormClient } from './public-form-client'
import type { PublicForm } from '@/types/app'
import type { Metadata } from 'next'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params
  const { data: form } = await getSupabase().from('forms').select('name, description').eq('subdomain', subdomain).single()
  return {
    title: form?.name ?? 'Enter the Draw',
    description: form?.description ?? 'Enter for a chance to win.',
    openGraph: {
      images: [`/api/og?subdomain=${subdomain}`],
    },
  }
}

export default async function PublicFormPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params

  const { data: form } = await supabase
    .from('forms')
    .select('id, name, description, subdomain, template, draw_theme, accent_color, logo_url, fields, status, max_entries, require_captcha, social_sharing, show_entry_count, winners_page, raffle_type, starts_at, ends_at')
    .eq('subdomain', subdomain)
    .single()

  if (!form) notFound()

  // Get live entry count
  const { count: entryCount } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', form.id)
    .eq('status', 'confirmed')

  return (
    <PublicFormClient
      form={form as PublicForm}
      initialEntryCount={entryCount ?? 0}
    />
  )
}
