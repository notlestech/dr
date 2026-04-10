'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Download, Flag, Trophy, Search, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Form, Entry } from '@/types/app'

interface Props {
  form: Form
  entries: Entry[]
}

export function EntriesTable({ form, entries: initial }: Props) {
  const [entries, setEntries] = useState(initial)
  const [search, setSearch] = useState('')

  const filtered = entries.filter(e => {
    if (!search) return true
    const vals = Object.values(e.data).join(' ').toLowerCase()
    return vals.includes(search.toLowerCase())
  })

  async function flag(entry: Entry) {
    const supabase = createClient()
    const { error } = await supabase.from('entries').update({ flagged: !entry.flagged }).eq('id', entry.id)
    if (error) { toast.error(error.message); return }
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, flagged: !e.flagged } : e))
    toast.success(entry.flagged ? 'Entry unflagged' : 'Entry flagged')
  }

  function exportCsv() {
    const rows = [
      ['ID', ...form.fields.map(f => f.label), 'Source', 'Status', 'Winner', 'Entered At'],
      ...filtered.map(e => [
        e.id,
        ...form.fields.map(f => e.data[f.id] ?? ''),
        e.source,
        e.status,
        e.is_winner ? 'yes' : 'no',
        e.entered_at,
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.subdomain}-entries.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="pl-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5 ml-auto">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                {form.fields.map(f => (
                  <th key={f.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entered</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={form.fields.length + 3} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    {search ? 'No entries match your search' : 'No entries yet'}
                  </td>
                </tr>
              ) : filtered.map(e => (
                <tr
                  key={e.id}
                  className={`hover:bg-muted/30 transition-colors ${e.flagged ? 'opacity-50' : ''}`}
                >
                  {form.fields.map(f => (
                    <td key={f.id} className="px-4 py-3 text-foreground max-w-[180px] truncate">
                      {e.data[f.id] ?? '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {e.is_winner && <Trophy className="w-3.5 h-3.5 text-yellow-500" />}
                      {e.flagged && <Flag className="w-3.5 h-3.5 text-destructive" />}
                      {!e.is_winner && !e.flagged && (
                        <span className="text-xs text-muted-foreground">{e.status}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(e.entered_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => flag(e)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={e.flagged ? 'Unflag' : 'Flag'}
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} entries{search ? ` (filtered from ${entries.length})` : ''}
      </p>
    </div>
  )
}
