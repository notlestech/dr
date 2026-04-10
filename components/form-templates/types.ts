import type { PublicForm, FormField } from '@/types/app'

export interface FormTemplateProps {
  form: PublicForm
  fields: FormField[]
  entryCount: number
  onSubmit: (data: Record<string, string>) => Promise<void>
  isSubmitting: boolean
  isSuccess: boolean
}
