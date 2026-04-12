export type Plan = 'free' | 'pro' | 'business'

export type FormTemplate =
  | 'clean'
  | 'neon'
  | 'gradient'
  | 'party'
  | 'luxury'
  | 'brutal'
  | 'glass'
  | 'split'
  | 'arcade'
  | 'conversational'
  | 'terminal'
  | 'holographic'

export type DrawTheme = 'slot' | 'wheel' | 'cards' | 'dice' | 'spotlight'

export type FormStatus = 'draft' | 'active' | 'closed'

export type RaffleType = 'giveaway' | 'earlyaccess' | 'contest' | 'internal'

export type FieldType = 'email' | 'text' | 'phone' | 'dropdown' | 'checkbox' | 'number' | 'follow_link'

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]    // for dropdown
  phoneCountry?: string // for phone: ISO-2 code to restrict to one country (e.g. 'US')
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  onboarding_step: number
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_at: string
}

export interface Form {
  id: string
  workspace_id: string
  name: string
  description: string | null
  subdomain: string
  custom_domain: string | null
  status: FormStatus
  template: FormTemplate
  draw_theme: DrawTheme
  accent_color: string
  logo_url: string | null
  fields: FormField[]
  starts_at: string | null
  ends_at: string | null
  max_entries: number | null
  allow_duplicates: boolean
  require_captcha: boolean
  social_sharing: boolean
  show_entry_count: boolean
  winners_page: boolean
  password_hash: string | null
  embed_enabled: boolean
  webhook_url: string | null
  raffle_type: RaffleType
  require_confirmation: boolean
  created_at: string
  updated_at: string
}

export interface Entry {
  id: string
  form_id: string
  data: Record<string, string>
  ip_hash: string | null
  email_hash: string | null
  status: 'pending' | 'confirmed'
  source: 'web' | 'twitch' | 'discord'
  referral_code: string | null
  referral_count: number
  is_winner: boolean
  flagged: boolean
  draw_id: string | null
  entered_at: string
}

export interface Draw {
  id: string
  form_id: string
  drawn_by: string
  winner_count: number
  notes: string | null
  drawn_at: string
}

export interface Subscription {
  id: string
  workspace_id: string
  stripe_customer_id: string
  stripe_sub_id: string
  plan: Plan
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface FormWithEntryCount extends Form {
  entry_count: number
}

export interface PublicForm {
  id: string
  name: string
  description: string | null
  subdomain: string
  template: FormTemplate
  draw_theme: DrawTheme
  accent_color: string
  logo_url: string | null
  fields: FormField[]
  status: FormStatus
  max_entries: number | null
  require_captcha: boolean
  social_sharing: boolean
  show_entry_count: boolean
  winners_page: boolean
  raffle_type: RaffleType
  starts_at: string | null
  ends_at: string | null
}

export interface FormTemplateInfo {
  id: FormTemplate
  name: string
  description: string
  tier: 'free' | 'pro'
  tags: string[]
}

export const FORM_TEMPLATES: FormTemplateInfo[] = [
  { id: 'clean',          name: 'Clean',          description: 'Minimal card, works for everything',         tier: 'free', tags: ['minimal', 'professional'] },
  { id: 'neon',           name: 'Neon',           description: 'Dark canvas with glow effects for streamers', tier: 'free', tags: ['dark', 'gaming', 'streamer'] },
  { id: 'gradient',       name: 'Gradient Card',  description: 'Modern SaaS with gradient button',           tier: 'free', tags: ['modern', 'saas'] },
  { id: 'party',          name: 'Party',          description: 'Festive confetti for giveaways',             tier: 'free', tags: ['fun', 'celebration'] },
  { id: 'luxury',         name: 'Luxury',         description: 'Full black, serif fonts, premium brands',    tier: 'pro',  tags: ['dark', 'premium', 'brand'] },
  { id: 'brutal',         name: 'Brutal',         description: 'Neo-brutalism with bold borders',            tier: 'pro',  tags: ['bold', 'editorial'] },
  { id: 'glass',          name: 'Glass',          description: 'Frosted glass on animated gradient',         tier: 'pro',  tags: ['modern', 'ios', 'premium'] },
  { id: 'split',          name: 'Split',          description: 'Two-column magazine layout',                 tier: 'pro',  tags: ['editorial', 'brand', 'campaign'] },
  { id: 'arcade',         name: 'Arcade',         description: 'Retro synthwave with pixel fonts',           tier: 'pro',  tags: ['retro', 'gaming', '80s'] },
  { id: 'conversational', name: 'Conversational', description: 'One question at a time like Typeform',       tier: 'pro',  tags: ['interactive', 'engagement'] },
  { id: 'terminal',       name: 'Terminal',       description: 'Hacker terminal aesthetic, dark & monospace', tier: 'pro',  tags: ['dark', 'developer', 'hacker'] },
  { id: 'holographic',    name: 'Holographic',    description: 'Iridescent premium with animated shimmer',   tier: 'pro',  tags: ['premium', 'modern', 'luxury'] },
]

export const PLAN_LIMITS: Record<Plan, {
  workspaces: number
  forms: number
  entriesPerForm: number
  fields: number
  draws: number
  templates: FormTemplate[]
  ads: boolean
  branding: boolean
}> = {
  free: {
    workspaces: 1,
    forms: 3,
    entriesPerForm: 500,
    fields: 3,
    draws: 1,
    templates: ['clean', 'neon', 'gradient', 'party'],
    ads: true,
    branding: true,
  },
  pro: {
    workspaces: 1,
    forms: Infinity,
    entriesPerForm: 10000,
    fields: 10,
    draws: Infinity,
    templates: ['clean', 'neon', 'gradient', 'party', 'luxury', 'brutal', 'glass', 'split', 'arcade', 'conversational', 'terminal', 'holographic'],
    ads: false,
    branding: false,
  },
  business: {
    workspaces: 3,
    forms: Infinity,
    entriesPerForm: Infinity,
    fields: Infinity,
    draws: Infinity,
    templates: ['clean', 'neon', 'gradient', 'party', 'luxury', 'brutal', 'glass', 'split', 'arcade', 'conversational', 'terminal', 'holographic'],
    ads: false,
    branding: false,
  },
}

export const RESERVED_SUBDOMAINS = [
  'www', 'app', 'api', 'admin', 'dashboard', 'mail', 'help', 'support',
  'blog', 'docs', 'status', 'cdn', 'static', 'assets', 'media', 'img',
  'stream', 'winners', 'embed', 'f', 'replay', 'auth', 'login', 'signup',
]
