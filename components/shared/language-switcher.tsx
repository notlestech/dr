'use client'

import { type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  locale: Locale
  onSwitch: (l: Locale) => void
  className?: string
}

export function LanguageSwitcher({ locale, onSwitch, className }: LanguageSwitcherProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full border bg-muted/60 p-0.5 text-xs font-medium',
        className,
      )}
    >
      {(['en', 'pt'] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => onSwitch(l)}
          className={cn(
            'rounded-full px-2.5 py-1 transition-colors uppercase tracking-wide',
            locale === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-pressed={locale === l}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
