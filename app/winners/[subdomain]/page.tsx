import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Trophy } from 'lucide-react'
import type { Form, Entry, Draw } from '@/types/app'

interface Props { params: Promise<{ subdomain: string }> }

function getSupabase() {
  return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export const revalidate = 60

export default async function WinnersPage({ params }: Props) {
  const { subdomain } = await params

  const { data: form } = await getSupabase()
    .from('forms')
    .select('id, name, accent_color, winners_page, logo_url, template')
    .eq('subdomain', subdomain)
    .single()

  if (!form || !form.winners_page) notFound()

  const { data: draws } = await getSupabase()
    .from('draws')
    .select('*')
    .eq('form_id', form.id)
    .order('drawn_at', { ascending: false })

  const { data: winners } = await getSupabase()
    .from('entries')
    .select('*')
    .eq('form_id', form.id)
    .eq('is_winner', true)
    .order('entered_at', { ascending: false })

  const accent = form.accent_color

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-800" style={{ borderColor: accent + '20' }}>
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-3">
          {form.logo_url && (
            <Image
              src={form.logo_url}
              alt={`${form.name} logo`}
              width={40}
              height={40}
              className="rounded-lg object-contain"
              unoptimized={form.logo_url.startsWith('http')}
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-50">{form.name}</h1>
            <p className="text-sm text-zinc-500">Winners</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Summary */}
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-1 text-center">
            <p className="text-2xl font-bold text-zinc-50">{(draws ?? []).length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Draws</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-1 text-center">
            <p className="text-2xl font-bold text-zinc-50">{(winners ?? []).length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Total Winners</p>
          </div>
        </div>

        {/* Winner list */}
        {(winners ?? []).length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No draws have been run yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Draw History</h2>
            {(winners ?? []).map((entry: Entry, i: number) => {
              const d = entry.data as Record<string, string>
              const displayName = d.name || d.full_name || d.email || Object.values(d)[0] || 'Winner'
              return (
                <div
                  key={entry.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: accent + '20', color: accent }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-50 truncate">{displayName}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(entry.entered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <Trophy className="w-4 h-4 shrink-0" style={{ color: accent }} />
                </div>
              )
            })}
          </div>
        )}

        {/* Powered by */}
        <div className="text-center pt-4">
          <p className="text-xs text-zinc-700">Powered by DrawVault</p>
        </div>
      </div>
    </div>
  )
}
