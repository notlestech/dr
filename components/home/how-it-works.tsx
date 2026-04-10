import { PenLine, Share2, Dice5 } from 'lucide-react'
import { RevealSection } from './reveal-section'

const STEPS = [
  {
    icon: PenLine,
    title: 'Create your form',
    desc: 'Pick from 10 beautiful templates, set your prizes and entry rules — ready in under 2 minutes.',
  },
  {
    icon: Share2,
    title: 'Share your link',
    desc: 'Every form gets its own subdomain. Drop it in chat, tweet it, or embed it on your site.',
  },
  {
    icon: Dice5,
    title: 'Draw a winner live',
    desc: 'Launch the slot machine with one click. Fullscreen mode is built for OBS capture on stream.',
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-28">
      <RevealSection className="text-center mb-16">
        <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wider uppercase">How it works</p>
        <h2 className="text-4xl font-semibold tracking-tight">
          Up and running in <span className="text-display text-5xl">minutes</span>
        </h2>
      </RevealSection>

      <div className="grid md:grid-cols-3 gap-10">
        {STEPS.map((s, i) => (
          <RevealSection key={s.title} delay={i * 120} className="flex flex-col items-center text-center">
            <div className="relative mb-5 shrink-0">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
                <s.icon className="size-6" />
              </div>
              <span className="absolute -top-2 -right-2 size-6 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center select-none">
                {i + 1}
              </span>
            </div>
            <h3 className="font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </RevealSection>
        ))}
      </div>
    </section>
  )
}
