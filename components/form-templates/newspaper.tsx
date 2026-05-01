'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function NewspaperTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Masthead */}
        <div className="text-center border-b-4 border-t-4 border-black py-4 mb-6" style={{ borderTopWidth: 6, borderBottomWidth: 2 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mb-1">{today}</p>
          <h1
            className="text-4xl font-black uppercase tracking-tight leading-none"
            style={{ fontFamily: 'Georgia, serif', color: accent }}
          >
            {form.name}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px flex-1 bg-black/20" />
            <p className="text-[10px] uppercase tracking-widest text-black/40">Enter Now · Limited Spots</p>
            <div className="h-px flex-1 bg-black/20" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-black/10 p-6 shadow-sm">
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" className="h-8 object-contain mb-4" />
          )}

          {form.description && (
            <div className="mb-5 pb-4 border-b border-black/10">
              <p
                className="text-sm leading-relaxed text-black/70"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {form.description}
              </p>
            </div>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div
              className="flex items-center gap-2 mb-4 px-3 py-2 text-xs font-bold uppercase tracking-widest"
              style={{ background: accent + '15', borderLeft: `3px solid ${accent}` }}
            >
              <span style={{ color: accent }}>◆ {entryCount.toLocaleString()} entries recorded</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-8 border border-dashed border-black/20">
              <p className="text-5xl mb-4">🎉</p>
              <p
                className="text-xl font-black uppercase mb-2"
                style={{ fontFamily: 'Georgia, serif', color: accent }}
              >
                You&apos;re in the draw!
              </p>
              <p className="text-xs text-black/50 uppercase tracking-widest">
                Your entry has been confirmed. Good luck!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="bg-white border border-black/20 text-black placeholder:text-black/30 focus:border-[var(--accent)] rounded-none text-sm"
                  labelClassName="text-xs uppercase tracking-widest text-black/60 font-bold"
                />
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 mt-2"
                style={{
                  background: accent,
                  color: '#fff',
                  borderBottom: `4px solid ${accent}80`,
                }}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Entry →'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] mt-3 text-black/30 uppercase tracking-widest">
          Powered by DrawVault
        </p>
      </div>
    </div>
  )
}
