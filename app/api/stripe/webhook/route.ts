import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  async function upsertSubscription(sub: Stripe.Subscription) {
    const workspaceId = sub.metadata?.workspace_id
    if (!workspaceId) {
      console.error('[webhook] upsertSubscription: missing workspace_id in subscription metadata', sub.id)
      return
    }

    const priceId = sub.items.data[0]?.price.id
    let plan: 'free' | 'pro' | 'business' = 'free'

    if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
      plan = 'pro'
    } else if (priceId === process.env.STRIPE_PRICE_BUSINESS_MONTHLY || priceId === process.env.STRIPE_PRICE_BUSINESS_YEARLY) {
      plan = 'business'
    }

    // current_period_end moved in newer Stripe API versions — check multiple locations
    const rawPeriodEnd = (sub as any).current_period_end
      ?? (sub as any).items?.data?.[0]?.current_period_end
      ?? null
    const periodEndIso = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null

    const { error } = await getSupabase().from('subscriptions').upsert({
      workspace_id: workspaceId,
      stripe_customer_id: sub.customer as string,
      stripe_sub_id: sub.id,
      plan,
      status: sub.status,
      current_period_end: periodEndIso,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id' })

    if (error) console.error('[webhook] upsert error:', error.message)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(session.subscription as string)
          await upsertSubscription(sub)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await upsertSubscription(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const workspaceId = sub.metadata?.workspace_id
        if (workspaceId) {
          await getSupabase().from('subscriptions').update({
            plan: 'free',
            status: 'canceled',
            updated_at: new Date().toISOString(),
          }).eq('workspace_id', workspaceId)
        }
        break
      }
    }
  } catch (err) {
    console.error('[webhook] handler error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
