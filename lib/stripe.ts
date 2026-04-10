import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

/** @deprecated use getStripe() */
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return (getStripe() as never)[prop]
  },
})

export const PLANS = {
  pro_monthly:      process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly:       process.env.STRIPE_PRICE_PRO_YEARLY!,
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
  business_yearly:  process.env.STRIPE_PRICE_BUSINESS_YEARLY!,
} as const

export type PlanKey = keyof typeof PLANS
