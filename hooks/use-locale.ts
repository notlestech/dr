'use client'

import { useState, useEffect } from 'react'
import { translations, type Locale } from '@/lib/i18n'

const STORAGE_KEY = 'dv-locale'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'pt') setLocaleState(stored)
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return { locale, setLocale, t: translations[locale] }
}
