'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Lock, Plus, Trash2, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormWizardValues } from '@/lib/validations/form'
import type { FormField } from '@/types/app'

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

export function StepSettings({ values, update, isPro }: Props) {
  const followLinks = values.fields.filter(f => f.type === 'follow_link')

  function addFollowLink() {
    const newField: FormField = {
      id: `fl_${Date.now()}`,
      type: 'follow_link',
      label: '',
      placeholder: '',
      required: true,
    }
    update({ fields: [...values.fields, newField] })
  }

  function updateFollowLink(id: string, patch: Partial<FormField>) {
    update({
      fields: values.fields.map(f => f.id === id ? { ...f, ...patch } : f),
    })
  }

  function removeFollowLink(id: string) {
    update({ fields: values.fields.filter(f => f.id !== id) })
  }

  return (
    <div className="space-y-8">

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

      {/* Links to follow */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Links to follow</p>
        <p className="text-xs text-muted-foreground mb-3">
          Participants will be asked to follow these links before entering.
        </p>

        <div className="space-y-2">
          {followLinks.map(link => (
            <div key={link.id} className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Link2 className="size-3.5 text-muted-foreground" />
              </div>
              <Input
                placeholder="Platform (e.g. Twitter)"
                value={link.label}
                onChange={e => updateFollowLink(link.id, { label: e.target.value })}
                className="h-8 text-xs w-36 shrink-0"
              />
              <Input
                placeholder="https://twitter.com/yourhandle"
                value={link.placeholder ?? ''}
                onChange={e => updateFollowLink(link.id, { placeholder: e.target.value })}
                className="h-8 text-xs flex-1 min-w-0"
              />
              <button
                onClick={() => removeFollowLink(link.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5 text-xs h-8"
          onClick={addFollowLink}
        >
          <Plus className="size-3" /> Add link
        </Button>
      </div>
    </div>
  )
}
