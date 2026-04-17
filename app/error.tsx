'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global error boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
      <div className="size-14 rounded-2xl bg-foreground flex items-center justify-center">
        <Trophy className="size-7 text-background" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          An unexpected error occurred. Try refreshing the page.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => reset()}>Try again</Button>
        <a href="/dashboard"><Button>Dashboard</Button></a>
      </div>
    </div>
  )
}
