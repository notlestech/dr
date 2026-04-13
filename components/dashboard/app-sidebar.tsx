'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Layers, Settings, ChevronsUpDown,
  LogOut, Trophy, Plus, Sparkles, CreditCard,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  SidebarMenuAction,
} from '@/components/ui/sidebar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/types/app'

const NAV_MAIN = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Forms', url: '/forms', icon: Layers },
]

const NAV_SECONDARY = [
  { title: 'Billing',  url: '/billing',  icon: CreditCard },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Upgrade',  url: '/upgrade',  icon: Sparkles },
]

const PLAN_BADGE: Record<Plan, { label: string; className: string; headerClass: string; nameClass: string }> = {
  free:     { label: 'Free',     className: 'bg-muted text-muted-foreground border-border',                        headerClass: '',                              nameClass: '' },
  pro:      { label: 'Pro',      className: 'bg-violet-500/15 text-violet-500 border-violet-500/30 font-semibold', headerClass: 'border-b border-violet-500/20', nameClass: 'text-violet-500' },
  business: { label: 'Business', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-semibold',    headerClass: 'border-b border-amber-500/20',  nameClass: 'text-amber-500' },
}

interface Props {
  workspace: { name: string; logo_url: string | null }
  plan: string
  userEmail?: string
  userName?: string
}

export function AppSidebar({ workspace, plan, userEmail, userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const planInfo = PLAN_BADGE[plan as Plan] ?? PLAN_BADGE.free
  const initials = (userName || userEmail || 'U').slice(0, 2).toUpperCase()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={planInfo.headerClass}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Trophy className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">DrawVault</span>
                <span className="truncate text-xs text-muted-foreground">{workspace.name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url + '/'))}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.url === '/forms' && (
                    <SidebarMenuAction render={<Link href="/forms/new" title="New Form" />}>
                      <Plus className="size-4" />
                    </SidebarMenuAction>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_SECONDARY.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className={`truncate font-medium ${planInfo.nameClass}`}>{userName || 'My Account'}</span>
                      <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                    <Badge className={`text-[10px] border px-1.5 py-0 ml-auto shrink-0 ${planInfo.className}`}>
                      {planInfo.label}
                    </Badge>
                    <ChevronsUpDown className="ml-1 size-4 shrink-0" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem onClick={signOut} variant="destructive">
                  <LogOut className="mr-2 size-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
