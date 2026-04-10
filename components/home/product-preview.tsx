'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const REEL_NAMES = [
  'Alex_Gaming', 'StreamQueen', 'ProPlayer99', 'NightWolf',
  'PixelHero', 'StarBurst', 'CodeMaster', 'VoidRaider',
]
// Duplicated for seamless CSS loop
const REEL_ITEMS = [...REEL_NAMES, ...REEL_NAMES]

export function ProductPreview() {
  const [tab, setTab] = useState<'dashboard' | 'draw'>('dashboard')

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
        <div className="flex gap-1.5 shrink-0">
          <div className="size-2.5 rounded-full bg-border" />
          <div className="size-2.5 rounded-full bg-border" />
          <div className="size-2.5 rounded-full bg-border" />
        </div>
        {/* Tab bar inside address bar area */}
        <div className="flex-1 flex items-center gap-1 bg-background border rounded-md px-1.5 py-1 min-w-0">
          <button
            onClick={() => setTab('dashboard')}
            className={cn(
              'rounded px-2.5 py-0.5 text-xs font-medium transition-colors',
              tab === 'dashboard'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab('draw')}
            className={cn(
              'rounded px-2.5 py-0.5 text-xs font-medium transition-colors flex items-center gap-1.5',
              tab === 'draw'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            Live Draw
          </button>
        </div>
      </div>

      {/* Dashboard tab */}
      {tab === 'dashboard' && (
        <div className="p-6 grid gap-4">
          <div className="grid grid-cols-4 gap-3">
            {[['3', 'Forms'], ['1,247', 'Entries'], ['2', 'Active'], ['5', 'Winners']].map(([n, l]) => (
              <div key={l} className="rounded-xl border bg-muted/30 p-3 text-center">
                <p className="text-lg font-bold">{n}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Summer Giveaway 🎉', status: 'active', entries: '847' },
              { name: 'Early Access Waitlist', status: 'active', entries: '400' },
              { name: 'Gaming Tournament', status: 'draft', entries: '0' },
            ].map((form) => (
              <div key={form.name} className="rounded-xl border overflow-hidden">
                <div className={`h-1 ${form.status === 'active' ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                <div className="p-3">
                  <p className="text-xs font-medium truncate">{form.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block border ${form.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {form.status}
                    </span>
                    {form.entries !== '0' && (
                      <span className="text-[10px] text-muted-foreground">{form.entries} entries</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Mini bar chart */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-[11px] font-medium text-muted-foreground mb-3">Entries this week</p>
            <div className="flex items-end gap-1.5 h-10">
              {[30, 55, 40, 80, 65, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-foreground/20 transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Draw tab */}
      {tab === 'draw' && (
        <div className="p-8 flex flex-col items-center gap-5">
          <div className="text-center">
            <p className="text-sm font-semibold">Summer Giveaway 🎉</p>
            <p className="text-xs text-muted-foreground mt-0.5">1,247 eligible entries</p>
          </div>

          {/* Slot reel */}
          <div className="w-72 rounded-xl border-2 border-foreground/15 overflow-hidden relative h-14 bg-muted/20 shadow-inner">
            {/* Top + bottom fades */}
            <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
            {/* Active row highlight */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-9 border-y border-foreground/10 bg-foreground/[0.04] pointer-events-none z-[5]" />
            {/* Spinning names */}
            <div className="animate-reel">
              {REEL_ITEMS.map((name, i) => (
                <div key={i} className="h-14 flex items-center justify-center">
                  <span className="text-sm font-semibold tracking-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted-foreground">Drawing in progress&hellip;</p>
          </div>

          <div className="w-72 rounded-xl border bg-muted/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Last winner</p>
            <p className="text-sm font-semibold">TwitchLegend_99</p>
          </div>
        </div>
      )}
    </div>
  )
}
