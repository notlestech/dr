'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishForm, deleteForm } from '@/actions/forms'
import { Button } from '@/components/ui/button'
import { Globe, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  formId: string
  status: string
}

export function FormRowActions({ formId, status }: Props) {
  const router = useRouter()
  const [isPub, startPub]  = useTransition()
  const [isDel, startDel]  = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handlePublish() {
    startPub(async () => {
      const res = await publishForm(formId)
      if ('error' in res && res.error) { toast.error(res.error); return }
      toast.success('Form published')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    startDel(async () => {
      await deleteForm(formId)
      // deleteForm redirects to /forms automatically
    })
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {status === 'draft' && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs gap-1.5"
          onClick={handlePublish}
          disabled={isPub}
        >
          {isPub ? <Loader2 className="size-3 animate-spin" /> : <Globe className="size-3" />}
          Publish
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className={`h-7 px-2.5 text-xs gap-1.5 transition-colors ${confirming ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'text-muted-foreground hover:text-destructive'}`}
        onClick={handleDelete}
        disabled={isDel}
        onBlur={() => setConfirming(false)}
      >
        {isDel ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
        {confirming ? 'Confirm?' : 'Delete'}
      </Button>
    </div>
  )
}
