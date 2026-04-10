'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function NeonTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [displayText, setDisplayText] = useState('')
  const accent = form.accent_color

  // Typewriter effect for title
  useEffect(() => {
    let i = 0
    const text = form.name
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [form.name])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#080810',
        backgroundImage: `radial-gradient(ellipse at 50% 50%, ${accent}12 0%, transparent 70%)`,
      }}
    >
      {/* Scanlines overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        {form.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logo_url} alt="" className="h-8 object-contain mb-8 opacity-80" style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
        )}

        <h1
          className="text-3xl font-mono font-bold uppercase tracking-widest mb-2"
          style={{ color: accent, textShadow: `0 0 20px ${accent}80` }}
        >
          {displayText}<span className="animate-pulse">|</span>
        </h1>

        {form.description && (
          <p className="text-sm text-zinc-500 font-mono mb-6">{form.description}</p>
        )}

        {form.show_entry_count && entryCount > 0 && (
          <p className="text-xs font-mono mb-6" style={{ color: accent + 'aa' }}>
            [{entryCount.toLocaleString()} ENTRIES RECORDED]
          </p>
        )}

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4" style={{ filter: `drop-shadow(0 0 12px ${accent})` }}>✓</div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider mb-2" style={{ color: accent }}>
              Entry Confirmed
            </h2>
            <p className="text-sm text-zinc-500 font-mono">Good luck, player.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {fields.map(field => (
              <FieldRenderer
                key={field.id}
                field={field}
                register={register}
                errors={errors}
                inputClassName={`bg-transparent border-b-2 border-zinc-800 rounded-none px-0 focus:border-[${accent}] text-zinc-100 placeholder:text-zinc-700 font-mono`}
                labelClassName="text-zinc-500 font-mono text-xs uppercase tracking-widest"
              />
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 text-sm font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 border-2 mt-2"
              style={{
                color: accent,
                borderColor: accent,
                boxShadow: `0 0 16px ${accent}40, inset 0 0 16px ${accent}10`,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.backgroundColor = accent + '20' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              {isSubmitting ? 'Processing...' : '[ ENTER NOW ]'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
