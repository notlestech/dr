'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Layers, Settings, Sparkles } from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/forms', label: 'Forms', icon: Layers },
  { href: '/upgrade', label: 'Upgrade', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav({ plan }: { plan: string }) {
  const pathname = usePathname()

  const tabs = plan === 'business' ? TABS.filter(t => t.href !== '/upgrade') : TABS

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t flex items-center justify-around px-2 pb-safe">
      {tabs.map(tab => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center gap-1 py-3 px-4 text-xs transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
