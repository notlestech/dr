'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useRef } from 'react'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

// Static confetti shapes in background
function ConfettiBackground({ accent }: { accent: string }) {
  const shapes = [
    { x: 5, y: 8, size: 12, rotate: 25, color: accent },
    { x: 90, y: 5, size: 8, rotate: -15, color: accent + 'aa' },
    { x: 15, y: 85, size: 10, rotate: 45, color: accent + '88' },
    { x: 88, y: 80, size: 14, rotate: -30, color: accent + 'cc' },
    { x: 50, y: 3, size: 6, rotate: 60, color: accent + '66' },
    { x: 3, y: 45, size: 9, rotate: -45, color: accent + 'bb' },
    { x: 95, y: 40, size: 7, rotate: 20, color: accent + '77' },
    { x: 75, y: 92, size: 11, rotate: -60, color: accent },
    { x: 25, y: 12, size: 5, rotate: 80, color: accent + '99' },
    { x: 60, y: 88, size: 8, rotate: -10, color: accent + 'dd' },
  ]
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size * 0.6,
            backgroundColor: s.color,
            transform: `rotate(${s.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export function PartyTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const confettiRef = useRef(false)
  const accent = form.accent_color

  useEffect(() => {
    if (isSuccess && !confettiRef.current) {
      confettiRef.current = true
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: [accent, '#ffffff', accent + '88'] })
      })
    }
  }, [isSuccess, accent])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      <ConfettiBackground accent={accent} />

      <div className="w-full max-w-md relative z-10">
        <div
          className="bg-white rounded-2xl p-8 border-2 shadow-lg"
          style={{ borderColor: accent + '40', boxShadow: `0 8px 40px ${accent}25` }}
        >
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" className="h-10 object-contain mb-4 mx-auto" />
          )}

          <h1 className="text-2xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {form.name}
          </h1>
          {form.description && (
            <p className="text-sm text-zinc-500 mb-4">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-6 text-white"
              style={{ backgroundColor: accent }}
            >
              🔥 {entryCount.toLocaleString()} people entered!
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">You&apos;re in!</h2>
              <p className="text-sm text-zinc-500">Fingers crossed — good luck!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="border-2 border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--accent)] rounded-xl"
                  labelClassName="text-zinc-700 font-medium"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl text-sm font-bold text-white uppercase tracking-wide transition-all disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: accent }}
              >
                {isSubmitting ? 'Entering...' : '🎁 Enter Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
