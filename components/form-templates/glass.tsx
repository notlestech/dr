'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function GlassTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: accent + 'dd' }}
    >
      {/* Animated mesh gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-60 animate-pulse"
          style={{ backgroundColor: accent, top: '-10%', left: '-10%' }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-40 animate-pulse"
          style={{ backgroundColor: accent + 'aa', bottom: '-5%', right: '-5%', animationDelay: '1s' }} />
        <div className="absolute w-64 h-64 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: '#ffffff40', top: '30%', right: '20%' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" className="h-10 object-contain mb-6 mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          )}

          <h1 className="text-2xl font-semibold text-white mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-sm text-white/70 mb-6">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-white/80 mb-6 border border-white/20 bg-white/10">
              ✦ {entryCount.toLocaleString()} entries
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-white mb-2">You&apos;re in!</h2>
              <p className="text-sm text-white/60">Good luck!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="bg-white/15 border border-white/30 text-white placeholder:text-white/40 rounded-xl focus:border-white/70 focus:bg-white/20 backdrop-blur"
                  labelClassName="text-white/80"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl text-sm font-semibold bg-white text-zinc-900 hover:bg-white/90 transition-all disabled:opacity-60 mt-2"
              >
                {isSubmitting ? 'Entering...' : 'Enter Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
