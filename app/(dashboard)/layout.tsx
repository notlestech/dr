import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdBanner } from '@/components/dashboard/ad-banner'
import { DashboardFooter } from '@/components/dashboard/dashboard-footer'
import type { Plan } from '@/types/app'
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

async function provisionWorkspace(userId: string, email: string): Promise<string | null> {
  const admin = createAdminClient()
  const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
  // Append random suffix to avoid unique constraint conflicts from partial prior attempts
  const suffix = Math.random().toString(36).slice(2, 7)
  const slug = `${baseSlug}-${suffix}`

  const { data: workspace, error: wsError } = await admin
    .from('workspaces')
    .insert({ name: 'My Workspace', slug, owner_id: userId })
    .select('id')
    .single()

  if (wsError || !workspace) {
    const msg = `workspace_insert: ${wsError?.message ?? 'unknown'}`
    console.error('[provisionWorkspace]', msg)
    return msg
  }

  const [memberRes, profileRes, subRes] = await Promise.all([
    admin.from('workspace_members').upsert({ workspace_id: workspace.id, user_id: userId, role: 'owner' }, { onConflict: 'workspace_id,user_id' }),
    admin.from('profiles').upsert({ id: userId, full_name: null }),
    admin.from('subscriptions').upsert({ workspace_id: workspace.id, plan: 'free' }, { onConflict: 'workspace_id' }),
  ])

  const secondaryErr = memberRes.error ?? profileRes.error ?? subRes.error
  if (secondaryErr) {
    const msg = `member_insert: ${secondaryErr.message}`
    console.error('[provisionWorkspace]', msg)
    return msg
  }

  return null
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user) {
    console.error('[dashboard/layout] getUser returned null — error:', userError?.message)
    redirect('/login')
  }

  console.log('[dashboard/layout] user found:', user.email)
  let data = await getLayoutData(user.id)

  // Workspace missing — provision one on-demand (accounts created before the
  // signup fix, or where the signup workspace creation failed)
  if (!data) {
    console.log('[dashboard/layout] no workspace found — provisioning for:', user.email)
    const provisionErr = await provisionWorkspace(user.id, user.email ?? '')
    if (provisionErr) {
      console.error('[dashboard/layout] provisionWorkspace failed for:', user.email, provisionErr)
      redirect(`/login?cb_error=${encodeURIComponent('Provision failed: ' + provisionErr)}`)
    }
    data = await getLayoutData(user.id)
    if (!data) {
      console.error('[dashboard/layout] getLayoutData still null after provision for:', user.email)
      redirect(`/login?cb_error=${encodeURIComponent('Workspace not found after provision')}`)
    }
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
        <main id="main-content" className="flex flex-1 pb-20 md:pb-0">
          {/* Left ad column — only on wide screens, free plan only */}
          <div className="ads hidden 2xl:flex flex-col items-center pt-10 px-2 w-[180px] shrink-0">
            <div className="sticky top-10 w-full">
              <AdBanner plan={plan as Plan} slot="8572604713" />
            </div>
          </div>

          {/* Center content */}
          <div className="flex flex-1 flex-col min-w-0">
            {children}
            <DashboardFooter plan={plan as Plan} />
          </div>

          {/* Right ad column — only on wide screens, free plan only */}
          <div className="ads hidden 2xl:flex flex-col items-center pt-10 px-2 w-[180px] shrink-0">
            <div className="sticky top-10 w-full">
              <AdBanner plan={plan as Plan} slot="8572604713" />
            </div>
          </div>
        </main>
      </SidebarInset>
      <MobileNav plan={plan} />
    </SidebarProvider>
  )
}
