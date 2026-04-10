'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function GradientTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#0f0f0f',
        backgroundImage: `radial-gradient(circle at 20% 20%, ${accent}18, transparent 50%), radial-gradient(circle at 80% 80%, ${accent}12, transparent 50%)`,
      }}
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
      />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" className="h-10 object-contain mb-6 mx-auto" />
          )}

          <h1
            className="text-3xl font-bold mb-2 bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
          >
            {form.name}
          </h1>
          {form.description && (
            <p className="text-sm text-zinc-400 mb-6">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: accent + '20', color: accent }}>
              🔥 {entryCount.toLocaleString()} people entered
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎊</div>
              <h2 className="text-xl font-bold text-zinc-50 mb-2">You&apos;re in!</h2>
              <p className="text-sm text-zinc-400">Good luck!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:border-[var(--accent)] rounded-xl"
                  labelClassName="text-zinc-300"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 mt-2"
                style={{ backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
              >
                {isSubmitting ? 'Entering...' : 'Enter Now →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
