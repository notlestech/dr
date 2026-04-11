'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { LogOut, CreditCard, User, Sparkles, Zap, Crown } from 'lucide-react'

const PLAN_META = {
  free:     { label: 'Free',     icon: Sparkles, badge: 'bg-muted text-muted-foreground border-border',                        desc: 'You\'re on the Free plan.' },
  pro:      { label: 'Pro',      icon: Zap,       badge: 'bg-violet-500/15 text-violet-500 border-violet-500/30 font-semibold', desc: 'You\'re on the Pro plan.' },
  business: { label: 'Business', icon: Crown,      badge: 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-semibold',   desc: 'You\'re on the Business plan.' },
}

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState('')
  const [plan, setPlan] = useState<'free' | 'pro' | 'business'>('free')
  const [saving, setSaving] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      setUserId(user.id)

      const [{ data: profile }, { data: membership }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).single(),
      ])
      if (profile) setFullName(profile.full_name ?? '')
      if (membership) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('workspace_id', membership.workspace_id)
          .maybeSingle()
        if (sub?.plan) setPlan(sub.plan as 'free' | 'pro' | 'business')
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = (fullName || email || 'U').slice(0, 2).toUpperCase()
  const planMeta = PLAN_META[plan]
  const PlanIcon = planMeta.icon
  const hasBilling = plan !== 'free'

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
    setSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function openBillingPortal() {
    setBillingLoading(true)
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: window.location.href }),
    })
    const { url, error } = await res.json()
    if (error) {
      toast.error('Could not open billing portal. Please try again or contact support.')
      setBillingLoading(false)
      return
    }
    window.location.href = url
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and billing</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{fullName || 'No name set'}</p>
                <Badge className={`text-[10px] px-1.5 py-0 border ${planMeta.badge}`}>
                  <PlanIcon className="size-2.5 mr-0.5" />{planMeta.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                className="max-w-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="max-w-sm opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Billing</CardTitle>
              <CardDescription>Manage your subscription and payment method</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasBilling ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                View invoices, update your payment method, or cancel your subscription from the billing portal.
              </p>
              <Button variant="outline" onClick={openBillingPortal} disabled={billingLoading} className="gap-2">
                <CreditCard className="size-4" />
                {billingLoading ? 'Opening...' : 'Open Billing Portal'}
              </Button>
            </>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  You&apos;re on the <strong>Free plan</strong>. Upgrade to Pro or Business to unlock unlimited forms, all templates, analytics, and more.
                </p>
              </div>
              <Link href="/upgrade">
                <Button size="sm" className="gap-1.5 shrink-0">
                  <Zap className="size-3.5" /> Upgrade
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card className="border-destructive/20">
        <CardContent className="pt-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
            <LogOut className="size-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
