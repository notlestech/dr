'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Trophy } from 'lucide-react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

declare global {
  interface Window {
    __loginTurnstileToken?: string
    __loginTurnstileCb?: (token: string) => void
    __loginTurnstileExpired?: () => void
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const turnstileTokenRef = useRef<string | null>(null)
  const [turnstileReady, setTurnstileReady] = useState(!SITE_KEY) // skip if no key configured

  useEffect(() => {
    if (!SITE_KEY) return
    window.__loginTurnstileCb = (token: string) => {
      turnstileTokenRef.current = token
      setTurnstileReady(true)
    }
    window.__loginTurnstileExpired = () => {
      turnstileTokenRef.current = null
      setTurnstileReady(false)
    }
    return () => {
      delete window.__loginTurnstileCb
      delete window.__loginTurnstileExpired
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (SITE_KEY && !turnstileTokenRef.current) {
      toast.error('Please complete the bot check')
      return
    }

    if (SITE_KEY) {
      // Verify Turnstile server-side before signing in
      const res = await fetch('/api/auth/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileTokenRef.current }),
      })
      const { success } = await res.json()
      if (!success) {
        toast.error('Bot check failed. Please try again.')
        return
      }
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <>
      {SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          className="w-full max-w-sm space-y-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          {/* Logo */}
          <div className="text-center space-y-3">
            <motion.div
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-foreground text-background mb-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Trophy className="size-5" />
            </motion.div>
            <motion.h1
              className="text-2xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASE_OUT }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Sign in to your DrawVault account
            </motion.p>
          </div>

          {/* Google */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: EASE_OUT }}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </motion.div>

          {/* Email form */}
          <motion.form
            onSubmit={handleLogin}
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5, ease: EASE_OUT }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Cloudflare Turnstile */}
            {SITE_KEY && (
              <div
                className="cf-turnstile"
                data-sitekey={SITE_KEY}
                data-callback="__loginTurnstileCb"
                data-expired-callback="__loginTurnstileExpired"
                data-theme="auto"
              />
            )}

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading || (!!SITE_KEY && !turnstileReady)}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sign in
            </Button>
          </motion.form>

          <motion.p
            className="text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
              Sign up free
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}
