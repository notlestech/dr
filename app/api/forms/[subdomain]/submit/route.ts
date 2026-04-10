import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import crypto from 'crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const submitSchema = z.object({
  data: z.record(z.string(), z.string()),
  turnstileToken: z.string().optional(),
})

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  })
  const data = await res.json()
  return data.success === true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0'

  // Parse body
  let body: { data: Record<string, string>; turnstileToken?: string }
  try {
    const raw = await request.json()
    const parsed = submitSchema.safeParse(raw)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    body = parsed.data
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Get form
  const { data: form, error: formError } = await getSupabase()
    .from('forms')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('status', 'active')
    .single()

  if (formError || !form) {
    return NextResponse.json({ error: 'Form not found or not active' }, { status: 404 })
  }

  // Check scheduling
  const now = new Date()
  if (form.starts_at && new Date(form.starts_at) > now) {
    return NextResponse.json({ error: 'This form is not open yet' }, { status: 403 })
  }
  if (form.ends_at && new Date(form.ends_at) < now) {
    return NextResponse.json({ error: 'This form is now closed' }, { status: 403 })
  }

  // Verify Turnstile
  if (form.require_captcha && body.turnstileToken) {
    const valid = await verifyTurnstile(body.turnstileToken, ip)
    if (!valid) return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 403 })
  }

  // Check max entries
  if (form.max_entries) {
    const { count } = await getSupabase()
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', form.id)
      .eq('status', 'confirmed')
    if ((count ?? 0) >= form.max_entries) {
      return NextResponse.json({ error: 'Maximum entries reached' }, { status: 409 })
    }
  }

  // Duplicate check
  if (!form.allow_duplicates) {
    const emailValue = body.data.email || Object.values(body.data).find(v => v.includes('@'))
    const emailHash = emailValue ? hashValue(emailValue) : null
    const ipHash = hashValue(ip)

    if (emailHash) {
      const { data: existing } = await getSupabase()
        .from('entries')
        .select('id')
        .eq('form_id', form.id)
        .eq('email_hash', emailHash)
        .limit(1)
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: "You've already entered!" }, { status: 409 })
      }
    }

    const { data: ipExisting } = await getSupabase()
      .from('entries')
      .select('id')
      .eq('form_id', form.id)
      .eq('ip_hash', ipHash)
      .limit(1)
    if (ipExisting && ipExisting.length > 0) {
      return NextResponse.json({ error: "It looks like you've already entered from this device." }, { status: 409 })
    }
  }

  // Insert entry
  const emailValue = body.data.email || Object.values(body.data).find(v => v.includes('@'))
  const { error: insertError } = await getSupabase().from('entries').insert({
    form_id: form.id,
    data: body.data,
    ip_hash: hashValue(ip),
    email_hash: emailValue ? hashValue(emailValue) : null,
    status: form.require_confirmation ? 'pending' : 'confirmed',
    source: 'web',
  })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
