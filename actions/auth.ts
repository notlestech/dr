'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendSignupOtp(email: string, name: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: dbError } = await supabase
    .from('otp_codes')
    .upsert({ email, code, expires_at: expiresAt, used: false }, { onConflict: 'email' })

  if (dbError) return { error: 'Failed to create verification code' }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your DrawVault verification code',
      html: `
        <div style="background:#09090b;font-family:system-ui,sans-serif;padding:40px 20px;max-width:560px;margin:0 auto">
          <h2 style="color:#fafafa;text-align:center;margin:0 0 8px">Verify your email</h2>
          <p style="color:#a1a1aa;text-align:center;margin:0 0 32px">Hi ${name}, enter this code to activate your DrawVault account:</p>
          <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:32px;text-align:center;margin:0 0 32px">
            <p style="color:#fafafa;font-size:48px;font-weight:700;letter-spacing:0.35em;margin:0;font-family:monospace">${code}</p>
            <p style="color:#52525b;font-size:13px;margin:12px 0 0">Expires in 10 minutes</p>
          </div>
          <p style="color:#52525b;font-size:12px;text-align:center;margin:0">If you didn't sign up for DrawVault, you can safely ignore this email.</p>
        </div>
      `,
    })
  } catch {
    return { error: 'Failed to send verification email — check your Resend configuration' }
  }

  return {}
}

export async function resendSignupOtp(email: string, name: string): Promise<{ error?: string }> {
  return sendSignupOtp(email, name)
}

export async function verifyOtpAndCreateAccount(
  email: string,
  code: string,
  password: string,
  fullName: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('otp_codes')
    .select()
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return { error: 'Invalid or expired code. Check your email or request a new code.' }

  // Mark code as used
  await supabase.from('otp_codes').update({ used: true }).eq('email', email)

  // Create confirmed user via admin API
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createError) {
    if (createError.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: createError.message }
  }

  const userId = created.user.id

  // Provision workspace, profile, and free subscription
  const workspaceName = fullName ? `${fullName.split(' ')[0]}'s Workspace` : 'My Workspace'
  const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
  const suffix = Math.random().toString(36).slice(2, 7)
  const workspaceSlug = `${baseSlug}-${suffix}`

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: workspaceName, slug: workspaceSlug })
    .select('id')
    .single()

  if (wsError || !workspace) {
    // Clean up the created auth user so the user can retry
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Failed to create workspace. Please try again.' }
  }

  // Create workspace member, profile, and free subscription in parallel
  const [memberRes, profileRes, subRes] = await Promise.all([
    supabase.from('workspace_members').upsert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'owner',
    }, { onConflict: 'workspace_id,user_id' }),
    supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
    }),
    supabase.from('subscriptions').upsert({
      workspace_id: workspace.id,
      plan: 'free',
    }, { onConflict: 'workspace_id' }),
  ])

  if (memberRes.error || profileRes.error || subRes.error) {
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Failed to set up account. Please try again.' }
  }

  return {}
}
