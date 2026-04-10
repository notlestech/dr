import { createClient } from '@/lib/supabase/server'
import { UpgradeClient } from './upgrade-client'

export const metadata = { title: 'Upgrade' }

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: 'free' | 'pro' | 'business' = 'free'

  if (user) {
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single()

    if (membership) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('workspace_id', membership.workspace_id)
        .eq('status', 'active')
        .maybeSingle()

      if (sub) currentPlan = sub.plan as 'pro' | 'business'
    }
  }

  return <UpgradeClient currentPlan={currentPlan} />
}
