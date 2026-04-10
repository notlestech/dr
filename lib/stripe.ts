import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export const PLANS = {
  pro_monthly:      process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly:       process.env.STRIPE_PRICE_PRO_YEARLY!,
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
  business_yearly:  process.env.STRIPE_PRICE_BUSINESS_YEARLY!,
} as const

export type PlanKey = keyof typeof PLANS
