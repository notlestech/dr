'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href: string
  label?: string
}

export function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1 mb-6 group"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  )
}
