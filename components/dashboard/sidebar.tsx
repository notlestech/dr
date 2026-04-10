'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Layers, Settings, Sparkles, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import type { Workspace } from '@/types/app'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/forms', label: 'Forms', icon: Layers },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  workspace: Workspace
  plan: string
}

export function Sidebar({ workspace, plan }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar border-r py-5 px-3 fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-sm shrink-0">
          <Trophy className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm">DrawVault</span>
      </div>

      {/* Workspace badge */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-foreground truncate font-medium">{workspace.name}</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA */}
      {plan !== 'business' && (
        <div className="px-3 mb-4">
          <Link href="/upgrade">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Business'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Unlock unlimited forms & templates</p>
            </div>
          </Link>
        </div>
      )}

      {/* Sign out */}
      <div className="px-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
