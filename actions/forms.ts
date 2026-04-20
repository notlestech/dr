'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { formWizardSchema } from '@/lib/validations/form'
import type { FormWizardValues } from '@/lib/validations/form'

export async function createForm(values: FormWizardValues) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = formWizardSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'No workspace found' }

  const wid = membership.workspace_id

  // Resolve plan and enforce free-plan limits
  const [{ data: sub }, { data: ws }] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('workspace_id', wid).maybeSingle(),
    supabase.from('workspaces').select('forms_created_total').eq('id', wid).single(),
  ])
  const plan = sub?.plan ?? 'free'

  if (plan === 'free') {
    // Hard lifetime cap: 3 forms total (including deleted)
    if ((ws?.forms_created_total ?? 0) >= 3) {
      return { error: 'Free plan allows up to 3 forms total. Upgrade to create more.' }
    }
    // Rate limit: 1 new form per 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('forms')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', wid)
      .gte('created_at', oneWeekAgo)
    if ((recentCount ?? 0) >= 1) {
      return { error: 'Free plan allows 1 new form per week. Upgrade for unlimited form creation.' }
    }
  }

  // Check subdomain availability
  const { data: existing } = await supabase
    .from('forms')
    .select('id')
    .eq('subdomain', parsed.data.subdomain)
    .single()

  if (existing) return { error: 'This subdomain is already taken' }

  // Free plan overrides: cap max_entries at 500, fix ends_at to 30 days, giveaway type only
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const endsAt   = plan === 'free' ? thirtyDaysOut          : (parsed.data.ends_at || null)
  const maxEntries = plan === 'free' ? 500                  : (parsed.data.max_entries ?? null)
  const raffleType = plan === 'free' ? 'giveaway'           : parsed.data.raffle_type

  const { data: form, error } = await supabase
    .from('forms')
    .insert({
      workspace_id: wid,
      name: parsed.data.name,
      description: parsed.data.description || null,
      subdomain: parsed.data.subdomain,
      template: parsed.data.template,
      raffle_type: raffleType,
      draw_theme: parsed.data.draw_theme,
      accent_color: parsed.data.accent_color,
      logo_url: parsed.data.logo_url || null,
      fields: parsed.data.fields,
      starts_at: parsed.data.starts_at || null,
      ends_at: endsAt,
      max_entries: maxEntries,
      allow_duplicates: parsed.data.allow_duplicates,
      require_captcha: parsed.data.require_captcha,
      social_sharing: parsed.data.social_sharing,
      show_entry_count: parsed.data.show_entry_count,
      winners_page: parsed.data.winners_page,
      require_confirmation: parsed.data.require_confirmation,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Increment lifetime counter
  await supabase
    .from('workspaces')
    .update({ forms_created_total: (ws?.forms_created_total ?? 0) + 1 })
    .eq('id', wid)

  return { formId: form.id, subdomain: form.subdomain }
}

/** Returns the caller's workspace_id, or null if unauthenticated / no workspace. */
async function getCallerWorkspaceId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()
  return membership?.workspace_id ?? null
}

export async function publishForm(formId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = await getCallerWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('forms')
    .update({ status: 'active' })
    .eq('id', formId)
    .eq('workspace_id', workspaceId)   // ownership check

  if (error) return { error: error.message }
  revalidatePath('/forms')
  revalidatePath(`/forms/${formId}`)
  return { success: true }
}

export async function closeForm(formId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = await getCallerWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('forms')
    .update({ status: 'closed' })
    .eq('id', formId)
    .eq('workspace_id', workspaceId)   // ownership check

  if (error) return { error: error.message }
  revalidatePath('/forms')
  revalidatePath(`/forms/${formId}`)
  return { success: true }
}

export async function reopenForm(formId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = await getCallerWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('forms')
    .update({ status: 'active' })
    .eq('id', formId)
    .eq('workspace_id', workspaceId)   // ownership check

  if (error) return { error: error.message }
  revalidatePath('/forms')
  revalidatePath(`/forms/${formId}`)
  return { success: true }
}

export async function deleteForm(formId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = await getCallerWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Not authorized' }

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)
    .eq('workspace_id', workspaceId)   // ownership check

  if (error) return { error: error.message }
  redirect('/forms')
}
