import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
      <div className="size-14 rounded-2xl bg-foreground flex items-center justify-center">
        <Trophy className="size-7 text-background" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="text-lg font-medium">Page not found</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          This page doesn&apos;t exist, or the giveaway you&apos;re looking for has been removed.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
