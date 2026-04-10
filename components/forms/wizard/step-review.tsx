'use client'

import { FORM_TEMPLATES } from '@/types/app'
import { FormTemplateRenderer } from '@/components/form-templates'
import { Check, ExternalLink } from 'lucide-react'
import type { FormWizardValues } from '@/lib/validations/form'
import type { PublicForm } from '@/types/app'

interface Props {
  values: FormWizardValues
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
    require_captcha: false, // disabled in preview
    social_sharing: values.social_sharing,
    show_entry_count: false, // no live count in preview
    winners_page: values.winners_page,
    raffle_type: values.raffle_type,
    starts_at: values.starts_at || null,
    ends_at: values.ends_at || null,
  }
}

export function StepReview({ values, isPro }: Props) {
  const template = FORM_TEMPLATES.find(t => t.id === values.template)
  const previewForm = wizardToPublicForm(values)

  const summaryRows = [
    { label: 'Name',       value: values.name || '—' },
    { label: 'URL',        value: values.subdomain ? `${values.subdomain}.drawvault.site` : '—', mono: true },
    { label: 'Template',   value: template?.name ?? values.template },
    { label: 'Fields',     value: `${values.fields.length} field${values.fields.length !== 1 ? 's' : ''}` },
    { label: 'Draw style', value: values.draw_theme.charAt(0).toUpperCase() + values.draw_theme.slice(1) },
    { label: 'Protection', value: values.require_captcha ? 'Turnstile enabled' : 'None' },
    { label: 'Max entries',value: values.max_entries ? values.max_entries.toLocaleString() : 'Unlimited' },
  ]

  return (
    <div className="space-y-8">
      {/* Live form preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Form preview</p>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Live render</span>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border bg-background"
          style={{ height: 480 }}
        >
          {/* Scaled template render */}
          <div
            className="pointer-events-none"
            style={{
              transform: 'scale(0.55)',
              transformOrigin: 'top center',
              width: `${100 / 0.55}%`,
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

          {/* Click-blocker overlay with label */}
          <div className="absolute inset-0 flex items-end justify-center pb-3">
            <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
              Preview only — not interactive
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Summary</p>
        <div className="rounded-xl border divide-y">
          {summaryRows.map(row => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={row.mono ? 'font-mono text-xs' : ''}>{row.value}</span>
            </div>
          ))}
          {/* Accent color */}
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Accent</span>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded border" style={{ backgroundColor: values.accent_color }} />
              <span className="font-mono text-xs">{values.accent_color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="rounded-xl border bg-muted/20 p-4">
        <p className="text-sm font-medium mb-3">After publishing</p>
        <ul className="space-y-2">
          {[
            'Your form goes live at the subdomain URL',
            'Share the link or embed the form on your site',
            'Entries come in — watch the live count update',
            'Run the draw whenever you\'re ready',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
