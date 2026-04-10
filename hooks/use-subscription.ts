'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/types/app'

interface SubscriptionState {
  plan: Plan
  loading: boolean
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export function useSubscription(workspaceId: string | null) {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    loading: true,
    periodEnd: null,
    cancelAtPeriodEnd: false,
  })

  useEffect(() => {
    if (!workspaceId) {
      setState(s => ({ ...s, loading: false }))
      return
    }

    const supabase = createClient()
    supabase
      .from('subscriptions')
      .select('plan, current_period_end, cancel_at_period_end, status')
      .eq('workspace_id', workspaceId)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.status === 'active') {
          setState({
            plan: data.plan as Plan,
            loading: false,
            periodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
          })
        } else {
          setState({ plan: 'free', loading: false, periodEnd: null, cancelAtPeriodEnd: false })
        }
      })
  }, [workspaceId])

  return state
}
