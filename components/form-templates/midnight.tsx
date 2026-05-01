'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function MidnightTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number }[]>([])

  useEffect(() => {
    setStars(
      Array.from({ length: 60 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 4,
      }))
    )
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(170deg, #080c14 0%, #0d1220 40%, #10162a 100%)' }}
    >
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#fff',
            opacity: 0.4 + Math.random() * 0.4,
            animation: `pulse ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${accent}08 0%, transparent 100%)` }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Moon accent */}
        <div className="flex justify-center mb-8">
          <div
            className="w-16 h-16 rounded-full relative"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${accent}dd, ${accent}44)`,
              boxShadow: `0 0 40px ${accent}40, 0 0 80px ${accent}20`,
            }}
          >
            <div
              className="absolute top-2 right-2 w-10 h-10 rounded-full"
              style={{ background: 'linear-gradient(135deg, #080c14 0%, #0d1220 100%)' }}
            />
          </div>
        </div>

        {form.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logo_url} alt="" className="h-8 object-contain mx-auto mb-6 opacity-70" />
        )}

        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <h1
            className="text-3xl font-bold mb-2 text-white/90 tracking-tight"
          >
            {form.name}
          </h1>

          {form.description && (
            <p className="text-sm text-white/40 mb-6 leading-relaxed">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: accent + '60' }} />
                ))}
              </div>
              <span className="text-xs text-white/40">{entryCount.toLocaleString()} have entered</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-xl font-bold text-white/90 mb-2">You&apos;re in the draw!</p>
              <p className="text-sm text-white/40">We&apos;ll reach out if you win. Good luck!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[var(--accent)] focus:bg-white/8 rounded-xl"
                  labelClassName="text-xs text-white/50 font-medium tracking-wide"
                />
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 mt-2"
                style={{
                  background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)`,
                  boxShadow: `0 8px 24px ${accent}40`,
                }}
              >
                {isSubmitting ? 'Entering…' : 'Enter the Draw ✦'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-5 text-white/20">
          Powered by <span className="font-semibold text-white/30">DrawVault</span>
        </p>
      </div>
    </div>
  )
}
