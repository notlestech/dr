'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthDebugPage() {
  const [info, setInfo] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data, error }) => {
      setInfo({
        hasSession: !!data.session,
        userEmail: data.session?.user?.email ?? null,
        userId: data.session?.user?.id ?? null,
        error: error?.message ?? null,
        cookieCount: document.cookie.split(';').filter(Boolean).length,
        url: window.location.href,
      })
    })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '14px' }}>
      <h1>Auth Debug</h1>
      {info ? (
        <pre style={{ background: '#111', color: '#0f0', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
          {JSON.stringify(info, null, 2)}
        </pre>
      ) : (
        <p>Loading…</p>
      )}
      <p style={{ marginTop: '1rem' }}>
        <a href="/dashboard" style={{ color: 'blue' }}>→ Go to dashboard</a>
        {' | '}
        <a href="/login" style={{ color: 'blue' }}>→ Go to login</a>
      </p>
    </div>
  )
}
