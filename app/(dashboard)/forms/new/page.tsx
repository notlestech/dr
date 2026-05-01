import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormWizard } from '@/components/forms/wizard/form-wizard'
import { Button, buttonVariants } from '@/components/ui/button'
import { Crown, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Create Form' }

export default async function NewFormPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const [{ data: sub }, { data: ws }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan')
      .eq('workspace_id', membership.workspace_id)
      .maybeSingle(),
    supabase
      .from('workspaces')
      .select('forms_created_total')
      .eq('id', membership.workspace_id)
      .single()
  ])

  const plan = sub?.plan ?? 'free'
  const isPro = plan === 'pro' || plan === 'business'
  const formsCreated = ws?.forms_created_total ?? 0

  if (plan === 'free' && formsCreated >= 1) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <Crown className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Form limit reached</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You have reached the 1-form limit on the Free plan. Upgrade to Pro for unlimited forms, unlimited draws, and premium templates.
        </p>
        <div className="flex gap-4">
          <Link href="/forms" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4 mr-2" /> Back to forms
          </Link>
          <Link href="/upgrade" className={buttonVariants({ className: "bg-amber-500 hover:bg-amber-600 text-white" })}>
            <Crown className="size-4 mr-2" /> Upgrade to Pro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <FormWizard isPro={isPro} plan={plan} />
    </div>
  )
}
