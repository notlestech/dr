'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FormError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[FormError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-4">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">Try again</Button>
    </div>
  )
}
