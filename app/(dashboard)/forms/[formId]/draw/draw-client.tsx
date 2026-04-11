'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trophy, Maximize, RotateCcw, Save, Users, Shuffle, Loader2, CheckCircle2, ArrowLeft, RotateCw, CreditCard, Dice5, Lock } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Entry { id: string; displayName: string }
interface Form  { id: string; name: string; accent_color: string; draw_theme: string; status: string; subdomain: string }
interface Props  { form: Form; entries: Entry[]; userId: string; isPro: boolean }

const DRAW_THEMES = [
  { id: 'slot',  label: 'Slot',  icon: Shuffle,    free: true  },
  { id: 'wheel', label: 'Wheel', icon: RotateCw,   free: false },
  { id: 'cards', label: 'Cards', icon: CreditCard, free: false },
  { id: 'dice',  label: 'Dice',  icon: Dice5,      free: false },
] as const

const ITEM_H = 72

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function DrawClient({ form, entries: initialEntries, userId, isPro }: Props) {
  const router               = useRouter()
  const [entries]            = useState(initialEntries)
  const [drawTheme, setDrawTheme] = useState(form.draw_theme ?? 'slot')
  const [phase, setPhase]    = useState<'idle' | 'spinning' | 'revealed' | 'saved'>('idle')
  const [winner, setWinner]  = useState<Entry | null>(null)
  const [saving, setSaving]  = useState(false)
  const containerRef         = useRef<HTMLDivElement>(null)
  const accent               = form.accent_color

  const [spinKey, setSpinKey]     = useState(0)
  const [reelItems, setReelItems] = useState<Entry[]>([])
  const [targetY, setTargetY]     = useState(0)
  const pendingWinner             = useRef<Entry | null>(null)

  const spin = useCallback(() => {
    if (phase === 'spinning' || entries.length === 0) return

    const selectedWinner = fisherYates(entries)[0]
    pendingWinner.current = selectedWinner

    const padding = entries.length < 5 ? 6 : 3
    const reel: Entry[] = []
    for (let i = 0; i < padding; i++) reel.push(...fisherYates(entries))
    reel.push(selectedWinner)

    const ty = -((reel.length - 1) * ITEM_H)

    setReelItems(reel)
    setTargetY(ty)
    setWinner(null)
    setPhase('spinning')
    setSpinKey(k => k + 1)
  }, [entries, phase])

  function onSpinComplete() {
    const w = pendingWinner.current
    if (!w) return
    setWinner(w)
    setPhase('revealed')
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 180, spread: 110, origin: { y: 0.55 }, colors: [accent, '#ffffff', accent + 'aa'] })
    })
  }

  async function saveDraw() {
    if (!winner) return
    setSaving(true)
    const supabase = createClient()

    const { data: draw, error } = await supabase
      .from('draws')
      .insert({ form_id: form.id, drawn_by: userId, winner_count: 1 })
      .select()
      .single()

    if (error) { toast.error('Failed to save draw'); setSaving(false); return }

    await supabase.from('entries').update({ is_winner: true, draw_id: draw.id }).eq('id', winner.id)

    toast.success(`${winner.displayName} saved as winner`)
    setPhase('saved')
    setSaving(false)
  }

  function reset() {
    setPhase('idle')
    setWinner(null)
    setReelItems([])
    pendingWinner.current = null
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (!document.fullscreenElement) containerRef.current.requestFullscreen()
    else document.exitFullscreen()
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/forms/${form.id}`)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
          <div className="w-px h-5 bg-border" />
          <div>
            <h1 className="text-base sm:text-xl font-semibold leading-tight">{form.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatNumber(entries.length)} entries</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {DRAW_THEMES.map(theme => {
            const Icon = theme.icon
            const locked = !theme.free && !isPro
            const active = drawTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => !locked && setDrawTheme(theme.id)}
                title={locked ? `${theme.label} (Pro)` : theme.label}
                className={cn(
                  'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  active
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  locked && 'opacity-50 cursor-not-allowed'
                )}
                style={active ? { backgroundColor: accent } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{theme.label}</span>
                {locked && <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1" />}
              </button>
            )
          })}
        </div>
        <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Draw area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10">

        {entries.length === 0 ? (
          <div className="text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">Share your form to start collecting entries.</p>
          </div>
        ) : (
          <>
            {/* Slot machine */}
            <div
              className="w-full max-w-md rounded-2xl border-2 overflow-hidden relative select-none"
              style={{ borderColor: accent + '50' }}
            >
              <div className="absolute top-0 inset-x-0 h-20 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, var(--background) 0%, transparent 100%)' }} />
              <div className="absolute bottom-0 inset-x-0 h-20 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)' }} />
              <div
                className="absolute inset-x-0 z-20 pointer-events-none border-y-2"
                style={{ top: `calc(50% - ${ITEM_H / 2}px)`, height: ITEM_H, borderColor: accent, background: accent + '12', boxShadow: `0 0 24px 0 ${accent}30` }}
              />

              <div className="h-[360px] overflow-hidden relative" style={{ background: accent + '06' }}>
                {phase === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-xl font-semibold text-muted-foreground">Ready to draw</p>
                  </div>
                )}

                {reelItems.length > 0 && (
                  <motion.div
                    key={spinKey}
                    initial={{ y: 0 }}
                    animate={{ y: targetY }}
                    transition={{ duration: 4.8, ease: [0.12, 0.0, 0.08, 1.0] }}
                    onAnimationComplete={onSpinComplete}
                  >
                    {reelItems.map((entry, i) => {
                      const isLast = i === reelItems.length - 1
                      return (
                        <div
                          key={`${entry.id}-${i}`}
                          className="flex items-center justify-center px-6 font-semibold text-xl truncate"
                          style={{ height: ITEM_H, color: isLast ? accent : undefined, opacity: isLast ? 1 : 0.55 }}
                        >
                          {entry.displayName}
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Winner reveal */}
            <AnimatePresence>
              {(phase === 'revealed' || phase === 'saved') && winner && (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, scale: 0.85, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="text-center space-y-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                    <span className="text-sm font-semibold uppercase tracking-widest text-yellow-500">Winner</span>
                  </div>
                  <p className="text-4xl font-bold tracking-tight">{winner.displayName}</p>
                  {phase === 'saved' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-1.5 text-sm text-emerald-500 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Saved to draw history
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div
                  key="btn-draw"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <motion.button
                    onClick={spin}
                    disabled={entries.length === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="h-14 px-12 text-lg font-bold rounded-2xl text-white shadow-lg cursor-pointer disabled:opacity-40 flex items-center gap-3"
                    style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
                  >
                    <Shuffle className="w-5 h-5" />
                    Draw Now
                  </motion.button>
                </motion.div>
              )}

              {phase === 'spinning' && (
                <motion.div
                  key="btn-spinning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-14 px-12 text-lg font-semibold rounded-2xl text-white flex items-center gap-3"
                  style={{ backgroundColor: accent + '80' }}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="inline-flex"
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.span>
                  Drawing…
                </motion.div>
              )}

              {(phase === 'revealed' || phase === 'saved') && (
                <motion.div
                  key="btn-revealed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Button variant="outline" size="lg" onClick={reset} className="h-12 gap-2">
                    <RotateCcw className="w-4 h-4" /> Draw Again
                  </Button>
                  {phase === 'revealed' && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        size="lg"
                        onClick={saveDraw}
                        disabled={saving}
                        className="h-12 gap-2 text-white"
                        style={{ backgroundColor: accent }}
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving…' : 'Save Winner'}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
