'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function LuxuryTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: '#0a0a09',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="w-full max-w-sm">
        {form.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logo_url} alt="" className="h-8 object-contain mb-10 mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
        )}

        {/* Decorative rule */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: accent }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent }} />
          <div className="flex-1 h-px" style={{ backgroundColor: accent }} />
        </div>

        <h1 className="text-2xl font-serif italic text-zinc-100 text-center tracking-wide mb-2">{form.name}</h1>
        {form.description && (
          <p className="text-xs text-zinc-500 text-center tracking-widest uppercase mb-8">{form.description}</p>
        )}

        {/* Decorative rule */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ backgroundColor: accent }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent }} />
          <div className="flex-1 h-px" style={{ backgroundColor: accent }} />
        </div>

        {form.show_entry_count && entryCount > 0 && (
          <p className="text-center text-xs text-zinc-600 tracking-widest uppercase mb-8">
            {entryCount.toLocaleString()} entries
          </p>
        )}

        {isSuccess ? (
          <div className="text-center py-6">
            <p className="text-lg font-serif italic text-zinc-200 mb-2">Thank you.</p>
            <p className="text-xs text-zinc-600 tracking-widest uppercase">Your entry has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map(field => (
              <FieldRenderer
                key={field.id}
                field={field}
                register={register}
                errors={errors}
                inputClassName="bg-transparent border-0 border-b border-zinc-800 rounded-none px-0 pb-2 text-zinc-200 placeholder:text-zinc-700 focus:border-b focus:outline-none"
                labelClassName="text-zinc-500 text-xs tracking-widest uppercase"
              />
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-xs tracking-widest uppercase border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all disabled:opacity-40 mt-4"
              style={{ background: 'transparent' }}
            >
              {isSubmitting ? 'Submitting...' : 'Request Entry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
