'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function UpgradeToast() {
  const params   = useSearchParams()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (params.get('upgraded') === '1') {
      toast.success('Welcome to Pro! Your plan has been upgraded.', { duration: 6000 })
      // Remove the query param without re-rendering
      router.replace(pathname, { scroll: false })
    }
  }, [])

  return null
}
