import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { render } from '@react-email/components'
import { WinnerNotificationEmail } from '@/emails/winner-notification'
import { getResend, FROM_EMAIL } from '@/lib/resend'
import type { FormField } from '@/types/app'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  // Auth: verify the caller is a signed-in user
  const supabaseUser = await createServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { formId: string; entryId: string }
  try {
    body = await request.json()
    if (!body.formId || !body.entryId) throw new Error('Missing fields')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const service = getServiceClient()

  // Verify the user owns this form (via workspace membership)
  const { data: membership } = await supabaseUser
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  const { data: form } = await service
    .from('forms')
    .select('id, name, subdomain, accent_color, logo_url, fields, webhook_url, workspace_id')
    .eq('id', body.formId)
    .single()

  if (!form || (membership && form.workspace_id !== membership.workspace_id)) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  // Get entry
  const { data: entry } = await service
    .from('entries')
    .select('id, data')
    .eq('id', body.entryId)
    .eq('form_id', body.formId)
    .single()

  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  // Create draw record
  const { data: draw, error: drawError } = await service
    .from('draws')
    .insert({ form_id: body.formId, drawn_by: user.id, winner_count: 1 })
    .select()
    .single()

  if (drawError) return NextResponse.json({ error: 'Failed to save draw' }, { status: 500 })

  // Mark entry as winner
  await service
    .from('entries')
    .update({ is_winner: true, draw_id: draw.id })
    .eq('id', body.entryId)

  // --- Winner email notification ---
  try {
    const fields = (form.fields ?? []) as FormField[]
    const entryData = entry.data as Record<string, string>

    // Find email value: first look for field with type=email, then any @-containing value
    const emailField = fields.find(f => f.type === 'email')
    const winnerEmail = emailField
      ? entryData[emailField.id]
      : Object.values(entryData).find(v => typeof v === 'string' && v.includes('@'))

    if (winnerEmail) {
      // Build display name: first text/name field, or the email itself
      const nameField = fields.find(f =>
        f.type === 'text' && (f.label.toLowerCase().includes('name') || f.id === 'name')
      )
      const winnerName = (nameField ? entryData[nameField.id] : null)
        || entryData['name']
        || winnerEmail.split('@')[0]

      // Get workspace name for the email footer
      const { data: workspace } = await service
        .from('workspaces')
        .select('name')
        .eq('id', form.workspace_id)
        .single()

      const formUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://drawvault.site'}/winners/${form.subdomain}`

      const html = await render(
        WinnerNotificationEmail({
          formName: form.name,
          winnerName,
          winnerEmail,
          formUrl,
          accentColor: form.accent_color,
          logoUrl: form.logo_url,
          workspaceName: workspace?.name ?? 'DrawVault',
        })
      )

      await getResend().emails.send({
        from: FROM_EMAIL,
        to: winnerEmail,
        subject: `🏆 You won ${form.name}!`,
        html,
      })
    }
  } catch (emailErr) {
    // Email failure does not fail the draw save
    console.error('[draws/save] email error:', emailErr)
  }

  // --- Webhook notification ---
  if (form.webhook_url) {
    const payload = {
      event: 'draw.winner',
      form: { id: form.id, name: form.name, subdomain: form.subdomain },
      draw: { id: draw.id, drawn_at: draw.drawn_at },
      entry: { id: entry.id },
      timestamp: new Date().toISOString(),
    }
    fetch(form.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'DrawVault-Webhook/1.0' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    }).catch(() => { /* Webhook failures are silent */ })
  }

  return NextResponse.json({ success: true, drawId: draw.id })
}
