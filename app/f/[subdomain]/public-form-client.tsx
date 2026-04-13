'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { FormTemplateRenderer } from '@/components/form-templates'
import { Lock, ExternalLink, CheckCircle2, X } from 'lucide-react'
import type { PublicForm, FormField } from '@/types/app'

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return '#'
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

interface Props {
  form: PublicForm
  initialEntryCount: number
  embedded?: boolean
}

declare global {
  interface Window {
    __dvTurnstileToken?: string
    __dvTurnstileCallback?: (token: string) => void
    __dvTurnstileExpired?: () => void
  }
}

export function PublicFormClient({ form, initialEntryCount, embedded }: Props) {
  const [entryCount, setEntryCount]     = useState(initialEntryCount)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess]       = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const turnstileTokenRef               = useRef<string | null>(null)

  // Follow-link gate
  const followLinks: FormField[] = form.fields.filter(f => f.type === 'follow_link')
  const formFields                = form.fields.filter(f => f.type !== 'follow_link')
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const allFollowed = followLinks.length === 0 || followLinks.every(f => followedIds.has(f.id))

  function handleFollowClick(field: FormField) {
    window.open(normalizeUrl(field.placeholder), '_blank', 'noopener,noreferrer')
    setFollowedIds(prev => new Set([...prev, field.id]))
  }

  // Live entry count via Supabase Realtime
  useEffect(() => {
    if (!form.show_entry_count) return
    const supabase = createClient()
    const channel = supabase
      .channel(`form-entries-${form.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'entries', filter: `form_id=eq.${form.id}` },
        () => setEntryCount(c => c + 1))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [form.id, form.show_entry_count])

  // Set up Turnstile global callbacks
  useEffect(() => {
    if (!form.require_captcha) return
    window.__dvTurnstileCallback = (token: string) => {
      turnstileTokenRef.current = token
    }
    window.__dvTurnstileExpired = () => {
      turnstileTokenRef.current = null
    }
    return () => {
      delete window.__dvTurnstileCallback
      delete window.__dvTurnstileExpired
    }
  }, [form.require_captcha])

  const handleSubmit = useCallback(async (data: Record<string, string>) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const body: Record<string, unknown> = { data }

      if (form.require_captcha) {
        const token = turnstileTokenRef.current
        if (!token) {
          setError('Please complete the security check before submitting.')
          setIsSubmitting(false)
          return
        }
        body.turnstileToken = token
      }

      const res = await fetch(`/api/forms/${form.subdomain}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.')
        return
      }

      setIsSuccess(true)
      // Reset token after successful submission
      turnstileTokenRef.current = null
    } catch {
      setError('Network error — please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form.subdomain, form.require_captcha])

  if (form.status === 'closed') {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="text-center max-w-sm">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="size-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">{form.name}</h1>
          <p className="text-muted-foreground text-sm">
            Entries for this raffle are no longer being accepted.
          </p>
          {form.winners_page && (
            <a
              href={`/winners/${form.subdomain}`}
              className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:no-underline"
            >
              View draw results
            </a>
          )}
        </div>
      </div>
    )
  }

  // Follow gate — shown before the form when follow_link fields exist and not all clicked
  if (!allFollowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt={form.name} className="h-10 object-contain mx-auto" />
          )}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
            {form.description && (
              <p className="text-sm text-muted-foreground">{form.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Follow to participate:
            </p>
            <div className="flex flex-col gap-3">
              {followLinks.map(link => {
                const done = followedIds.has(link.id)
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleFollowClick(link)}
                    disabled={done}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      done
                        ? 'opacity-60 cursor-default bg-muted'
                        : 'bg-background hover:bg-muted active:scale-[0.98] cursor-pointer'
                    }`}
                  >
                    <span>{link.label || link.placeholder}</span>
                    {done
                      ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      : <ExternalLink className="size-4 shrink-0 text-muted-foreground" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Cloudflare Turnstile — compact widget anchored above safe area */}
      {form.require_captcha && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div
            className="cf-turnstile fixed z-50"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', right: '1rem' }}
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-callback="__dvTurnstileCallback"
            data-expired-callback="__dvTurnstileExpired"
            data-appearance="always"
            data-size="compact"
            data-theme="auto"
          />
        </>
      )}

      {/* Submission error banner — sticky, dismissible */}
      {error && (
        <div
          role="alert"
          className="sticky top-0 z-50 w-full bg-destructive text-destructive-foreground text-sm px-4 py-3 flex items-center justify-between gap-3"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <FormTemplateRenderer
        form={form}
        fields={formFields}
        entryCount={entryCount}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
      />
    </div>
  )
}
