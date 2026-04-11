import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { FormRowActions } from '@/components/forms/form-row-actions'
import { Plus, Layers, ExternalLink, Dice5, Settings, Clock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { Form } from '@/types/app'

export const metadata = { title: 'Forms' }

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  draft:  'bg-muted text-muted-foreground border-border',
  closed: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
}

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
  if (!membership) redirect('/login')

  const { data: forms } = await supabase
    .from('forms').select('*').eq('workspace_id', membership.workspace_id)
    .order('created_at', { ascending: false })

  const formList = (forms ?? []) as Form[]

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formList.length === 0
              ? 'No forms yet.'
              : `${formList.length} form${formList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/forms/new">
          <Button className="gap-2">
            <Plus className="size-4" /> New form
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {formList.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center">
          <Layers className="size-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-base font-medium mb-1">No forms yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Create your first raffle form and start collecting entries.
          </p>
          <Link href="/forms/new">
            <Button className="gap-2"><Plus className="size-4" /> Create a form</Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y border rounded-xl overflow-hidden">
          {formList.map((form: Form) => (
            <div key={form.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors group">
              {/* Accent dot */}
              <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: form.accent_color }} />

              {/* Name + meta — click goes to form detail */}
              <Link href={`/forms/${form.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{form.name}</span>
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border leading-none ${STATUS_STYLES[form.status] ?? STATUS_STYLES.draft}`}>
                    {form.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="size-3" />
                  {form.subdomain}.drawvault.site · {timeAgo(form.updated_at)}
                </p>
              </Link>

              {/* Actions — always visible on touch, hover on desktop */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <a
                  href={`/f/${form.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Open form"
                >
                  <ExternalLink className="size-4" />
                </a>
                <Link
                  href={`/forms/${form.id}/draw`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Run draw"
                >
                  <Dice5 className="size-4" />
                </Link>
                <Link
                  href={`/forms/${form.id}/settings`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Settings"
                >
                  <Settings className="size-4" />
                </Link>
                <FormRowActions formId={form.id} status={form.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New form CTA at bottom when list exists */}
      {formList.length > 0 && (
        <Link href="/forms/new">
          <div className="border border-dashed rounded-xl p-4 flex items-center gap-4 hover:border-foreground/40 hover:bg-muted/20 transition-all group cursor-pointer">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors shrink-0">
              <Plus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium">New form</p>
              <p className="text-xs text-muted-foreground">Create a raffle, giveaway, or waitlist</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
