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

  // Get daily entry counts for the past 30 days
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: entries } = await supabase
    .from('entries')
    .select('entered_at, source, status')
    .eq('form_id', formId)
    .gte('entered_at', since.toISOString())

  // Aggregate by day
  const dayMap: Record<string, number> = {}
  for (const e of entries ?? []) {
    const day = e.entered_at.slice(0, 10)
    dayMap[day] = (dayMap[day] ?? 0) + 1
  }

  const chartData = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  const sources = (entries ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{f.name} · Last 30 days</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total (30d)</p>
          <p className="text-2xl font-bold text-foreground">{(entries ?? []).length}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Peak Day</p>
          <p className="text-2xl font-bold text-foreground">
            {chartData.length ? Math.max(...chartData.map(d => d.count)) : 0}
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg / Day</p>
          <p className="text-2xl font-bold text-foreground">
            {chartData.length ? Math.round((entries ?? []).length / 30) : 0}
          </p>
        </div>
      </div>

      {/* Simple bar chart using inline divs */}
      {chartData.length > 0 ? (
        <div className="border rounded-xl p-6">
          <p className="text-sm font-medium text-foreground mb-4">Entries per day</p>
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

      {/* Sources breakdown */}
      <div className="border rounded-xl p-6">
        <p className="text-sm font-medium text-foreground mb-4">Entry Sources</p>
        <div className="space-y-2">
          {Object.entries(sources).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground capitalize">{source}</span>
              <span className="text-sm font-medium text-foreground">{count}</span>
            </div>
          ))}
          {Object.keys(sources).length === 0 && (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </div>
      </div>
    </div>
  )
}
