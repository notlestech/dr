'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { FormTemplateRenderer } from '@/components/form-templates'
import { Lock, ExternalLink, X } from 'lucide-react'
import type { PublicForm } from '@/types/app'

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

  function normalizeUrl(url: string | null | undefined): string {
    if (!url) return '#'
    return /^https?:\/\//i.test(url) ? url : `https://${url}`
  }

  const followLinks = form.fields.filter(f => f.type === 'follow_link')

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

      {/* Follow links banner */}
      {followLinks.length > 0 && (
        <div className="w-full bg-muted/60 border-b px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
            Follow to participate:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {followLinks.map(link => (
              <a
                key={link.id}
                href={normalizeUrl(link.placeholder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors"
              >
                <ExternalLink className="size-3" />
                {link.label || link.placeholder}
              </a>
            ))}
          </div>
        </div>
      )}

      <FormTemplateRenderer
        form={form}
        fields={form.fields}
        entryCount={entryCount}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
      />
    </div>
  )
}
