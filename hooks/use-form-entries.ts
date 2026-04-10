'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Entry } from '@/types/app'

export function useFormEntries(formId: string) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('form_id', formId)
        .order('entered_at', { ascending: false })
      setEntries((data ?? []) as Entry[])
      setLoading(false)
    }

    load()

    // Real-time subscription
    const channel = supabase
      .channel(`entries:${formId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'entries',
        filter: `form_id=eq.${formId}`,
      }, (payload) => {
        setEntries(prev => [payload.new as Entry, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [formId])

  return { entries, loading }
}
