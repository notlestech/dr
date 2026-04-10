'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Form { id: string; name: string; accent_color: string; status: string; subdomain: string }

interface Props {
  form: Form
  initialCount: number
}

export function StreamOverlayClient({ form, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)
  const [recentNames, setRecentNames] = useState<string[]>([])
  const accent = form.accent_color

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`stream:${form.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'entries',
        filter: `form_id=eq.${form.id}`,
      }, (payload) => {
        setCount(c => c + 1)
        const entry = payload.new as Record<string, unknown>
        const data = entry.data as Record<string, string>
        const name = Object.values(data)[0] ?? 'Anonymous'
        setRecentNames(prev => [name, ...prev].slice(0, 5))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [form.id])

  return (
    <div
      className="min-h-screen flex items-end p-6"
      style={{ background: 'transparent' }}
    >
      {/* OBS overlay widget — bottom-left */}
      <div
        className="flex flex-col gap-2"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Entry counter */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm"
          style={{
            background: 'rgba(9,9,11,0.85)',
            border: `1px solid ${accent}40`,
          }}
        >
          <Users className="w-5 h-5" style={{ color: accent }} />
          <span className="text-2xl font-bold text-white tabular-nums">
            {formatNumber(count)}
          </span>
          <span className="text-sm text-zinc-400">entries</span>
        </div>

        {/* Form name */}
        <div
          className="px-3 py-1 rounded-lg text-sm font-medium"
          style={{
            background: `${accent}20`,
            border: `1px solid ${accent}30`,
            color: accent,
          }}
        >
          {form.name}
        </div>

        {/* Recent names ticker */}
        {recentNames.length > 0 && (
          <div
            className="px-3 py-2 rounded-lg text-xs space-y-0.5"
            style={{ background: 'rgba(9,9,11,0.75)' }}
          >
            {recentNames.map((name, i) => (
              <div key={i} className="text-zinc-300 animate-in fade-in slide-in-from-left-2 duration-300">
                + {name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
