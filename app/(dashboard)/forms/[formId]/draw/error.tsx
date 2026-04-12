'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DrawError({ error, reset }: Props) {
  const router = useRouter()

  useEffect(() => {
    console.error('[DrawError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Draw failed to load</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={reset} variant="outline" size="sm">Try again</Button>
        <Button onClick={() => router.back()} variant="ghost" size="sm">Go back</Button>
      </div>
    </div>
  )
}
