import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormWizard } from '@/components/forms/wizard/form-wizard'

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

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('workspace_id', membership.workspace_id)
    .maybeSingle()

  const plan = sub?.plan ?? 'free'
  const isPro = plan === 'pro' || plan === 'business'

  return (
    <div className="min-h-screen bg-background">
      <FormWizard isPro={isPro} plan={plan} />
    </div>
  )
}
