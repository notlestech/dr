'use client'

import { useForm } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

export function BrutalTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const accent = form.accent_color

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: '#f5f0e8',
        backgroundImage: 'repeating-linear-gradient(45deg, #e8e0cc, #e8e0cc 1px, transparent 1px, transparent 8px)',
      }}
    >
      <div className="w-full max-w-lg">
        <div
          className="bg-white border-3 p-8"
          style={{
            border: '3px solid #000',
            boxShadow: '8px 8px 0 #000',
          }}
        >
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" className="h-10 object-contain mb-6" />
          )}

          <h1 className="text-4xl font-black text-zinc-900 uppercase leading-none mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-sm text-zinc-600 mb-4 font-medium">{form.description}</p>
          )}

          {form.show_entry_count && entryCount > 0 && (
            <div
              className="inline-block px-3 py-1 text-xs font-black uppercase border-2 border-black mb-6"
              style={{ backgroundColor: accent, color: '#fff' }}
            >
              {entryCount.toLocaleString()} entries
            </div>
          )}

          {isSuccess ? (
            <div className="border-4 border-black p-6 text-center" style={{ boxShadow: '4px 4px 0 #000' }}>
              <div className="text-4xl font-black uppercase text-zinc-900 mb-2">Done!</div>
              <p className="font-medium text-zinc-600">Entry submitted. Good luck.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  errors={errors}
                  inputClassName="border-2 border-black bg-white text-zinc-900 placeholder:text-zinc-400 rounded-none focus:outline-none focus:border-black"
                  labelClassName="text-zinc-900 font-bold uppercase text-xs tracking-wider"
                />
              ))}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 font-black text-sm uppercase tracking-widest text-white border-2 border-black transition-all disabled:opacity-60"
                style={{
                  backgroundColor: accent,
                  boxShadow: '4px 4px 0 #000',
                  transform: 'translate(0,0)',
                }}
                onMouseDown={e => { (e.target as HTMLButtonElement).style.transform = 'translate(4px,4px)'; (e.target as HTMLButtonElement).style.boxShadow = 'none' }}
                onMouseUp={e => { (e.target as HTMLButtonElement).style.transform = 'translate(0,0)'; (e.target as HTMLButtonElement).style.boxShadow = '4px 4px 0 #000' }}
              >
                {isSubmitting ? 'Submitting...' : 'Enter →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
