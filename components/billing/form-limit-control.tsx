'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Pencil, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  formId: string
  currentLimit: number | null
  planMax: number | null  // null = unlimited
}

export function FormLimitControl({ formId, currentLimit, planMax }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentLimit?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    const num = value === '' ? null : parseInt(value, 10)
    if (num !== null && (isNaN(num) || num < 1)) {
      toast.error('Enter a valid number or leave blank for no limit')
      return
    }
    if (planMax && num !== null && num > planMax) {
      toast.error(`Your plan allows a max of ${planMax.toLocaleString()} entries per form`)
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('forms')
      .update({ max_entries: num })
      .eq('id', formId)
    setSaving(false)
    if (error) { toast.error('Failed to update limit'); return }
    toast.success(num ? `Limit set to ${num.toLocaleString()}` : 'Limit removed')
    setEditing(false)
  }

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditing(true)}
        className="gap-1.5 text-xs text-muted-foreground shrink-0"
      >
        <Pencil className="size-3" />
        {currentLimit ? `Limit: ${currentLimit.toLocaleString()}` : 'Set limit'}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Input
        type="number"
        min={1}
        max={planMax ?? undefined}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={planMax ? `Max ${planMax.toLocaleString()}` : 'Unlimited'}
        className="h-7 w-28 text-xs"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
      />
      <Button size="icon" variant="ghost" className="size-7" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3 text-emerald-500" />}
      </Button>
      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(false)}>
        <X className="size-3" />
      </Button>
    </div>
  )
}
