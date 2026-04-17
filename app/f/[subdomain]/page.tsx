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
  const { data: form } = await getSupabase().from('forms').select('name, description').eq('subdomain', subdomain).neq('status', 'draft').single()
  const title = form?.name ?? 'Enter the Draw'
  const description = form?.description ?? 'Enter for a chance to win.'
  const ogImage = `/api/og?subdomain=${subdomain}`
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PublicFormPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params

  const { data: form } = await getSupabase()
    .from('forms')
    .select('id, name, description, subdomain, template, draw_theme, accent_color, logo_url, fields, status, max_entries, require_captcha, social_sharing, show_entry_count, winners_page, raffle_type, starts_at, ends_at')
    .eq('subdomain', subdomain)
    .neq('status', 'draft')   // drafts are not publicly visible
    .single()

  if (!form) notFound()

  // Get live entry count
  const { count: entryCount } = await getSupabase()
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
