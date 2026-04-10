import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { RevealSection } from '@/components/home/reveal-section'
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Lenis smooth scroll — isolated client island, renders nothing */}
      <SmoothScroll />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md animate-slide-down">
        <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <div className="size-6 rounded-md bg-foreground flex items-center justify-center transition-transform hover:rotate-[15deg] hover:scale-110 duration-200">
              <Trophy className="size-3.5 text-background" />
            </div>
            DrawVault
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors animate-fade-up delay-100">Features</Link>
            <Link href="#pricing"  className="hover:text-foreground transition-colors animate-fade-up delay-150">Pricing</Link>
            <Link href="/login"    className="hover:text-foreground transition-colors animate-fade-up delay-200">Sign in</Link>
          </nav>
          <div className="flex items-center gap-2 animate-fade-in delay-300">
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5 rounded-full">
                Get started <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pt-28 pb-20 text-center">
        <div className="animate-fade-up">
          <Badge variant="secondary" className="mb-8 rounded-full px-4 py-1.5 text-xs font-medium gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live draws for streamers & companies
          </Badge>
        </div>

        <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.08] mb-6 animate-fade-up delay-100">
          Run giveaways your
          <br />
          <span className="text-display text-6xl sm:text-8xl">audience will love</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
          Create beautiful entry forms, collect entries in real-time, and draw winners
          live with a dramatic slot machine animation.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-up delay-300">
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
        </div>

        <p className="text-xs text-muted-foreground mt-5 animate-fade-in delay-500">
          No credit card required · Free forever plan
        </p>
      </section>

      {/* ── Dashboard mockup ──────────────────────────────────────────────── */}
      <RevealSection className="mx-auto max-w-4xl px-4 pb-28">
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
              {[['3', 'Forms'], ['1,247', 'Entries'], ['2', 'Active'], ['5', 'Winners']].map(([n, l]) => (
                <div key={l} className="rounded-xl border bg-muted/30 p-3 text-center">
                  <p className="text-lg font-bold">{n}</p>
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Summer Giveaway 🎉', status: 'active' },
                { name: 'Early Access Waitlist', status: 'active' },
                { name: 'Gaming Tournament', status: 'draft' },
              ].map((form) => (
                <div key={form.name} className="rounded-xl border overflow-hidden">
                  <div className={`h-1 ${form.status === 'active' ? 'bg-foreground' : 'bg-muted-foreground/40'}`} />
                  <div className="p-3">
                    <p className="text-xs font-medium truncate">{form.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block border ${form.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {form.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      <Separator />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">Features</p>
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            Everything to run<br />
            <span className="text-display text-5xl">great giveaways</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Built for streamers who want drama, and companies who want reliability.
          </p>
        </RevealSection>
        <RevealSection className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group">
              <Card className="h-full transition-[box-shadow,transform] duration-200 hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                    <f.icon className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </RevealSection>
      </section>

      <Separator />

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">Testimonials</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            Loved by <span className="text-display text-5xl">creators</span>
          </h2>
        </RevealSection>
        <RevealSection className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.handle} className="h-full transition-[box-shadow,transform] duration-200 hover:shadow-md hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-foreground text-foreground" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.handle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </RevealSection>
      </section>

      <Separator />

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-28">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">Pricing</p>
          <h2 className="text-4xl font-semibold tracking-tight mb-3">
            Simple, <span className="text-display text-5xl">transparent</span> pricing
          </h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
        </RevealSection>
        <RevealSection className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col h-full transition-[box-shadow,transform] duration-200 hover:shadow-lg hover:-translate-y-1 ${plan.highlight ? 'border-foreground shadow-md' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3">Most Popular</Badge>
                </div>
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
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="size-4 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button className="w-full rounded-full" variant={plan.highlight ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </RevealSection>
        <RevealSection>
          <p className="text-center text-xs text-muted-foreground mt-8">
            All plans include 14-day money-back guarantee · Cancel anytime
          </p>
        </RevealSection>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-28">
        <RevealSection>
          <Card className="text-center p-14 bg-foreground text-background border-0 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }}
            />
            <Trophy className="size-12 mx-auto mb-5 opacity-80 animate-float" />
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
        </RevealSection>
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
            <Link href="/login"   className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup"  className="hover:text-foreground transition-colors">Sign up</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <p>© {new Date().getFullYear()} DrawVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
