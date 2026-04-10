'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function CleanTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8">
          {/* Logo */}
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt={form.name} className="h-10 object-contain mb-6" />
          )}

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-sm text-zinc-500 mb-6">{form.description}</p>
          )}

          {/* Entry count */}
          {form.show_entry_count && entryCount > 0 && (
            <div className="flex items-center gap-2 mb-6 text-sm text-zinc-400">
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900" style={{ backgroundColor: form.accent_color + (60 + i * 20).toString(16) }} />
                ))}
              </div>
              <span><strong className="text-zinc-700 dark:text-zinc-200">{entryCount.toLocaleString()}</strong> people have entered</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: form.accent_color + '20' }}>
                <svg className="w-8 h-8" fill="none" stroke={form.accent_color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">You&apos;re in! 🎉</h2>
              <p className="text-sm text-zinc-500">Good luck! We&apos;ll notify you if you win.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  labelClassName="text-zinc-700 dark:text-zinc-300"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: form.accent_color }}
              >
                {isSubmitting ? 'Entering...' : 'Enter Now'}
              </button>
            </form>
          )}
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-zinc-400 mt-4">
          Powered by <span className="font-semibold">DrawVault</span>
        </p>
      </div>
    </div>
  )
}
