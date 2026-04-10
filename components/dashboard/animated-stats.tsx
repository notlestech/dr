'use client'

import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, Zap, Users, Trophy, Plus, TrendingUp } from 'lucide-react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

const STAT_ICONS: Record<string, React.ElementType> = {
  Layers, Zap, Users, Trophy,
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  Plus, Zap, TrendingUp,
}

interface Stat {
  label: string
  value: string | number
  icon: string
  sub: string
}

export function AnimatedStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = STAT_ICONS[stat.icon]
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <motion.div
                  className="text-2xl font-bold tabular-nums"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08, type: 'spring', stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

interface QuickAction {
  href: string
  icon: string
  label: string
  desc: string
}

export function AnimatedQuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action, i) => {
        const Icon = ACTION_ICONS[action.icon]
        return (
          <motion.a
            key={action.href}
            href={action.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: EASE_OUT }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <Card className="hover:border-foreground/30 transition-colors cursor-pointer group h-full hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-4">
                <motion.div
                  className="size-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {Icon && <Icon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                </motion.div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.a>
        )
      })}
    </div>
  )
}
