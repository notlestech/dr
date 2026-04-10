'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, useEffect } from 'react'
import Lenis from 'lenis'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FadeIn, Stagger, StaggerItem, ScaleIn, HoverCard } from '@/components/motion'
import {
  Trophy, Zap, Users, Layers, BarChart3, Shield,
  ArrowRight, Check, Star, Dice5, Globe,
} from 'lucide-react'

const FEATURES = [
  { icon: Layers,    title: '10 Form Templates',     desc: 'From minimal clean cards to neon gaming overlays — pick a design that fits your brand.' },
  { icon: Dice5,     title: 'Live Slot Machine Draw', desc: 'Dramatic animated draw with Fisher-Yates shuffle. Fullscreen mode built for OBS capture.' },
  { icon: Users,     title: 'Real-time Entry Count', desc: 'Entries update live on the public form and your OBS overlay — no refresh needed.' },
  { icon: Globe,     title: 'Custom Subdomain',      desc: 'Every form gets a unique link at yourname.drawvault.site — shareable in seconds.' },
  { icon: Shield,    title: 'Bot Protection',        desc: 'Cloudflare Turnstile + IP deduplication blocks spam entries before they happen.' },
  { icon: BarChart3, title: 'Analytics & Export',   desc: 'See entries per day, source breakdown, and export to CSV with one click.' },
]

const PLANS = [
  {
    name: 'Free', price: '$0', period: '/mo', description: 'Perfect to get started',
    features: ['3 forms', '500 entries per form', '4 form templates', '1 draw per form', 'DrawVault branding'],
    cta: 'Start free', href: '/signup', highlight: false,
  },
  {
    name: 'Pro', price: '$9', period: '/mo', description: 'For creators & streamers',
    features: ['Unlimited forms', '10,000 entries per form', 'All 10 templates', 'Unlimited draws', 'No branding', 'Analytics + CSV export'],
    cta: 'Get Pro', href: '/signup', highlight: true,
  },
  {
    name: 'Business', price: '$29', period: '/mo', description: 'For agencies & companies',
    features: ['Everything in Pro', 'Unlimited entries', '3 workspaces', 'Auto-draw scheduling', 'Webhooks', 'Audit logs'],
    cta: 'Get Business', href: '/signup', highlight: false,
  },
]

const TESTIMONIALS = [
  { name: 'TwitchStreamer_Alex', handle: '@AlexLive', text: 'Ran a 2,000-entry giveaway live. The slot machine animation had my chat going insane. 10/10.' },
  { name: 'Sarah Marketing', handle: '@SarahGrows', text: 'Finally a giveaway tool that looks good. Our entry rate went up 40% with the new templates.' },
  { name: 'GameDevStudio', handle: '@IndieDev', text: 'Set up a beta access waitlist in under 5 minutes. The embed widget is a game changer.' },
]

