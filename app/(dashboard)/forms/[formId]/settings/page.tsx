'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { Form } from '@/types/app'
import { use } from 'react'

interface Props { params: Promise<{ formId: string }> }

export default function FormSettingsPage({ params }: Props) {
  const { formId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<Form | null>(null)
  const [savedForm, setSavedForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    supabase.from('forms').select('*').eq('id', formId).single().then(({ data }) => {
      setForm(data as Form)
      setSavedForm(data as Form)
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm)

  function validateWebhookUrl(url: string | null): string | null {
    if (!url) return null
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:') return 'Webhook URL must use HTTPS'
      const blocked = /^(localhost|127\.|0\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/i
      if (blocked.test(parsed.hostname)) return 'Webhook URL cannot point to a private or local address'
    } catch {
      return 'Webhook URL is not a valid URL'
    }
    return null
  }

  async function save() {
    if (!form) return
    const webhookErr = validateWebhookUrl(form.webhook_url)
    if (webhookErr) { toast.error(webhookErr); return }
    setSaving(true)
    const { error } = await supabase.from('forms').update({
      name: form.name,
      description: form.description,
      accent_color: form.accent_color,
      max_entries: form.max_entries,
      allow_duplicates: form.allow_duplicates,
      social_sharing: form.social_sharing,
      show_entry_count: form.show_entry_count,
      winners_page: form.winners_page,
      webhook_url: form.webhook_url,
      updated_at: new Date().toISOString(),
    }).eq('id', formId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Settings saved')
      setSavedForm(form)
    }
    setSaving(false)
  }

  async function deleteForm() {
    setDeleting(true)
    await supabase.from('forms').delete().eq('id', formId)
    toast.success('Form deleted')
    router.push('/forms')
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (!form) return <div className="p-6 text-muted-foreground text-sm">Form not found</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Form Settings</h1>

      {/* Basic info */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Info</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Form Name</Label>
            <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accent">Accent Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" id="accent" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              <Input value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="font-mono w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Entry settings */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Entry Settings</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="max">Max Entries (leave blank for unlimited)</Label>
            <Input id="max" type="number" value={form.max_entries ?? ''} onChange={e => setForm({ ...form, max_entries: e.target.value ? Number(e.target.value) : null })} className="w-40" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-foreground">Allow Duplicate Entries</p>
              <p className="text-xs text-muted-foreground">Allow same email to enter multiple times</p>
            </div>
            <Switch checked={form.allow_duplicates} onCheckedChange={v => setForm({ ...form, allow_duplicates: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-foreground">Show Entry Count</p>
              <p className="text-xs text-muted-foreground">Display live entry count on public form</p>
            </div>
            <Switch checked={form.show_entry_count} onCheckedChange={v => setForm({ ...form, show_entry_count: v })} />
          </div>
        </div>
      </div>

      {/* Sharing */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sharing</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-foreground">Social Sharing Buttons</p>
              <p className="text-xs text-muted-foreground">Show Twitter/WhatsApp share buttons on public form</p>
            </div>
            <Switch checked={form.social_sharing} onCheckedChange={v => setForm({ ...form, social_sharing: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-foreground">Public Winners Page</p>
              <p className="text-xs text-muted-foreground">Allow anyone to see draw history at /winners/{form.subdomain}</p>
            </div>
            <Switch checked={form.winners_page} onCheckedChange={v => setForm({ ...form, winners_page: v })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="webhook">Webhook URL (Business)</Label>
            <Input id="webhook" value={form.webhook_url ?? ''} onChange={e => setForm({ ...form, webhook_url: e.target.value || null })} placeholder="https://your-server.com/webhook" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || !isDirty}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {isDirty && <span className="text-xs text-muted-foreground">You have unsaved changes</span>}
      </div>

      {/* Danger zone */}
      <div className="border border-red-500/20 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-red-400">Danger Zone</h2>
        <p className="text-xs text-muted-foreground">Deleting a form permanently removes all entries, draws, and analytics. This cannot be undone.</p>
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="outline" disabled={deleting} className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2" />}
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Form'}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{form.name}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the form and all its entries, draws, and analytics. There is no way to recover this data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteForm}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              >
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
