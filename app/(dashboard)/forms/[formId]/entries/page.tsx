import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntriesTable } from '@/components/entries/entries-table'
import type { Form, Entry } from '@/types/app'

interface Props { params: Promise<{ formId: string }> }

export default async function EntriesPage({ params }: Props) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase.from('forms').select('*').eq('id', formId).single()
  if (!form) notFound()

  const { data: entries, count: totalCount } = await supabase
    .from('entries')
    .select('*', { count: 'exact' })
    .eq('form_id', formId)
    .order('entered_at', { ascending: false })
    .limit(5000)

  const total = totalCount ?? (entries ?? []).length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entries</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total.toLocaleString()} entries for {(form as Form).name}</p>
      </div>
      <EntriesTable form={form as Form} entries={(entries ?? []) as Entry[]} totalCount={total} />
    </div>
  )
}
