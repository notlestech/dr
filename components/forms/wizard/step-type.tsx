'use client'

import React from 'react'
import { cn, generateSubdomain } from '@/lib/utils'
import { RAFFLE_TYPE_PRESETS } from '@/lib/validations/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Gift, Rocket, Award, Building2 } from 'lucide-react'
import type { FormWizardValues } from '@/lib/validations/form'

interface Props {
  values: FormWizardValues
  update: (payload: Partial<FormWizardValues>) => void
}

interface RaffleTypeInfo {
  id: 'giveaway' | 'earlyaccess' | 'contest' | 'internal'
  label: string
  desc: string
  icon: React.ElementType
  tooltip: {
    summary: string
    fields: string[]
    bestFor: string
  }
}

const RAFFLE_TYPES: RaffleTypeInfo[] = [
  {
    id: 'giveaway',
    label: 'Giveaway',
    desc: 'Prize draw for your audience',
    icon: Gift,
    tooltip: {
      summary: 'Collect entries and randomly draw one or more winners.',
      fields: ['Email address', 'Full name'],
      bestFor: 'Product prizes, social media giveaways, community rewards',
    },
  },
  {
    id: 'earlyaccess',
    label: 'Early Access',
    desc: 'Waitlist for a product launch',
    icon: Rocket,
    tooltip: {
      summary: 'Build a waitlist and randomly select who gets in first.',
      fields: ['Email address only (low friction)'],
      bestFor: 'SaaS betas, app launches, product waitlists',
    },
  },
  {
    id: 'contest',
    label: 'Contest',
    desc: 'Submission-based competition',
    icon: Award,
    tooltip: {
      summary: 'Participants submit an answer or link — you draw or pick the best.',
      fields: ['Email address', 'Full name', 'Submission (answer or URL)'],
      bestFor: 'Photo contests, caption competitions, creative challenges',
    },
  },
  {
    id: 'internal',
    label: 'Internal Draw',
    desc: 'Team or employee raffle',
    icon: Building2,
    tooltip: {
      summary: 'A private raffle for your team — not meant for public audiences.',
      fields: ['Full name', 'Employee ID'],
      bestFor: 'HR raffles, team events, employee appreciation',
    },
  },
]

export function StepType({ values, update }: Props) {
  function selectType(type: FormWizardValues['raffle_type']) {
    const preset = RAFFLE_TYPE_PRESETS[type]
    const newName = values.name || preset.name
    update({
      raffle_type: type,
      name: newName,
      subdomain: values.subdomain || generateSubdomain(newName),
      description: values.description || preset.description,
      fields: preset.fields.map(f => ({ ...f, id: `${f.id}_${Date.now()}` })),
    })
  }

  function handleNameChange(name: string) {
    update({ name, subdomain: generateSubdomain(name) })
  }

  return (
    <div className="space-y-10">
      {/* Type selector */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type that best fits your raffle — we'll pre-fill the right fields for you.
        </p>
        <TooltipProvider delay={300}>
          <div className="grid grid-cols-2 gap-3">
            {RAFFLE_TYPES.map(t => {
              const Icon = t.icon
              const selected = values.raffle_type === t.id
              return (
                <Tooltip key={t.id}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => selectType(t.id)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                          selected
                            ? 'border-foreground bg-foreground/5'
                            : 'border-border bg-card hover:border-foreground/30 hover:bg-muted/30'
                        )}
                      />
                    }
                  >
                    <div className={cn(
                      'size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      selected ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-56 p-3 space-y-2">
                    <p className="text-xs leading-relaxed">{t.tooltip.summary}</p>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Default fields</p>
                      <ul className="space-y-0.5">
                        {t.tooltip.fields.map(f => (
                          <li key={f} className="text-xs opacity-80">· {f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Best for</p>
                      <p className="text-xs opacity-80">{t.tooltip.bestFor}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Name + description */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Form name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={values.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Summer Giveaway"
            className="text-base h-11"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">optional</span>
          </Label>
          <Textarea
            id="description"
            value={values.description ?? ''}
            onChange={e => update({ description: e.target.value })}
            placeholder="Tell entrants what they can win or why they should enter…"
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  )
}
