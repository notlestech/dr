import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HomeContent } from '@/components/home/home-content'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>
}) {
  const { code, next } = await searchParams
  if (code) {
    const nextPath = next ?? '/dashboard'
    redirect(`/auth/callback?code=${code}&next=${encodeURIComponent(nextPath)}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <HomeContent isLoggedIn={!!user} />
}
