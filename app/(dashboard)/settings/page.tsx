'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { LogOut, CreditCard, User } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      setUserId(user.id)
      supabase.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
        if (data) setFullName(data.full_name ?? '')
      })
    })
  }, [])

  const initials = (fullName || email || 'U').slice(0, 2).toUpperCase()

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
    if (error) { toast.error(error); setBillingLoading(false); return }
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
              <p className="text-sm font-medium">{fullName || 'No name set'}</p>
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
          <p className="text-sm text-muted-foreground mb-4">
            View invoices, update your payment method, or cancel your subscription from the billing portal.
          </p>
          <Button variant="outline" onClick={openBillingPortal} disabled={billingLoading} className="gap-2">
            <CreditCard className="size-4" />
            {billingLoading ? 'Opening...' : 'Open Billing Portal'}
          </Button>
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
