import { createClient } from '@supabase/supabase-js'
import { StreamOverlayClient } from './stream-client'

interface Props { params: Promise<{ subdomain: string }> }

function getSupabase() {
  return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export const revalidate = 0

export default async function StreamPage({ params }: Props) {
  const { subdomain } = await params

  const { data: form } = await getSupabase()
    .from('forms')
    .select('id, name, accent_color, status, subdomain')
    .eq('subdomain', subdomain)
    .single()

  if (!form) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-zinc-500">Form not found: {subdomain}</p>
      </div>
    )
  }

  const { count: entryCount } = await getSupabase()
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', form.id)
    .eq('flagged', false)

  return <StreamOverlayClient form={form} initialCount={entryCount ?? 0} />
}
