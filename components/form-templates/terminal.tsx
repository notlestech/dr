'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { FieldRenderer } from './field-renderer'
import type { FormTemplateProps } from './types'

const BOOT_LINES = [
  '> DRAWVAULT TERMINAL v2.4.1',
  '> Initializing secure entry protocol...',
  '> Establishing encrypted connection...',
  '> Connection established. OK',
]

// Track which form IDs have already booted so HMR / Strict Mode
// double-mounts don't replay the animation.
const bootedForms = new Set<string>()

export function TerminalTemplate({ form, fields, entryCount, onSubmit, isSubmitting, isSuccess }: FormTemplateProps) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const alreadyBooted = bootedForms.has(form.id)
  const [bootLines, setBootLines] = useState<string[]>(() =>
    alreadyBooted
      ? [...BOOT_LINES, `> Form: ${form.name}`, '> Status: ACCEPTING ENTRIES']
      : []
  )
  const [bootDone, setBootDone] = useState(alreadyBooted)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (alreadyBooted) return
    bootedForms.add(form.id)

    const lines = [
      ...BOOT_LINES,
      `> Form: ${form.name}`,
      '> Status: ACCEPTING ENTRIES',
    ]
    let i = 0
    timerRef.current = setInterval(() => {
      setBootLines(prev => [...prev, lines[i]])
      i++
      if (i >= lines.length) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setBootDone(true)
      }
    }, 120)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="w-full max-w-lg">
        {/* Terminal window chrome */}
        <div className="rounded-lg overflow-hidden border border-zinc-800 shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="flex-1 text-center text-xs font-mono text-zinc-500">
              drawvault — entry@terminal — 80×24
            </span>
          </div>

          {/* Terminal body */}
          <div className="bg-black p-6 font-mono text-sm min-h-[400px]">
            {/* Logo if present */}
            {form.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo_url} alt="" className="h-6 object-contain mb-4 opacity-60" />
            )}

            {/* Boot sequence */}
            <div className="space-y-1 mb-6">
              {bootLines.map((line, i) => (
                <p key={i} className="text-green-400 leading-relaxed">
                  {line}
                </p>
              ))}
              {!bootDone && (
                <span className="text-green-400 animate-pulse">█</span>
              )}
            </div>

            {bootDone && (
              <>
                {form.description && (
                  <p className="text-zinc-500 mb-4 border-l-2 border-zinc-700 pl-3">
                    {form.description}
                  </p>
                )}

                {form.show_entry_count && entryCount > 0 && (
                  <p className="text-green-700 text-xs mb-4">
                    {'>'} {entryCount.toLocaleString()} entries recorded
                  </p>
                )}

                {isSuccess ? (
                  <div className="space-y-2">
                    <p className="text-green-400">{'>'} ACCESS GRANTED <span className="animate-pulse">█</span></p>
                    <p className="text-green-400">{'>'} Your entry has been recorded.</p>
                    <p className="text-zinc-500">{'>'} Good luck. Connection will close shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {fields.map(field => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        register={register}
                        errors={errors}
                        labelClassName="text-green-600 text-xs uppercase tracking-widest before:content-['>_'] before:text-green-800"
                        inputClassName="bg-zinc-950 border border-zinc-800 text-green-300 placeholder:text-zinc-700 font-mono focus:border-green-700 focus:ring-0 rounded-none"
                      />
                    ))}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 text-sm font-mono font-bold tracking-widest border border-green-700 text-green-400 bg-transparent hover:bg-green-950 transition-colors disabled:opacity-40 rounded-none"
                      >
                        {isSubmitting ? '> Processing...' : '> SUBMIT ENTRY'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
