import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { PlanAccentBg } from '@/components/dashboard/plan-accent-bg'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
} from '@/components/ui/breadcrumb'

async function getLayoutData(userId: string) {
  const supabase = await createClient()

  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces(*)')
      .eq('user_id', userId)
      .limit(1)
      .single(),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
  ])

  if (!membership) return null

  const workspace = (membership.workspaces as any) as {
    id: string; name: string; slug: string; logo_url: string | null
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('workspace_id', workspace.id)
    .maybeSingle()

  return { workspace, plan: sub?.plan ?? 'free', fullName: profile?.full_name ?? null }
}

async function provisionWorkspace(userId: string, email: string) {
  const admin = createAdminClient()
  const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

  const { data: workspace } = await admin
    .from('workspaces')
    .insert({ name: 'My Workspace', slug })
    .select('id')
    .single()

  if (!workspace) return false

  await Promise.all([
    admin.from('workspace_members').insert({ workspace_id: workspace.id, user_id: userId, role: 'owner' }),
    admin.from('profiles').upsert({ id: userId, full_name: null }),
    admin.from('subscriptions').insert({ workspace_id: workspace.id, plan: 'free' }),
  ])

  return true
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let data = await getLayoutData(user.id)

  // Workspace missing — provision one on-demand (accounts created before the
  // signup fix, or where the signup workspace creation failed)
  if (!data) {
    const ok = await provisionWorkspace(user.id, user.email ?? '')
    if (!ok) redirect('/login')
    data = await getLayoutData(user.id)
    if (!data) redirect('/login')
  }

  const { workspace, plan, fullName } = data

  return (
    <SidebarProvider>
      {/* Skip to main content — keyboard / screen reader shortcut */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:outline-none"
      >
        Skip to main content
      </a>
      <PlanAccentBg plan={plan} />
      <AppSidebar
        workspace={workspace}
        plan={plan}
        userEmail={user.email}
        userName={fullName ?? undefined}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">DrawVault</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ThemeToggle />
        </header>
        <main id="main-content" className="flex flex-1 flex-col pb-20 md:pb-0">
          {children}
        </main>
      </SidebarInset>
      <MobileNav plan={plan} />
    </SidebarProvider>
  )
}