const EASE_OUT = [0.16, 1, 0.3, 1] as const

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  // Smooth scroll only on the landing page
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
    const id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy() }
  }, [])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <motion.header
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md"
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <motion.div
              className="size-6 rounded-md bg-foreground flex items-center justify-center"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Trophy className="size-3.5 text-background" />
            </motion.div>
            DrawVault
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {['#features', '#pricing'].map((href, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, ease: EASE_OUT }}
              >
                <Link href={href} className="hover:text-foreground transition-colors">
                  {href === '#features' ? 'Features' : 'Pricing'}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: EASE_OUT }}
            >
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            </motion.div>
          </nav>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: EASE_OUT }}
          >
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5 rounded-full">
                Get started <ArrowRight className="size-3" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative mx-auto max-w-4xl px-4 pt-28 pb-20 text-center">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Badge variant="secondary" className="mb-8 rounded-full px-4 py-1.5 text-xs font-medium gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live draws for streamers & companies
            </Badge>
          </motion.div>

          {/* Headline */}
          <div className="mb-6 overflow-hidden">
            <motion.h1
              className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.08]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
            >
              Run giveaways your
              <br />
              <span className="text-display text-6xl sm:text-8xl">audience will love</span>
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT }}
          >
            Create beautiful entry forms, collect entries in real-time, and draw winners
            live with a dramatic slot machine animation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center justify-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT }}
          >
            <Link href="/signup">
              <Button size="lg" className="h-11 px-8 rounded-full gap-2">
                Start for free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-11 px-8 rounded-full">
                Sign in
              </Button>
            </Link>
          </motion.div>

          <motion.p
            className="text-xs text-muted-foreground mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            No credit card required · Free forever plan
          </motion.p>
        </motion.div>
      </section>

      {/* ── Dashboard mockup ──────────────────────────────────────────────── */}
      <ScaleIn className="mx-auto max-w-4xl px-4 pb-28">
        <div className="rounded-2xl border bg-card overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-border" />
              <div className="size-2.5 rounded-full bg-border" />
              <div className="size-2.5 rounded-full bg-border" />
            </div>
            <div className="flex-1 mx-4 rounded-md bg-background border px-3 py-1 text-xs text-muted-foreground text-center">
              drawvault.site/dashboard
            </div>
          </div>
          {/* Content */}
          <div className="p-6 grid gap-4">
            <div className="grid grid-cols-4 gap-3">
              {[['3', 'Forms'], ['1,247', 'Entries'], ['2', 'Active'], ['5', 'Winners']].map(([n, l], i) => (
                <motion.div
                  key={l}
                  className="rounded-xl border bg-muted/30 p-3 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: EASE_OUT }}
                >
                  <p className="text-lg font-bold">{n}</p>
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Summer Giveaway 🎉', status: 'active' },
                { name: 'Early Access Waitlist', status: 'active' },
                { name: 'Gaming Tournament', status: 'draft' },
              ].map((form, i) => (
                <motion.div
                  key={form.name}
                  className="rounded-xl border overflow-hidden"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: EASE_OUT }}
                >
                  <div className={`h-1 ${form.status === 'active' ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                  <div className="p-3">
                    <p className="text-xs font-medium truncate">{form.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block border ${form.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {form.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScaleIn>

      <Separator />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-28">
        <FadeIn className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">Features</p>
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            Everything to run<br />
            <span className="text-display text-5xl">great giveaways</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Built for streamers who want drama, and companies who want reliability.
          </p>
        </FadeIn>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <HoverCard>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <motion.div
                      className="size-10 rounded-xl bg-muted flex items-center justify-center mb-3"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <f.icon className="size-4" />
                    </motion.div>
                    <CardTitle className="text-base font-semibold">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Separator />

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-28">
        <FadeIn className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">Testimonials</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            Loved by <span className="text-display text-5xl">creators</span>
          </h2>
        </FadeIn>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.handle}>
              <HoverCard>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 400 }}
                        >
                          <Star className="size-4 fill-foreground text-foreground" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.handle}</p>
                    </div>
                  </CardContent>
                </Card>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Separator />

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-28">
        <FadeIn className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">Pricing</p>
          <h2 className="text-4xl font-semibold tracking-tight mb-3">
            Simple, <span className="text-display text-5xl">transparent</span> pricing
          </h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
        </FadeIn>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <StaggerItem key={plan.name}>
              <Card className={`relative flex flex-col h-full transition-shadow hover:shadow-lg ${plan.highlight ? 'border-foreground shadow-md' : ''}`}>
                {plan.highlight && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge className="px-3">Most Popular</Badge>
                  </motion.div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-5">
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f, i) => (
                      <motion.li
                        key={f}
                        className="flex items-center gap-2.5 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                      >
                        <Check className="size-4 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button
                      className="w-full rounded-full"
                      variant={plan.highlight ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
        <FadeIn>
          <p className="text-center text-xs text-muted-foreground mt-8">
            All plans include 14-day money-back guarantee · Cancel anytime
          </p>
        </FadeIn>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-28">
        <ScaleIn>
          <Card className="text-center p-14 bg-foreground text-background border-0 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 70% 50%, white 0%, transparent 60%)',
              }}
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Trophy className="size-12 mx-auto mb-5 opacity-80" />
            </motion.div>
            <h2 className="text-3xl font-semibold mb-3 tracking-tight">
              Ready to run your first draw?
            </h2>
            <p className="text-background/70 mb-8 max-w-md mx-auto leading-relaxed">
              Create your form, share the link, and draw a winner live — all in under 5 minutes.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="rounded-full h-11 px-8 gap-2">
                Start for free <ArrowRight className="size-4" />
              </Button>
            </Link>
          </Card>
        </ScaleIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <div className="size-5 rounded bg-foreground flex items-center justify-center">
              <Trophy className="size-3 text-background" />
            </div>
            DrawVault
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <p>© {new Date().getFullYear()} DrawVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
