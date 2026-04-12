'use client'

import { useReducer, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { createForm, publishForm } from '@/actions/forms'
import { DEFAULT_WIZARD_VALUES } from '@/lib/validations/form'
import type { FormWizardValues } from '@/lib/validations/form'
import { StepType }     from './step-type'
import { StepDesign }   from './step-design'
import { StepFields }   from './step-fields'
import { StepBranding } from './step-branding'
import { StepSettings } from './step-settings'
import { StepReview }   from './step-review'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'type',     title: 'What are you running?',  short: 'Type' },
  { id: 'design',   title: 'Pick a design',           short: 'Design' },
  { id: 'fields',   title: 'Collect information',     short: 'Fields' },
  { id: 'branding', title: 'Brand it',                short: 'Brand' },
  { id: 'settings', title: 'Set the rules',           short: 'Settings' },
  { id: 'review',   title: 'Ready to go live?',       short: 'Review' },
]

type WizardAction = { type: 'SET'; payload: Partial<FormWizardValues> } | { type: 'RESET' }

function wizardReducer(state: FormWizardValues, action: WizardAction): FormWizardValues {
  switch (action.type) {
    case 'SET': return { ...state, ...action.payload }
    case 'RESET': return DEFAULT_WIZARD_VALUES
  }
}

interface Props {
  isPro: boolean
  plan: string
}

const STORAGE_KEY      = 'drawvault_wizard_draft'
const STEP_STORAGE_KEY = 'drawvault_wizard_step'

export function FormWizard({ isPro, plan }: Props) {
  const router = useRouter()
  const [step, setStep]       = useState(() => {
    if (typeof window === 'undefined') return 0
    try { return Number(localStorage.getItem(STEP_STORAGE_KEY) ?? 0) } catch { return 0 }
  })
  const [direction, setDir]   = useState(1)
  const [saving, setSaving]   = useState(false)
  const [createdFormId, setCreatedFormId] = useState<string | null>(null)

  const [values, dispatch] = useReducer(wizardReducer, DEFAULT_WIZARD_VALUES, () => {
    if (typeof window === 'undefined') return DEFAULT_WIZARD_VALUES
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_WIZARD_VALUES, ...JSON.parse(saved) } : DEFAULT_WIZARD_VALUES
    } catch { return DEFAULT_WIZARD_VALUES }
  })

  // Persist form values
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  }, [values])

  // Persist step index
  useEffect(() => {
    localStorage.setItem(STEP_STORAGE_KEY, String(step))
  }, [step])

  // Warn before tab close / hard refresh when there is unsaved work
  const isDirty = values.name.length > 0 || values.fields.length !== DEFAULT_WIZARD_VALUES.fields.length
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function update(payload: Partial<FormWizardValues>) {
    dispatch({ type: 'SET', payload })
  }

  function goNext() {
    setDir(1)
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    if (step === 0) {
      if (isDirty && !window.confirm('You have unsaved work. Leave and discard it?')) return
      localStorage.removeItem(STEP_STORAGE_KEY)
      router.push('/forms')
      return
    }
    setDir(-1)
    setStep(s => Math.max(s - 1, 0))
  }

  function goTo(i: number) {
    if (i >= step) return // only allow going back
    setDir(-1)
    setStep(i)
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return values.name.length >= 2
      case 1: return !!values.template
      case 2: return values.fields.length > 0
      case 3: return true
      case 4: return true
      case 5: return values.name.length >= 2 && values.subdomain.length >= 3
      default: return true
    }
  }

  function disabledReason(): string | null {
    if (canProceed()) return null
    switch (step) {
      case 0: return 'Enter a form name (at least 2 characters)'
      case 1: return 'Pick a design template'
      case 2: return 'Add at least one field'
      case 5: return values.name.length < 2 ? 'Form name too short' : 'Subdomain must be at least 3 characters'
      default: return null
    }
  }

  async function handlePublish() {
    setSaving(true)
    try {
      let formId = createdFormId
      if (!formId) {
        const result = await createForm(values)
        if (result.error) { toast.error(result.error); setSaving(false); return }
        formId = result.formId!
        setCreatedFormId(formId)
      }
      const pub = await publishForm(formId!)
      if (pub.error) { toast.error(pub.error); setSaving(false); return }
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STEP_STORAGE_KEY)
      toast.success('Form published!')
      router.push(`/forms/${formId}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDraft() {
    setSaving(true)
    const result = await createForm(values)
    setSaving(false)
    if (result.error) { toast.error(result.error); return }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STEP_STORAGE_KEY)
    toast.success('Draft saved')
    router.push(`/forms/${result.formId}`)
  }

  const isLast = step === STEPS.length - 1
  const progress = ((step) / (STEPS.length - 1)) * 100

  const variants = {
    enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir * -48, opacity: 0 }),
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className={cn('mx-auto px-6 py-4 flex items-center gap-4', step === 1 || step === 5 ? 'max-w-5xl' : 'max-w-2xl')}>
          {/* Cancel */}
          <button
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved work. Leave and discard it?')) return
              localStorage.removeItem(STEP_STORAGE_KEY)
              router.push('/forms')
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Cancel and leave wizard"
          >
            <X className="size-4" />
          </button>

          {/* Step pills */}
          <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                disabled={i > step}
                className={cn(
                  'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  i === step
                    ? 'bg-foreground text-background'
                    : i < step
                    ? 'bg-muted text-foreground hover:bg-muted/80 cursor-pointer'
                    : 'text-muted-foreground cursor-default'
                )}
              >
                {s.short}
              </button>
            ))}
          </div>

          {/* Progress fraction */}
          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-border relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-foreground"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Content — wider on design + review steps that have preview panels */}
      <div className={cn(
        'flex-1 w-full mx-auto px-6 py-10 transition-all duration-300',
        step === 1 || step === 5 ? 'max-w-5xl' : 'max-w-2xl'
      )}>
        {/* Step heading */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`heading-${step}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-2xl font-semibold tracking-tight mb-8">
              {STEPS[step].title}
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* Step body */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`step-${step}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && <StepType values={values} update={update} />}
            {step === 1 && <StepDesign values={values} update={update} isPro={isPro} />}
            {step === 2 && <StepFields values={values} update={update} isPro={isPro} />}
            {step === 3 && <StepBranding values={values} update={update} isPro={isPro} />}
            {step === 4 && <StepSettings values={values} update={update} isPro={isPro} />}
            {step === 5 && <StepReview values={values} isPro={isPro} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="border-t bg-background sticky bottom-0">
        <div className={cn('mx-auto px-6 py-4 flex items-center justify-between', step === 1 || step === 5 ? 'max-w-5xl' : 'max-w-2xl')}>
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
            <ArrowLeft className="size-3.5" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex items-center gap-2">
            {isLast && (
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
                Save draft
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger
                render={<span className={!canProceed() ? 'cursor-not-allowed' : undefined} />}
              >
                <Button
                  size="sm"
                  className="gap-1.5 min-w-[100px]"
                  onClick={isLast ? handlePublish : goNext}
                  disabled={saving || !canProceed()}
                >
                  {isLast
                    ? (saving ? 'Publishing…' : 'Go live')
                    : (<>Next <ArrowRight className="size-3.5" /></>)}
                </Button>
              </TooltipTrigger>
              {disabledReason() && (
                <TooltipContent side="top">
                  {disabledReason()}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
