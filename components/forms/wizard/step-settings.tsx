'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Lock, Shuffle, RotateCw, CreditCard, Dice5 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormWizardValues } from '@/lib/validations/form'

interface Props {
  values: FormWizardValues
  update: (payload: Partial<FormWizardValues>) => void
  isPro: boolean
}

function SettingRow({
  label,
  description,
  children,
  locked,
}: {
  label: string
  description?: string
  children: React.ReactNode
  locked?: boolean
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-4 border-b last:border-0', locked && 'opacity-40 pointer-events-none')}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {locked && (
            <span className="flex items-center gap-0.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full border font-medium leading-none">
              <Lock className="size-2.5" /> Pro
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const DRAW_THEMES = [
  { id: 'slot',  label: 'Slot Machine',   icon: Shuffle,    free: true  },
  { id: 'wheel', label: 'Spinning Wheel', icon: RotateCw,   free: false },
  { id: 'cards', label: 'Card Flip',      icon: CreditCard, free: false },
  { id: 'dice',  label: 'Dice Roll',      icon: Dice5,      free: false },
] as const

export function StepSettings({ values, update, isPro }: Props) {
  return (
    <div className="space-y-8">

      {/* Draw animation */}
      <div>
        <Label className="mb-3 block">Draw animation</Label>
        <div className="grid grid-cols-2 gap-3">
          {DRAW_THEMES.map(theme => {
            const locked = !theme.free && !isPro
            const selected = values.draw_theme === theme.id
            const Icon = theme.icon
            return (
              <button
                key={theme.id}
                onClick={() => !locked && update({ draw_theme: theme.id as FormWizardValues['draw_theme'] })}
                disabled={locked}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                  selected && !locked
                    ? 'border-foreground bg-foreground/5'
                    : locked
                    ? 'border-border opacity-40 cursor-not-allowed'
                    : 'border-border hover:border-foreground/30 hover:bg-muted/20'
                )}
              >
                <div className={cn(
                  'size-8 rounded-lg flex items-center justify-center shrink-0',
                  selected && !locked ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{theme.label}</p>
                  {locked && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                      <Lock className="size-2.5" /> Pro
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Scheduling */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Scheduling</p>
        <div className="rounded-xl border px-4 divide-y">
          <SettingRow label="Open date" description="Form accepts entries from this time">
            <Input
              type="datetime-local"
              value={values.starts_at ?? ''}
              onChange={e => update({ starts_at: e.target.value })}
              className="text-xs h-8 w-44"
            />
          </SettingRow>
          <SettingRow label="Close date" description="Form closes automatically at this time">
            <Input
              type="datetime-local"
              value={values.ends_at ?? ''}
              onChange={e => update({ ends_at: e.target.value })}
              className="text-xs h-8 w-44"
            />
          </SettingRow>
          <SettingRow label="Max entries" description="Leave blank for unlimited">
            <Input
              type="number"
              value={values.max_entries ?? ''}
              onChange={e => update({ max_entries: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Unlimited"
              min={1}
              className="w-28 text-xs h-8"
            />
          </SettingRow>
        </div>
      </div>

      {/* Protection */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Protection</p>
        <div className="rounded-xl border px-4 divide-y">
          <SettingRow label="Bot protection" description="Cloudflare Turnstile on every submission">
            <Switch
              checked={values.require_captcha}
              onCheckedChange={v => update({ require_captcha: v })}
            />
          </SettingRow>
          <SettingRow label="Prevent duplicate entries" description="Block same email or device entering twice" locked={!isPro}>
            <Switch
              checked={!values.allow_duplicates}
              onCheckedChange={v => update({ allow_duplicates: !v })}
              disabled={!isPro}
            />
          </SettingRow>
          <SettingRow label="Email confirmation" description="Require entrants to confirm their email" locked={!isPro}>
            <Switch
              checked={values.require_confirmation}
              onCheckedChange={v => update({ require_confirmation: v })}
              disabled={!isPro}
            />
          </SettingRow>
        </div>
      </div>

      {/* Display */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Display</p>
        <div className="rounded-xl border px-4 divide-y">
          <SettingRow label="Show live entry count" description="'847 people have entered' on the public form">
            <Switch
              checked={values.show_entry_count}
              onCheckedChange={v => update({ show_entry_count: v })}
            />
          </SettingRow>
          <SettingRow label="Social sharing buttons" description="Twitter / WhatsApp share on the form">
            <Switch
              checked={values.social_sharing}
              onCheckedChange={v => update({ social_sharing: v })}
            />
          </SettingRow>
          <SettingRow label="Public winners page" description="Anyone can view past draw results">
            <Switch
              checked={values.winners_page}
              onCheckedChange={v => update({ winners_page: v })}
            />
          </SettingRow>
        </div>
      </div>
    </div>
  )
}
