import Link from 'next/link'
import type { Plan } from '@/types/app'

export function DashboardFooter({ plan }: { plan: Plan }) {
  if (plan !== 'free') return null

  return (
    <footer className="mt-auto px-6 py-5 text-center border-t border-border/50">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Ads help keep DrawVault free for everyone — please don&apos;t be mad at us 🙏
        <br />
        <Link href="/upgrade" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Upgrade to Pro
        </Link>{' '}
        to remove all ads forever.
      </p>
    </footer>
  )
}
