'use client'

import { cn } from '@/lib/utils'
import { FORM_TEMPLATES } from '@/types/app'
import { Lock, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormTemplateRenderer } from '@/components/form-templates'
import type { FormWizardValues } from '@/lib/validations/form'
import type { PublicForm } from '@/types/app'

interface Props {
  values: FormWizardValues
  update: (payload: Partial<FormWizardValues>) => void
  isPro: boolean
}

function wizardToPublicForm(values: FormWizardValues): PublicForm {
  return {
    id: 'preview',
    name: values.name || 'Your Form',
    description: values.description || null,
    subdomain: values.subdomain || 'preview',
    template: values.template,
    draw_theme: values.draw_theme,
    accent_color: values.accent_color,
    logo_url: values.logo_url || null,
    fields: values.fields,
    status: 'active',
    max_entries: values.max_entries ?? null,
    require_captcha: false,
    social_sharing: values.social_sharing,
    show_entry_count: false,
    winners_page: values.winners_page,
    raffle_type: values.raffle_type,
    starts_at: values.starts_at || null,
    ends_at: values.ends_at || null,
  }
}

export function StepDesign({ values, update, isPro }: Props) {
  const previewForm = wizardToPublicForm(values)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left — controls */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Accent color */}
        <div className="space-y-2">
          <Label>Accent color</Label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={values.accent_color}
              onChange={e => update({ accent_color: e.target.value })}
              className="w-10 h-10 rounded-xl border cursor-pointer bg-transparent p-0.5"
            />
            <Input
              value={values.accent_color}
              onChange={e => {
                const v = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) update({ accent_color: v })
              }}
              placeholder="#6366f1"
              className="font-mono w-32 h-10"
            />
            <div className="flex items-center gap-1.5">
              {['#f43f5e', '#f59e0b', '#6366f1', '#10b981', '#f97316', '#06b6d4', '#a855f7', '#000000'].map(c => (
                <button
                  key={c}
                  onClick={() => update({ accent_color: c })}
                  className="size-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: values.accent_color === c ? 'var(--foreground)' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Template grid */}
        <div>
          <Label className="mb-3 block">Template</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FORM_TEMPLATES.map(tmpl => {
              const locked = !isPro && tmpl.tier === 'pro'
              const selected = values.template === tmpl.id && !locked
              return (
                <button
                  key={tmpl.id}
                  onClick={() => !locked && update({ template: tmpl.id })}
                  className={cn(
                    'relative p-3 rounded-xl border text-left transition-all',
                    selected
                      ? 'border-foreground bg-foreground/5 ring-1 ring-foreground'
                      : locked
                      ? 'border-border bg-muted/20 opacity-50 cursor-not-allowed'
                      : 'border-border bg-card hover:border-foreground/30 hover:bg-muted/20'
                  )}
                >
                  <TemplateThumbnail id={tmpl.id} accent={values.accent_color} />

                  <div className="mt-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{tmpl.name}</span>
                      {locked && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full border leading-none">
                          <Lock className="size-2.5" /> Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  {selected && (
                    <div className="absolute top-2 right-2 size-4 bg-foreground rounded-full flex items-center justify-center">
                      <Check className="size-2.5 text-background" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right — live preview */}
      <div className="lg:w-80 xl:w-96 shrink-0">
        <div className="sticky top-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Live preview</p>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
              {FORM_TEMPLATES.find(t => t.id === values.template)?.name ?? values.template}
            </span>
          </div>
          <div className="relative overflow-hidden rounded-xl border bg-muted/30" style={{ height: 480 }}>
            <div
              className="pointer-events-none"
              style={{
                transform: 'scale(0.48)',
                transformOrigin: 'top center',
                width: `${100 / 0.48}%`,
                position: 'absolute',
                top: 0,
                left: '50%',
                translate: '-50% 0',
              }}
            >
              <FormTemplateRenderer
                form={previewForm}
                fields={previewForm.fields}
                entryCount={0}
                onSubmit={async () => {}}
                isSubmitting={false}
                isSuccess={false}
              />
            </div>
            {/* Click-blocker */}
            <div className="absolute inset-0 flex items-end justify-center pb-3">
              <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
                Preview only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateThumbnail({ id, accent }: { id: string; accent: string }) {
  const map: Record<string, React.ReactNode> = {
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
      <div className="h-16 rounded-lg bg-white border-2 flex flex-col items-center justify-center gap-1 p-2" style={{ borderColor: accent + '60' }}>
        <div className="flex gap-1 mb-1">
          {[accent, accent + '80', accent + '40'].map((c, i) => (
            <div key={i} className="size-2 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
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
      <div className="h-16 bg-amber-50/10 border-2 border-foreground/30 flex flex-col items-center justify-center gap-1 p-2" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
        <div className="w-10 h-2 bg-foreground/40" />
        <div className="w-10 h-3 border border-foreground/30 mt-1" />
      </div>
    ),
    glass: (
      <div className="h-16 rounded-xl flex flex-col items-center justify-center gap-1 p-2" style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)` }}>
        <div className="w-12 h-10 rounded-lg border border-white/20 bg-white/10 flex flex-col items-center justify-center gap-1">
          <div className="w-6 h-1 rounded bg-white/50" />
          <div className="w-8 h-2 rounded bg-white/30" />
        </div>
      </div>
    ),
    split: (
      <div className="h-16 rounded-lg overflow-hidden border flex">
        <div className="w-1/2 flex items-center justify-center" style={{ backgroundColor: accent + '60' }}>
          <div className="w-6 h-1 rounded bg-white/60" />
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
        <div className="w-full h-px bg-white/20" />
        <div className="flex items-center justify-between">
          <div className="w-6 h-1 rounded bg-white/20" />
          <div className="w-6 h-3 rounded" style={{ backgroundColor: accent + '80' }} />
        </div>
      </div>
    ),
  }
  return map[id] ?? <div className="h-16 rounded-lg bg-muted" />
}
