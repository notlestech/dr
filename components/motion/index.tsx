'use client'

import { motion, type Variants } from 'motion/react'
import type { ReactNode, ElementType } from 'react'

// ─── Shared easings ────────────────────────────────────────────────────────────
const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_INOUT = [0.4, 0, 0.2, 1] as const

// ─── FadeIn ────────────────────────────────────────────────────────────────────
interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
  amount?: number
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  once = true,
  amount = 0.2,
}: FadeInProps) {
  const offset = 28
  const initial: Record<string, number> = { opacity: 0 }
  if (direction === 'up')    initial.y = offset
  if (direction === 'down')  initial.y = -offset
  if (direction === 'left')  initial.x = offset
  if (direction === 'right') initial.x = -offset

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger container + item ───────────────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

interface StaggerProps {
  children: ReactNode
  className?: string
  once?: boolean
  amount?: number
  as?: ElementType
}

export function Stagger({ children, className, once = true, amount = 0.1, as: Tag = 'div' }: StaggerProps) {
  const MotionTag = motion.create(Tag as 'div')
  return (
    <MotionTag
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

// ─── ScaleIn ───────────────────────────────────────────────────────────────────
export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

// ─── SlideReveal — text clip-path reveal ────────────────────────────────────────
export function SlideReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <motion.div
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ─── HoverCard — interactive lift ──────────────────────────────────────────────
export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE_INOUT } }}
    >
      {children}
    </motion.div>
  )
}

// ─── Counter — animated number ─────────────────────────────────────────────────
export function AnimatedNumber({
  value,
  className,
}: {
  value: number | string
  className?: string
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      {value}
    </motion.span>
  )
}
