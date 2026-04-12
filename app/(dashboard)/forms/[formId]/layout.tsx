import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Security layout — runs on every /forms/[formId]/* route.
 * Verifies the signed-in user belongs to the workspace that owns this form
 * before any child page renders. Returns 404 (not 401) to avoid leaking
 * whether a form ID exists.
 */
export default async function FormLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  // A single lightweight check: does this form belong to the user's workspace?
  const { data: form } = await supabase
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('workspace_id', membership.workspace_id)
    .maybeSingle()

  if (!form) notFound()

  return <>{children}</>
}
