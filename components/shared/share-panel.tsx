'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  subdomain: string
  formName: string
  isPro?: boolean
}

export function SharePanel({ subdomain, formName, isPro }: Props) {
  const [copied, setCopied] = useState(false)
  const url = isPro
    ? `https://${subdomain}.drawvault.site`
    : `${process.env.NEXT_PUBLIC_APP_URL}/f/${subdomain}`

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const tweetText = encodeURIComponent(`Enter ${formName} → ${url}`)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 min-w-0 flex-1 bg-muted border rounded-lg px-3 py-2">
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground truncate font-mono">{url}</span>
      </div>
      <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>
      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </a>
    </div>
  )
}
