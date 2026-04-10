'use client'

import { cn } from '@/lib/utils'
import { FORM_TEMPLATES, PLAN_LIMITS } from '@/types/app'
import type { FormWizardValues } from '@/lib/validations/form'
import { RAFFLE_TYPE_PRESETS } from '@/lib/validations/form'
import { Check, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateSubdomain } from '@/lib/utils'

interface Props {
  values: FormWizardValues
  update: (payload: Partial<FormWizardValues>) => void
}

const RAFFLE_TYPES = [
  { id: 'giveaway',    label: '🎁 Giveaway',     desc: 'Prize draw' },
  { id: 'earlyaccess', label: '🚀 Early Access',  desc: 'Waitlist' },
  { id: 'contest',     label: '🏆 Contest',       desc: 'Submission' },
  { id: 'internal',    label: '🏢 Internal',      desc: 'Team draw' },
] as const

// For demo — in real app read from subscription context
const userPlan = 'free'

export function StepTemplate({ values, update }: Props) {
  const allowedTemplates = PLAN_LIMITS[userPlan].templates

  function selectRaffleType(type: typeof values.raffle_type) {
    const preset = RAFFLE_TYPE_PRESETS[type]
    update({
      raffle_type: type,
      name: values.name || preset.name,
      description: values.description || preset.description,
      fields: preset.fields.map(f => ({ ...f, id: f.id + '_' + Date.now() })),
    })
  }

  function handleNameChange(name: string) {
    update({ name, subdomain: values.subdomain || generateSubdomain(name) })
  }

  return (
    <div className="space-y-8">
      {/* Raffle type */}
      <div>
        <h2 className="text-lg font-semibold mb-1">What type of raffle is this?</h2>
        <p className="text-sm text-muted-foreground mb-4">This pre-fills your form with the right fields.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RAFFLE_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => selectRaffleType(t.id)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                values.raffle_type === t.id
                  ? 'border-foreground bg-foreground/5 text-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              )}
            >
              <div className="text-lg mb-1">{t.label.split(' ')[0]}</div>
              <div className="text-xs font-medium">{t.label.split(' ').slice(1).join(' ')}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Basics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic info</h2>
        <div>
          <Label className="mb-1.5 block">Form name <span className="text-destructive">*</span></Label>
          <Input
            value={values.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Summer Giveaway 🎉"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            value={values.description ?? ''}
            onChange={e => update({ description: e.target.value })}
            placeholder="Tell entrants what they can win..."
            rows={2}
            className="resize-none"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Subdomain <span className="text-destructive">*</span></Label>
          <div className="flex items-center">
            <Input
              value={values.subdomain}
              onChange={e => update({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="my-giveaway"
              className="rounded-r-none"
            />
            <span className="px-3 py-2 bg-muted border border-l-0 border-input text-muted-foreground text-sm rounded-r-lg whitespace-nowrap">
              .drawvault.site
            </span>
          </div>
          {values.subdomain && (
            <p className="text-xs text-muted-foreground mt-1">
              Public URL: <span className="text-foreground font-medium">{values.subdomain}.drawvault.site</span>
            </p>
          )}
        </div>
      </div>

      {/* Template picker */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Choose a design</h2>
        <p className="text-sm text-muted-foreground mb-4">Pick a template for your public entry form.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FORM_TEMPLATES.map(tmpl => {
            const locked = !allowedTemplates.includes(tmpl.id)
            return (
              <button
                key={tmpl.id}
                onClick={() => !locked && update({ template: tmpl.id })}
                className={cn(
                  'relative p-4 rounded-xl border text-left transition-all',
                  values.template === tmpl.id && !locked
                    ? 'border-foreground bg-foreground/5'
                    : locked
                    ? 'border-border bg-muted/20 opacity-60 cursor-not-allowed'
                    : 'border-border bg-card hover:border-foreground/40'
                )}
              >
                {/* Mini visual preview */}
                <TemplateThumbnail id={tmpl.id} accent={values.accent_color} />

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{tmpl.name}</span>
                    {locked && (
                      <span className="flex items-center gap-0.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium border">
                        <Lock className="w-2.5 h-2.5" /> Pro
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{tmpl.description}</p>
                </div>

                {values.template === tmpl.id && !locked && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-background" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Small visual thumbnail per template type
function TemplateThumbnail({ id, accent }: { id: string; accent: string }) {
  const thumbnails: Record<string, React.ReactNode> = {
    clean: (
      <div className="h-16 rounded-lg bg-muted/50 border flex flex-col items-center justify-center gap-1 p-2">
        <div className="w-8 h-1 rounded bg-border" />
        <div className="w-12 h-1 rounded bg-muted-foreground/20" />
        <div className="w-10 h-3 rounded mt-1" style={{ backgroundColor: accent + '60' }} />
      </div>
    ),
    neon: (
      <div className="h-16 rounded-lg bg-black border border-white/10 flex flex-col items-center justify-center gap-1 p-2">
        <div className="w-10 h-1 rounded" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }} />
        <div className="w-8 h-px bg-white/20" />
        <div className="w-10 h-3 rounded border mt-1" style={{ borderColor: accent, boxShadow: `0 0 4px ${accent}40` }} />
      </div>
    ),
    gradient: (
      <div className="h-16 rounded-lg border flex flex-col items-center justify-center gap-1 p-2" style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}>
        <div className="w-10 h-1.5 rounded" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />
        <div className="w-8 h-1 rounded bg-border" />
        <div className="w-10 h-3 rounded mt-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />
      </div>
    ),
    party: (
      <div className="h-16 rounded-lg bg-muted/30 border-2 border-dashed flex flex-col items-center justify-center gap-1 p-2" style={{ borderColor: accent + '60' }}>
        <div className="text-base">🎉</div>
        <div className="w-10 h-3 rounded" style={{ backgroundColor: accent }} />
      </div>
    ),
    luxury: (
      <div className="h-16 rounded-lg bg-black border border-white/10 flex flex-col items-center justify-center gap-1 p-2">
        <div className="w-6 h-px" style={{ backgroundColor: accent }} />
        <div className="w-10 h-1 rounded bg-white/20" />
        <div className="w-8 h-px" style={{ backgroundColor: accent }} />
        <div className="w-10 h-3 rounded border border-white/20 mt-1" />
      </div>
    ),
    brutal: (
      <div className="h-16 rounded-none bg-amber-50/5 border-2 border-foreground/30 flex flex-col items-center justify-center gap-1 p-2" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
        <div className="w-10 h-2 rounded-none bg-foreground/40" />
        <div className="w-10 h-3 rounded-none border border-foreground/30 mt-1" />
      </div>
    ),
    glass: (
      <div className="h-16 rounded-xl flex flex-col items-center justify-center gap-1 p-2" style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)` }}>
        <div className="w-12 h-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur flex flex-col items-center justify-center gap-1">
          <div className="w-6 h-1 rounded bg-white/50" />
          <div className="w-8 h-2 rounded bg-white/30" />
        </div>
      </div>
    ),
    split: (
      <div className="h-16 rounded-lg overflow-hidden border flex">
        <div className="w-1/2 flex items-center justify-center" style={{ backgroundColor: accent + '60' }}>
          <div className="w-6 h-1 rounded bg-white/50" />
        </div>
        <div className="w-1/2 bg-muted flex flex-col items-center justify-center gap-1 p-1">
          <div className="w-8 h-1 rounded bg-border" />
          <div className="w-6 h-2 rounded" style={{ backgroundColor: accent + '80' }} />
        </div>
      </div>
    ),
    arcade: (
      <div className="h-16 rounded-lg flex flex-col items-center justify-center gap-1 p-2" style={{ background: 'linear-gradient(135deg, #0d0221, #2d1b69)' }}>
        <div className="w-10 h-1 rounded" style={{ backgroundColor: accent, boxShadow: `0 0 4px ${accent}` }} />
        <div className="w-8 h-1 bg-white/20 rounded" />
        <div className="w-10 h-3 rounded border mt-1" style={{ borderColor: accent }} />
      </div>
    ),
    conversational: (
      <div className="h-16 rounded-lg border flex flex-col justify-between p-2" style={{ backgroundColor: accent + '20' }}>
        <div className="w-12 h-2 rounded bg-white/30" />
        <div className="w-full h-px bg-white/30" />
        <div className="flex items-center justify-between">
          <div className="w-6 h-1 rounded bg-white/20" />
          <div className="w-6 h-3 rounded" style={{ backgroundColor: accent + '80' }} />
        </div>
      </div>
    ),
  }

  return thumbnails[id] ?? <div className="h-16 rounded bg-muted" />
}
