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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://drawvault.site'),
  title: {
    default: 'DrawVault — Live Raffle & Giveaway Tool',
    template: '%s | DrawVault',
  },
  description: 'Create branded entry forms and run live draws for streamers and companies. Free giveaway tool with slot-machine draw animation, real-time entries, and custom subdomains.',
  keywords: [
    'giveaway tool', 'raffle tool', 'live draw', 'slot machine giveaway',
    'twitch giveaway', 'youtube giveaway', 'entry form builder',
    'contest software', 'prize draw', 'drawvault',
  ],
  authors: [{ name: 'DrawVault', url: 'https://drawvault.site' }],
  creator: 'DrawVault',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    siteName: 'DrawVault',
    title: 'DrawVault — Live Raffle & Giveaway Tool',
    description: 'Create branded entry forms and run live draws for streamers and companies. Free plan available, no credit card required.',
    url: 'https://drawvault.site',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'DrawVault' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DrawVault — Live Raffle & Giveaway Tool',
    description: 'Create branded entry forms and run live draws for streamers and companies.',
    images: ['/og-default.png'],
  },
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
