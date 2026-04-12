import { z } from 'zod'
import { RESERVED_SUBDOMAINS } from '@/types/app'

export const fieldSchema = z.object({
  id: z.string(),
  type: z.enum(['email', 'text', 'phone', 'dropdown', 'checkbox', 'number', 'follow_link']),
  label: z.string().min(1, 'Label is required').max(100),
  placeholder: z.string().max(200).optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  phoneCountry: z.string().length(2).optional(), // ISO-2 country code
})

export const formWizardSchema = z.object({
  // Step 1 — template + basics
  template: z.enum(['clean', 'neon', 'gradient', 'party', 'luxury', 'brutal', 'glass', 'split', 'arcade', 'conversational', 'terminal', 'holographic']),
  raffle_type: z.enum(['giveaway', 'earlyaccess', 'contest', 'internal']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  description: z.string().max(300).optional(),
  subdomain: z
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(30, 'Must be 30 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
    .refine(s => !RESERVED_SUBDOMAINS.includes(s), 'This subdomain is reserved'),

  // Step 2 — fields
  fields: z.array(fieldSchema).min(1, 'At least one field is required').max(10),

  // Step 3 — settings
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
  logo_url: z.string().url().optional().or(z.literal('')),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  max_entries: z.number().int().min(1).max(1_000_000).optional(),
  allow_duplicates: z.boolean(),
  require_captcha: z.boolean(),
  social_sharing: z.boolean(),
  show_entry_count: z.boolean(),
  winners_page: z.boolean(),
  require_confirmation: z.boolean(),
  draw_theme: z.enum(['slot', 'wheel', 'cards', 'dice', 'spotlight']).default('slot'),
})

export type FormWizardValues = z.infer<typeof formWizardSchema>

export const DEFAULT_WIZARD_VALUES: FormWizardValues = {
  template: 'clean',
  raffle_type: 'giveaway',
  name: '',
  description: '',
  subdomain: '',
  fields: [
    { id: 'email', type: 'email', label: 'Email address', placeholder: 'you@example.com', required: true },
    { id: 'name', type: 'text', label: 'Full name', placeholder: 'Your name', required: true },
  ],
  accent_color: '#6366f1',
  logo_url: '',
  starts_at: '',
  ends_at: '',
  max_entries: undefined,
  allow_duplicates: false,
  require_captcha: true,
  social_sharing: true,
  show_entry_count: true,
  winners_page: true,
  require_confirmation: false,
  draw_theme: 'slot',
}

export const RAFFLE_TYPE_PRESETS = {
  giveaway: {
    name: 'Giveaway',
    description: 'Win an amazing prize — enter your details below!',
    fields: [
      { id: 'email', type: 'email' as const, label: 'Email address', placeholder: 'you@example.com', required: true },
      { id: 'name', type: 'text' as const, label: 'Full name', placeholder: 'Your name', required: true },
    ],
  },
  earlyaccess: {
    name: 'Early Access',
    description: 'Join the waitlist and be first to get access.',
    fields: [
      { id: 'email', type: 'email' as const, label: 'Email address', placeholder: 'you@example.com', required: true },
    ],
  },
  contest: {
    name: 'Contest',
    description: 'Submit your entry and compete for the prize.',
    fields: [
      { id: 'email', type: 'email' as const, label: 'Email address', placeholder: 'you@example.com', required: true },
      { id: 'name', type: 'text' as const, label: 'Full name', placeholder: 'Your name', required: true },
      { id: 'submission', type: 'text' as const, label: 'Your submission', placeholder: 'Enter your answer or link...', required: true },
    ],
  },
  internal: {
    name: 'Internal Draw',
    description: 'Internal team draw — employees only.',
    fields: [
      { id: 'name', type: 'text' as const, label: 'Full name', placeholder: 'Your name', required: true },
      { id: 'employee_id', type: 'text' as const, label: 'Employee ID', placeholder: 'EMP-0001', required: true },
    ],
  },
}
