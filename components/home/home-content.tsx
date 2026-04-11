'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { RevealSection } from '@/components/home/reveal-section'
import { StatCounter } from '@/components/home/stat-counter'
import { TypingText } from '@/components/home/typing-text'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'

const ProductPreview = dynamic(
  () => import('@/components/home/product-preview').then(m => m.ProductPreview),
  { loading: () => <div className="w-full max-w-3xl mx-auto h-80 rounded-2xl bg-muted/40 animate-pulse" />, ssr: false }
)
import { useLocale } from '@/hooks/use-locale'
import {
  Trophy, Users, Layers, BarChart3, Shield,
  ArrowRight, Check, Star, Dice5, Globe,
  PenLine, Share2, LayoutDashboard,
} from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURE_ICONS = [Layers, Dice5, Users, Globe, Shield, BarChart3]
const HOW_ICONS     = [PenLine, Share2, Dice5]

const PLAN_FEATURES = {
  Free:     ['3 forms', '500 entries per form', '4 form templates', '1 draw per form', 'DrawVault branding'],
  Pro:      ['Unlimited forms', '10,000 entries per form', 'All 10 templates', 'Unlimited draws', 'No branding', 'Analytics + CSV export'],
  Business: ['Everything in Pro', 'Unlimited entries', '3 workspaces', 'Auto-draw scheduling', 'Webhooks', 'Audit logs'],
}
const PLAN_PRICES   = ['$0', '$9', '$29']
const PLAN_PERIODS  = ['/mo', '/mo', '/mo']
const PLAN_HIGHLIGHT = [false, true, false]

const TESTIMONIALS = [
  { name: 'TwitchStreamer_Alex', handle: '@AlexLive',  text: 'Ran a 2,000-entry giveaway live. The slot machine animation had my chat going insane. 10/10.' },
  { name: 'Sarah Marketing',    handle: '@SarahGrows', text: 'Finally a giveaway tool that looks good. Our entry rate went up 40% with the new templates.' },
  { name: 'GameDevStudio',      handle: '@IndieDev',   text: 'Set up a beta access waitlist in under 5 minutes. The embed widget is a game changer.' },
]

interface Props {
  isLoggedIn?: boolean
}

