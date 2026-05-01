'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function RetroTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: '#1a0a2e',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }}
    >
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Window chrome */}
        <div style={{ border: `3px solid ${accent}`, boxShadow: `4px 4px 0 ${accent}60, 8px 8px 0 ${accent}30` }}>
          {/* Title bar */}
          <div
            className="flex items-center justify-between px-3 py-1.5"
            style={{ background: accent, color: '#fff' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase">{form.name}</span>
            <span className="text-xs font-bold">■□□</span>
          </div>

          {/* Body */}
          <div className="p-6" style={{ background: '#0d0620' }}>
            {form.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo_url} alt="" className="h-8 object-contain mb-5 opacity-80" />
            )}

            <h1
              className="text-2xl font-bold uppercase tracking-widest mb-1"
              style={{ color: accent, fontFamily: 'monospace', textShadow: `0 0 10px ${accent}60` }}
            >
              {form.name}
            </h1>

            {form.description && (
              <p className="text-xs font-mono mb-5" style={{ color: '#a0a0c0' }}>{form.description}</p>
            )}

            {form.show_entry_count && entryCount > 0 && (
              <div
                className="flex items-center gap-2 mb-5 px-3 py-1.5 text-xs font-mono"
                style={{ border: `1px dashed ${accent}60`, color: accent + 'aa' }}
              >
                <span>▶</span>
                <span>{entryCount.toLocaleString()} PLAYERS REGISTERED</span>
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">★</div>
                <p className="font-mono font-bold uppercase tracking-widest text-lg mb-2" style={{ color: accent }}>
                  ENTRY SAVED!
                </p>
                <p className="font-mono text-xs" style={{ color: '#606080' }}>Good luck in the draw, player.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map(field => (
                  <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="bg-black/60 border border-white/10 text-white placeholder:text-white/20 font-mono text-sm focus:border-[var(--accent)] rounded-none"
                  labelClassName="font-mono text-xs uppercase tracking-widest"
                />
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 font-mono font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 mt-2"
                  style={{
                    background: isSubmitting ? accent + '40' : accent,
                    color: '#000',
                    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                  }}
                >
                  {isSubmitting ? 'LOADING...' : '► ENTER NOW ◄'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-3 font-mono" style={{ color: '#404060' }}>
          Powered by <span className="font-bold" style={{ color: accent + '80' }}>DRAWVAULT</span>
        </p>
      </div>
    </div>
  )
}
