'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  async function open() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: window.location.href }),
    })
    const { url, error } = await res.json()
    if (error) {
      toast.error('Could not open billing portal. Please try again.')
      setLoading(false)
      return
    }
    window.location.href = url
  }

  return (
    <Button variant="outline" size="sm" onClick={open} disabled={loading} className="gap-1.5 shrink-0">
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <CreditCard className="size-3.5" />}
      {loading ? 'Opening...' : 'Manage billing'}
    </Button>
  )
}
