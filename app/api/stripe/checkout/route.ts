import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { PlanKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planKey, successUrl, cancelUrl } = await req.json() as {
    planKey: PlanKey
    successUrl: string
    cancelUrl: string
  }

  const priceId = PLANS[planKey]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Get workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 400 })

  // Check existing subscription for customer ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('workspace_id', membership.workspace_id)
    .maybeSingle()

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: sub?.stripe_customer_id || undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { workspace_id: membership.workspace_id },
      },
      allow_promotion_codes: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to create checkout session' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
