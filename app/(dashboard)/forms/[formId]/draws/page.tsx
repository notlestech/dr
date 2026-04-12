import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/dashboard/back-button'
import { Trophy, Clock, User } from 'lucide-react'
import type { Form, Entry, Draw } from '@/types/app'

interface Props { params: Promise<{ formId: string }> }

export async function generateMetadata({ params }: Props) {
  return { title: 'Draw History' }
}

export default async function DrawsHistoryPage({ params }: Props) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase
    .from('forms')
    .select('id, name, accent_color, subdomain, winners_page')
    .eq('id', formId)
    .single()

  if (!form) notFound()

  const f = form as Pick<Form, 'id' | 'name' | 'accent_color' | 'subdomain' | 'winners_page'>

  // Draws newest first
  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .eq('form_id', formId)
    .order('drawn_at', { ascending: false })

  // All winner entries for this form
  const { data: winnerEntries } = await supabase
    .from('entries')
    .select('id, data, draw_id, entered_at')
    .eq('form_id', formId)
    .eq('is_winner', true)

  // Index entries by draw_id for quick lookup
  const byDraw = new Map<string, (typeof winnerEntries extends (infer T)[] | null ? T : never)[]>()
  for (const e of winnerEntries ?? []) {
    if (!e.draw_id) continue
    const arr = byDraw.get(e.draw_id) ?? []
    arr.push(e)
    byDraw.set(e.draw_id, arr)
  }

  const drawList = (draws ?? []) as Draw[]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <BackButton href={`/forms/${formId}`} label={f.name} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Draw History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {drawList.length} draw{drawList.length !== 1 ? 's' : ''} run for {f.name}
          </p>
        </div>
        {f.winners_page && (
          <a
            href={`/winners/${f.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Public winners page ↗
          </a>
        )}
      </div>

      {drawList.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center space-y-3">
          <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No draws yet</p>
          <p className="text-xs text-muted-foreground">
            Run your first draw to see results here.
          </p>
          <Link
            href={`/forms/${formId}/draw`}
            className="inline-block text-xs font-medium underline underline-offset-4 hover:no-underline"
          >
            Go to draw page
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drawList.map((draw, idx) => {
            const winners = byDraw.get(draw.id) ?? []
            return (
              <div key={draw.id} className="border rounded-xl p-5 space-y-3">
                {/* Draw header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: f.accent_color + '20', color: f.accent_color }}
                    >
                      {drawList.length - idx}
                    </div>
                    <span className="text-sm font-medium">Draw #{drawList.length - idx}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {new Date(draw.drawn_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Winners */}
                {winners.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-9">No winner recorded for this draw.</p>
                ) : (
                  <div className="space-y-2 pl-9">
                    {winners.map(entry => {
                      const data = entry.data as Record<string, string>
                      const displayName = data.name || data.email || Object.values(data)[0] || 'Unknown'
                      return (
                        <div key={entry.id} className="flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" aria-hidden="true" />
                          <span className="text-sm font-medium">{displayName}</span>
                          {data.email && displayName !== data.email && (
                            <span className="text-xs text-muted-foreground">{data.email}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
