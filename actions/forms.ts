'use server'

import { redirect } from 'next/navigation'
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

  // Check subdomain availability
  const { data: existing } = await supabase
    .from('forms')
    .select('id')
    .eq('subdomain', parsed.data.subdomain)
    .single()

  if (existing) return { error: 'This subdomain is already taken' }

  const { data: form, error } = await supabase
    .from('forms')
    .insert({
      workspace_id: membership.workspace_id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      subdomain: parsed.data.subdomain,
      template: parsed.data.template,
      raffle_type: parsed.data.raffle_type,
      draw_theme: parsed.data.draw_theme,
      accent_color: parsed.data.accent_color,
      logo_url: parsed.data.logo_url || null,
      fields: parsed.data.fields,
      starts_at: parsed.data.starts_at || null,
      ends_at: parsed.data.ends_at || null,
      max_entries: parsed.data.max_entries ?? null,
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

  return { formId: form.id, subdomain: form.subdomain }
}

export async function publishForm(formId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('forms')
    .update({ status: 'active' })
    .eq('id', formId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function closeForm(formId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('forms').update({ status: 'closed' }).eq('id', formId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteForm(formId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('forms').delete().eq('id', formId)
  if (error) return { error: error.message }
  redirect('/forms')
}
