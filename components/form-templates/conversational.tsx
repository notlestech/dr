'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { FormTemplateProps } from './types'
import type { FormField } from '@/types/app'
import { ArrowRight, Check } from 'lucide-react'

export function ConversationalTemplate({ form, fields, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = welcome
  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm()
  const accent = form.accent_color

  const totalSteps = fields.length

  async function handleNext() {
    if (currentStep === -1) {
      setCurrentStep(0)
      return
    }
    const field = fields[currentStep]
    const valid = await trigger(field.id)
    if (!valid) return
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1)
    } else {
      handleSubmit(onSubmit)()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  const field: FormField | undefined = fields[currentStep]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: accent + 'dd' }}
    >
      {/* Progress bar */}
      {currentStep >= 0 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">You&apos;re in! 🎉</h2>
              <p className="text-white/70 text-lg">Good luck — we&apos;ll be in touch.</p>
            </div>
          ) : currentStep === -1 ? (
            // Welcome screen
            <div>
              {form.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="" className="h-12 object-contain mb-8" style={{ filter: 'brightness(0) invert(1)' }} />
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">{form.name}</h1>
              {form.description && (
                <p className="text-lg text-white/80 mb-10">{form.description}</p>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 font-bold rounded-full text-base hover:bg-white/90 transition-all"
              >
                Start <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-white/40 text-sm mt-4">Takes about 30 seconds</p>
            </div>
          ) : field ? (
            // Question screen
            <div onKeyDown={handleKeyDown}>
              <div className="text-white/50 text-sm font-medium mb-3">
                {currentStep + 1} / {totalSteps}
              </div>
              <label className="block text-2xl md:text-3xl font-bold text-white mb-8">
                {field.label}
                {field.required && <span className="text-white/40 ml-1">*</span>}
              </label>

              {field.type === 'dropdown' ? (
                <select
                  {...register(field.id, { required: field.required && 'Required' })}
                  autoFocus
                  className="w-full text-xl bg-transparent border-b-2 border-white/40 focus:border-white text-white pb-3 outline-none transition-colors placeholder:text-white/40"
                >
                  <option value="" className="text-zinc-900">Select...</option>
                  {(field.options ?? []).map(o => <option key={o} value={o} className="text-zinc-900">{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                  {...register(field.id, {
                    required: field.required && 'Required',
                    ...(field.type === 'email' && { pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }),
                  })}
                  placeholder={field.placeholder || 'Type your answer...'}
                  autoFocus
                  className="w-full text-xl bg-transparent border-b-2 border-white/40 focus:border-white text-white pb-3 outline-none transition-colors placeholder:text-white/30"
                />
              )}

              {errors[field.id] && (
                <p className="text-white/80 text-sm mt-3">{errors[field.id]?.message as string}</p>
              )}

              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-60"
                >
                  {currentStep < totalSteps - 1 ? (
                    <><span>OK</span> <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    isSubmitting ? 'Submitting...' : 'Submit'
                  )}
                </button>
                <p className="text-white/40 text-xs">press Enter ↵</p>
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="mt-4 text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
