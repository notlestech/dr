import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Form } from '@/types/app'

interface Props { params: Promise<{ formId: string }> }

export default async function AnalyticsPage({ params }: Props) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase.from('forms').select('*').eq('id', formId).single()
  if (!form) notFound()

  const f = form as Form

  // Last-30-days entries (with source)
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [
    { data: recentEntries },
    { count: allTimeCount },
    { count: winnerCount },
  ] = await Promise.all([
    supabase
      .from('entries')
      .select('entered_at, source')
      .eq('form_id', formId)
      .gte('entered_at', since.toISOString()),
    supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId),
    supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('is_winner', true),
  ])

  // Aggregate by day
  const dayMap: Record<string, number> = {}
  for (const e of recentEntries ?? []) {
    const day = e.entered_at.slice(0, 10)
    dayMap[day] = (dayMap[day] ?? 0) + 1
  }

  const chartData = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  const sources = (recentEntries ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1
    return acc
  }, {})

  const totalRecent = (recentEntries ?? []).length
  const peakDay = chartData.length ? Math.max(...chartData.map(d => d.count)) : 0
  const avgPerDay = chartData.length ? Math.round(totalRecent / 30) : 0
  const maxSourceCount = Math.max(1, ...Object.values(sources))

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{f.name} · Last 30 days</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">All-time entries</p>
          <p className="text-2xl font-bold text-foreground">{(allTimeCount ?? 0).toLocaleString()}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Last 30 days</p>
          <p className="text-2xl font-bold text-foreground">{totalRecent.toLocaleString()}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Peak day</p>
          <p className="text-2xl font-bold text-foreground">{peakDay}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg / day</p>
          <p className="text-2xl font-bold text-foreground">{avgPerDay}</p>
        </div>
      </div>

      {/* Winners stat */}
      {(winnerCount ?? 0) > 0 && (
        <div className="border rounded-xl p-4 flex items-center gap-4">
          <div className="size-9 rounded-full flex items-center justify-center text-yellow-500 bg-yellow-500/10 text-lg shrink-0">
            🏆
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{(winnerCount ?? 0).toLocaleString()} winner{(winnerCount ?? 0) !== 1 ? 's' : ''} drawn</p>
            <p className="text-xs text-muted-foreground">
              {allTimeCount ? `${((winnerCount ?? 0) / allTimeCount * 100).toFixed(1)}% of all entries won` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 ? (
        <div className="border rounded-xl p-6">
          <p className="text-sm font-medium text-foreground mb-4">Entries per day (last 30 days)</p>
          <div className="flex items-end gap-1 h-32">
            {chartData.map(({ date, count }) => {
              const max = Math.max(...chartData.map(d => d.count))
              const pct = max > 0 ? (count / max) * 100 : 0
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group" title={`${date}: ${count}`}>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{ height: `${pct}%`, backgroundColor: f.accent_color, minHeight: 2 }}
                  />
                  <span className="text-[9px] text-muted-foreground rotate-45 hidden group-hover:block">{date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No entries in the last 30 days</p>
        </div>
      )}

      {/* Sources breakdown with percentage bars */}
      <div className="border rounded-xl p-6">
        <p className="text-sm font-medium text-foreground mb-4">Entry Sources (last 30 days)</p>
        {Object.keys(sources).length === 0 ? (
          <p className="text-sm text-muted-foreground">No data</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(sources)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => {
                const pct = Math.round((count / totalRecent) * 100)
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-foreground">{source}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {count.toLocaleString()} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(count / maxSourceCount) * 100}%`,
                          backgroundColor: f.accent_color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