export function HomeContent({ isLoggedIn = false }: Props) {
  const { locale, setLocale, t } = useLocale()
  const [line2Visible, setLine2Visible] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SmoothScroll />

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md animate-slide-down">
        <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
            <div className="size-6 rounded-md bg-foreground flex items-center justify-center transition-transform hover:rotate-[15deg] hover:scale-110 duration-200">
              <Trophy className="size-3.5 text-background" />
            </div>
            DrawVault
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#how-it-works" className="hover:text-foreground transition-colors cursor-pointer">{t.nav.howItWorks}</Link>
            <Link href="#features"     className="hover:text-foreground transition-colors cursor-pointer">{t.nav.features}</Link>
            <Link href="#pricing"      className="hover:text-foreground transition-colors cursor-pointer">{t.nav.pricing}</Link>
            {!isLoggedIn && (
              <Link href="/login" className="hover:text-foreground transition-colors cursor-pointer">{t.nav.signIn}</Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} onSwitch={setLocale} />
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5 rounded-full cursor-pointer">
                  <LayoutDashboard className="size-3" /> Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="sm" className="gap-1.5 rounded-full cursor-pointer">
                  {t.nav.getStarted} <ArrowRight className="size-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-4xl px-4 pt-28 pb-20 text-center overflow-hidden">
        <div className="hero-dots absolute inset-0" aria-hidden />

        <div className="relative animate-fade-up">
          <Badge variant="secondary" className="mb-8 rounded-full px-4 py-1.5 text-xs font-medium gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            {t.hero.badge}
          </Badge>
        </div>

        <h1 className="relative text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.08] mb-6 animate-fade-up delay-100">
          <TypingText text={t.hero.line1} delay={300} onComplete={() => setLine2Visible(true)} />
          <br />
          <span
            className={cn(
              'text-display text-6xl sm:text-8xl transition-opacity duration-700',
              line2Visible ? 'opacity-100' : 'opacity-0',
            )}
          >
            {t.hero.line2}
          </span>
        </h1>

        <p className="relative text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
          {t.hero.subtitle}
        </p>

        <div className="relative flex items-center justify-center gap-3 flex-wrap animate-fade-up delay-300">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="h-11 px-8 rounded-full gap-2 cursor-pointer">
                <LayoutDashboard className="size-4" /> Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="h-11 px-8 rounded-full gap-2 cursor-pointer">
                  {t.hero.cta} <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-11 px-8 rounded-full cursor-pointer">
                  {t.hero.ctaSecondary}
                </Button>
              </Link>
            </>
          )}
        </div>

        <p className="relative text-xs text-muted-foreground mt-5 animate-fade-in delay-500">
          {t.hero.tagline}
        </p>

        {/* Stats */}
        <div className="relative animate-fade-in delay-700 mt-16 pt-8 border-t flex items-center justify-center gap-8 sm:gap-14">
          {[
            { end: 1200,  suffix: '+', label: t.stats.creators },
            { end: 50000, suffix: '+', label: t.stats.entries  },
            { end: 5000,  suffix: '+', label: t.stats.forms    },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold tabular-nums">
                <StatCounter end={s.end} suffix={s.suffix} />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product preview ─────────────────────────────────────────────── */}
      <RevealSection className="mx-auto max-w-4xl px-4 pb-28">
        <ProductPreview />
      </RevealSection>

      <Separator />

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">{t.howItWorks.eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            {t.howItWorks.heading1}{' '}
            <span className="text-display text-5xl">{t.howItWorks.heading2}</span>
          </h2>
        </RevealSection>
        <div className="grid md:grid-cols-3 gap-10">
          {t.howItWorks.steps.map((step, i) => {
            const Icon = HOW_ICONS[i]
            return (
              <RevealSection key={step.title} delay={i * 120} className="flex flex-col items-center text-center group">
                <div className="relative mb-5 shrink-0">
                  <div className="size-16 rounded-2xl bg-muted flex items-center justify-center transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="size-6 transition-colors duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 size-6 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center select-none transition-transform duration-300 group-hover:scale-110">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </RevealSection>
            )
          })}
        </div>
      </section>

      <Separator />

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">{t.features.eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            {t.features.heading1}<br />
            <span className="text-display text-5xl">{t.features.heading2}</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">{t.features.subtitle}</p>
        </RevealSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <RevealSection key={f.title} delay={i * 80} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-foreground/20 cursor-default">
                  <CardHeader className="pb-2">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-foreground group-hover:text-background">
                      <Icon className="size-4" />
                    </div>
                    <CardTitle className="text-base font-semibold">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              </RevealSection>
            )
          })}
        </div>
      </section>

      <Separator />

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">{t.testimonials.eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            {t.testimonials.heading1}{' '}
            <span className="text-display text-5xl">{t.testimonials.heading2}</span>
          </h2>
        </RevealSection>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <RevealSection key={item.handle} delay={i * 100}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-foreground/20 cursor-default">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="size-4 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{item.text}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.handle}</p>
                  </div>
                </CardContent>
              </Card>
            </RevealSection>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">{t.pricing.eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-tight mb-3">
            {t.pricing.heading1}{' '}
            <span className="text-display text-5xl">{t.pricing.heading2}</span>{' '}
            {locale === 'en' ? 'pricing' : ''}
          </h2>
          <p className="text-muted-foreground">{t.pricing.subtitle}</p>
        </RevealSection>
        {/* pt-5 gives space for the -top-3 "Most Popular" badge */}
        <div className="grid gap-6 md:grid-cols-3 pt-5">
          {t.pricing.plans.map((plan, i) => (
            <RevealSection key={plan.name} delay={i * 100}>
              <Card
                className={cn(
                  'relative flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-default',
                  PLAN_HIGHLIGHT[i]
                    ? 'border-foreground shadow-md hover:border-foreground'
                    : 'hover:border-foreground/30',
                )}
              >
                {PLAN_HIGHLIGHT[i] && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-3 shadow-md">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className={PLAN_HIGHLIGHT[i] ? 'pt-7' : ''}>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-bold tracking-tight">{PLAN_PRICES[i]}</span>
                    <span className="text-sm text-muted-foreground">{PLAN_PERIODS[i]}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-5">
                  <ul className="space-y-2.5 flex-1">
                    {PLAN_FEATURES[plan.name as keyof typeof PLAN_FEATURES]?.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="size-4 shrink-0 text-emerald-500" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={isLoggedIn ? '/upgrade' : '/signup'}>
                    <Button className="w-full rounded-full cursor-pointer" variant={PLAN_HIGHLIGHT[i] ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </RevealSection>
          ))}
        </div>
        <RevealSection>
          <p className="text-center text-xs text-muted-foreground mt-8">{t.pricing.guarantee}</p>
        </RevealSection>
      </section>

      <Separator />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 py-28">
        <RevealSection className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">{t.faq.eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            {t.faq.heading1}{' '}
            <span className="text-display text-5xl">{t.faq.heading2}</span>
          </h2>
        </RevealSection>
        <RevealSection>
          <div className="divide-y">
            {t.faq.items.map((item, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center justify-between py-4 text-left text-sm font-medium gap-4 hover:text-foreground/80 transition-colors cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      openFaq === i && 'rotate-180',
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
                    openFaq === i ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0',
                  )}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-28">
        <RevealSection>
          <Card className="text-center p-14 bg-foreground text-background border-0 overflow-hidden relative group cursor-default">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }}
            />
            <Trophy className="size-12 mx-auto mb-5 opacity-80 animate-float transition-transform duration-300 group-hover:scale-110" />
            <h2 className="text-3xl font-semibold mb-3 tracking-tight">{t.cta.title}</h2>
            <p className="text-background/70 mb-8 max-w-md mx-auto leading-relaxed">{t.cta.subtitle}</p>
            <Link href={isLoggedIn ? '/dashboard' : '/signup'}>
              <Button size="lg" variant="secondary" className="rounded-full h-11 px-8 gap-2 cursor-pointer hover:scale-105 transition-transform duration-200">
                {isLoggedIn ? <><LayoutDashboard className="size-4" /> Go to Dashboard</> : <>{t.cta.button} <ArrowRight className="size-4" /></>}
              </Button>
            </Link>
          </Card>
        </RevealSection>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <div className="size-5 rounded bg-foreground flex items-center justify-center">
              <Trophy className="size-3 text-background" />
            </div>
            DrawVault
          </div>
          <div className="flex items-center gap-6">
            <Link href="#how-it-works" className="hover:text-foreground transition-colors cursor-pointer">{t.footer.howItWorks}</Link>
            <Link href="#features"     className="hover:text-foreground transition-colors cursor-pointer">{t.footer.features}</Link>
            <Link href="#pricing"      className="hover:text-foreground transition-colors cursor-pointer">{t.footer.pricing}</Link>
            <Link href="/login"        className="hover:text-foreground transition-colors cursor-pointer">{t.footer.signIn}</Link>
          </div>
          <p>© {new Date().getFullYear()} DrawVault. {t.footer.rights}</p>
        </div>
      </footer>
    </div>
  )
}
