import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { ThemeProvider } from 'next-themes'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
              <div className="size-6 rounded-md bg-foreground flex items-center justify-center">
                <Trophy className="size-3.5 text-background" />
              </div>
              DrawVault
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-12">
          {children}
        </main>
        <footer className="border-t mt-16">
          <div className="mx-auto max-w-3xl px-4 py-6 flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
