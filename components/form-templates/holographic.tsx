'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function HolographicTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#06060f' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Shimmer bar */}
        <div
          className="holo-shimmer-bar h-[2px] w-full mb-8 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #a78bfa, #ec4899, #22d3ee, #a78bfa, transparent)',
            backgroundSize: '200% 100%',
            animation: 'holographic-shimmer 3s linear infinite',
          }}
        />

        <style>{`
          @keyframes holographic-shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes holo-float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-6px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .holo-shimmer-bar { animation: none !important; }
            .holo-float-el    { animation: none !important; }
          }
        `}</style>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Inner shimmer top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(236,72,153,0.6), rgba(34,211,238,0.6), transparent)',
            }}
          />

          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.logo_url}
              alt=""
              className="h-10 object-contain mb-6"
              style={{ filter: 'brightness(1.2) drop-shadow(0 0 12px rgba(167,139,250,0.5))' }}
            />
          )}

          <h1
            className="text-3xl font-bold mb-2 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #e0c3fc, #a78bfa, #ec4899, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {form.name}
          </h1>

          {form.description && (
            <p className="text-sm mb-6 text-zinc-400 leading-relaxed">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <p className="text-xs mb-6" style={{ color: 'rgba(167,139,250,0.7)' }}>
              {entryCount.toLocaleString()} entries
            </p>
          )}

          {isSuccess ? (
            <div
              className="holo-float-el text-center py-10"
              style={{ animation: 'holo-float 3s ease-in-out infinite' }}
            >
              <div
                className="text-6xl mb-4"
                style={{ filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.8))' }}
              >
                ✦
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #e0c3fc, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Entry Recorded
              </h2>
              <p className="text-sm text-zinc-500">You're in. Good luck.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  labelClassName="text-zinc-400 text-xs uppercase tracking-widest"
                  inputClassName="bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 text-sm font-semibold tracking-wide rounded-lg transition-all disabled:opacity-40 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                  color: '#fff',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 32px rgba(124,58,237,0.7)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(124,58,237,0.4)' }}
              >
                {isSubmitting ? 'Entering...' : 'Enter Now'}
              </button>
            </form>
          )}
        </div>

        {/* Bottom shimmer bar */}
        <div
          className="holo-shimmer-bar h-[2px] w-full mt-8 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #22d3ee, #ec4899, #a78bfa, transparent)',
            backgroundSize: '200% 100%',
            animation: 'holographic-shimmer 3s linear infinite reverse',
          }}
        />
      </div>
    </div>
  )
}
