'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RevealSection } from './reveal-section'

const FAQS = [
  {
    q: 'Is DrawVault free to use?',
    a: 'Yes — the Free plan gives you 3 forms, 500 entries each, and 1 draw per form. No credit card required.',
  },
  {
    q: 'How does the live draw work?',
    a: 'Entries are shuffled with a Fisher-Yates algorithm for a fair, verifiable draw. The slot machine animation runs fullscreen with OBS capture support built in.',
  },
  {
    q: 'How do you prevent duplicate entries?',
    a: 'IP deduplication is on by default. Pro and Business plans layer in Cloudflare Turnstile bot protection on top.',
  },
  {
    q: 'Can I use DrawVault for Twitch or YouTube giveaways?',
    a: 'Absolutely. Share the public form link in chat, run the fullscreen draw live on stream, and capture it directly with OBS.',
  },
  {
    q: 'Can I export my entry list?',
    a: 'Yes — Pro and Business plans include one-click CSV export from the analytics dashboard.',
  },
  {
    q: 'What happens when a form hits its entry limit?',
    a: 'New entries are blocked and visitors see a "form closed" message. You can upgrade your plan or archive old forms to free up capacity at any time.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="mx-auto max-w-2xl px-4 py-28">
      <RevealSection className="text-center mb-12">
        <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">FAQ</p>
        <h2 className="text-4xl font-semibold tracking-tight">
          Common <span className="text-display text-5xl">questions</span>
        </h2>
      </RevealSection>

      <RevealSection>
        <div className="divide-y">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex items-center justify-between py-4 text-left text-sm font-medium gap-4 hover:text-foreground/80 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    open === i && 'rotate-180',
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
                  open === i ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0',
                )}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
    </section>
  )
}
