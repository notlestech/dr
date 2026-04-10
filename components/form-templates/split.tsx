'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function SplitTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left hero panel */}
      <div
        className="md:w-1/2 flex flex-col justify-between p-10 md:min-h-screen"
        style={{ backgroundColor: accent }}
      >
        {form.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logo_url} alt="" className="h-10 object-contain self-start" style={{ filter: 'brightness(0) invert(1)' }} />
        )}

        <div className="my-auto py-10">
          <div className="text-6xl font-serif italic text-white/20 leading-none mb-4">&ldquo;</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">{form.name}</h1>
          {form.description && (
            <p className="text-lg text-white/80 leading-relaxed">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white/30 bg-white/20" />
                ))}
              </div>
              <span className="text-sm text-white/80">{entryCount.toLocaleString()} entries</span>
            </div>
          )}
        </div>

        <p className="text-white/40 text-xs">Powered by DrawVault</p>
      </div>

      {/* Right form panel */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Enter the draw</h2>
          <p className="text-sm text-zinc-500 mb-8">Fill in the details below to enter.</p>

          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accent + '20' }}>
                <svg className="w-8 h-8" fill="none" stroke={accent} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">You&apos;re in!</h3>
              <p className="text-sm text-zinc-500">Good luck!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--accent)] rounded-lg"
                  labelClassName="text-zinc-700 font-medium"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: accent }}
              >
                {isSubmitting ? 'Entering...' : 'Submit Entry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
