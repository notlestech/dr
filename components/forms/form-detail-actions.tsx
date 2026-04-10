'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishForm, deleteForm, closeForm } from '@/actions/forms'
import { Button } from '@/components/ui/button'
import { Globe, Trash2, Loader2, ExternalLink, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  formId: string
  status: string
  subdomain: string
}

export function FormDetailActions({ formId, status, subdomain }: Props) {
  const router = useRouter()
  const [isPub,   startPub]   = useTransition()
  const [isClose, startClose] = useTransition()
  const [isDel,   startDel]   = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handlePublish() {
    startPub(async () => {
      const res = await publishForm(formId)
      if ('error' in res && res.error) { toast.error(res.error); return }
      toast.success('Form is now live')
      router.refresh()
    })
  }

  function handleClose() {
    startClose(async () => {
      const res = await closeForm(formId)
      if ('error' in res && res.error) { toast.error(res.error); return }
      toast.success('Form closed')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    startDel(async () => { await deleteForm(formId) })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a href={`/f/${subdomain}`} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" />
          View form
        </Button>
      </a>

      {status === 'draft' && (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePublish} disabled={isPub}>
          {isPub ? <Loader2 className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
          Publish
        </Button>
      )}

      {status === 'active' && (
        <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground" onClick={handleClose} disabled={isClose}>
          {isClose ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
          Close form
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        className={`gap-1.5 transition-colors ${confirming ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'text-muted-foreground hover:text-destructive'}`}
        onClick={handleDelete}
        disabled={isDel}
        onBlur={() => setConfirming(false)}
      >
        {isDel ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        {confirming ? 'Confirm delete?' : 'Delete'}
      </Button>
    </div>
  )
}
