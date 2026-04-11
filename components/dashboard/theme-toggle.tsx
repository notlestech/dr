'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Toggle theme"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="size-4 hidden dark:block" />
    </button>
  )
}
