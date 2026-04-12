'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Download, Flag, Trophy, Search, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Form, Entry } from '@/types/app'

const PAGE_SIZE = 100

interface Props {
  form: Form
  entries: Entry[]
  totalCount?: number
}

export function EntriesTable({ form, entries: initial, totalCount }: Props) {
  const [entries, setEntries] = useState(initial)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = entries.filter(e => {
    if (!search) return true
    const vals = Object.values(e.data).join(' ').toLowerCase()
    return vals.includes(search.toLowerCase())
  })

  // Paginate the filtered list
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when search changes
  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }

  async function flag(entry: Entry) {
    // Optimistic update
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, flagged: !e.flagged } : e))
    const supabase = createClient()
    const { error } = await supabase.from('entries').update({ flagged: !entry.flagged }).eq('id', entry.id)
    if (error) {
      // Rollback on failure
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, flagged: entry.flagged } : e))
      toast.error(error.message)
      return
    }
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
    const isPartial = totalCount !== undefined && totalCount > entries.length
    toast.success(
      isPartial
        ? `Exported ${filtered.length.toLocaleString()} entries (first ${entries.length.toLocaleString()} of ${totalCount!.toLocaleString()} total)`
        : `Exported ${filtered.length.toLocaleString()} entries`
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search entries..."
            className="pl-9 text-sm"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={form.fields.length + 3} className="px-4 py-12 text-center">
                    {search ? (
                      <p className="text-muted-foreground text-sm">No entries match your search</p>
                    ) : (
                      <div className="space-y-3">
                        <Share2 className="w-8 h-8 text-muted-foreground/40 mx-auto" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium text-foreground">No entries yet</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Share your form to start collecting entries
                          </p>
                        </div>
                        <a
                          href={`/forms/${form.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4 hover:no-underline text-foreground"
                        >
                          <Share2 className="w-3 h-3" aria-hidden="true" />
                          Go to sharing options
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ) : paginated.map(e => (
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
                      {e.is_winner && (
                        <>
                          <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" aria-hidden="true" />
                          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Winner</span>
                        </>
                      )}
                      {e.flagged && !e.is_winner && (
                        <>
                          <Flag className="w-3.5 h-3.5 text-destructive shrink-0" aria-hidden="true" />
                          <span className="text-xs font-medium text-destructive">Flagged</span>
                        </>
                      )}
                      {!e.is_winner && !e.flagged && (
                        <span className="text-xs text-muted-foreground capitalize">{e.status}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(e.entered_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => flag(e)}
                      className={`transition-colors ${e.flagged ? 'text-destructive hover:text-muted-foreground' : 'text-muted-foreground hover:text-destructive'}`}
                      aria-label={e.flagged ? 'Unflag entry' : 'Flag entry'}
                      title={e.flagged ? 'Unflag' : 'Flag'}
                    >
                      <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: count + pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {search
            ? `${filtered.length} matching${totalCount && totalCount > entries.length ? ` (of ${totalCount.toLocaleString()} total)` : ''}`
            : `${(totalCount ?? entries.length).toLocaleString()} entries`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-1">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
