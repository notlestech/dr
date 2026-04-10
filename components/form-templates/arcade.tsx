'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function ArcadeTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [visible, setVisible] = useState(false)
  const [blink, setBlink] = useState(true)
  const accent = form.accent_color

  // CRT flicker on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0d0221 0%, #1a0533 50%, #2d1b69 100%)',
      }}
    >
      {/* Star field */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)',
        }}
      />

      <div
        className="w-full max-w-md relative z-10 transition-all duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Pixel border card */}
        <div
          className="p-6"
          style={{
            background: 'rgba(10,5,30,0.9)',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 20px ${accent}40, inset 0 0 20px ${accent}08`,
          }}
        >
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" className="h-8 object-contain mb-6" style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
          )}

          <h1
            className="text-2xl font-mono font-bold uppercase tracking-widest mb-1"
            style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
          >
            {form.name}
            <span style={{ opacity: blink ? 1 : 0 }}>_</span>
          </h1>

          {form.description && (
            <p className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <p className="text-xs font-mono mb-6" style={{ color: accent + '99' }}>
              &gt; PLAYERS: {entryCount.toLocaleString()}
            </p>
          )}

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="text-4xl font-mono font-black mb-3" style={{ color: accent }}>
                *** WIN ***
              </div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Entry confirmed. Await results.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="bg-black/50 border border-zinc-700 font-mono text-green-400 placeholder:text-zinc-700 focus:border-[var(--accent)] rounded-none"
                  labelClassName="text-zinc-500 font-mono text-xs uppercase tracking-widest"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 font-mono font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-40 border mt-2"
                style={{
                  color: accent,
                  borderColor: accent,
                  background: `${accent}15`,
                  boxShadow: `0 0 10px ${accent}30`,
                }}
              >
                {isSubmitting ? '[ PROCESSING... ]' : '[ INSERT ENTRY ]'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
