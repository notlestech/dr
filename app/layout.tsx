import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: {
    default: 'DrawVault — Live Raffle & Giveaway Tool',
    template: '%s | DrawVault',
  },
  description: 'Create branded entry forms and run live draws for streamers and companies.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://drawvault.site'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense — site verification + ad serving */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7840488343669346"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
