'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { sendSignupOtp, resendSignupOtp, verifyOtpAndCreateAccount } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Trophy, Check, X, Eye, EyeOff } from 'lucide-react'

declare global {
  interface Window {
    __signupTurnstileCb?: (token: string) => void
    __signupTurnstileExpired?: () => void
  }
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const

interface PasswordRule {
  label: string
  test: (p: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'At least one uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'At least one number', test: p => /\d/.test(p) },
  { label: 'At least one special character', test: p => /[^A-Za-z0-9]/.test(p) },
]

function isPasswordValid(p: string) {
  return PASSWORD_RULES.every(r => r.test(p))
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'verify'>('form')

  // Form step state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showRules, setShowRules]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)


  // Turnstile
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const tokenRef = useRef<string | null>(null)
  const [turnstileDone, setTurnstileDone] = useState(false)

  useEffect(() => {
    window.__signupTurnstileCb = (token: string) => {
      tokenRef.current = token
      setTurnstileDone(true)
    }
    window.__signupTurnstileExpired = () => {
      tokenRef.current = null
      setTurnstileDone(false)
    }
    return () => {
      delete window.__signupTurnstileCb
      delete window.__signupTurnstileExpired
    }
  }, [])

  // Verify step state
  const [otpCode, setOtpCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!isPasswordValid(password)) {
      toast.error('Password does not meet all requirements')
      return
    }

    if (siteKey && !tokenRef.current) {
      toast.error('Please complete the bot check first')
      return
    }

    // Verify Turnstile server-side
    if (siteKey && tokenRef.current) {
      const res = await fetch('/api/auth/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenRef.current }),
      })
      const { success } = await res.json()
      if (!success) {
        toast.error('Bot check failed — please try again')
        setTurnstileDone(false)
        tokenRef.current = null
        return
      }
    }

    setLoading(true)
    const result = await sendSignupOtp(email, name)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setStep('verify')
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }
    setVerifying(true)
    const result = await verifyOtpAndCreateAccount(email, otpCode, password, name)
    if (result.error) {
      toast.error(result.error)
      setVerifying(false)
      return
    }
    // Sign in now that account is created
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Account created but sign-in failed. Please log in manually.')
      router.push('/login')
      return
    }
    toast.success('Welcome to DrawVault!')
    window.location.href = '/dashboard'
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setResending(true)
    const result = await resendSignupOtp(email, name)
    setResending(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('New code sent — check your inbox')
    // 60-second cooldown
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(c => {
        if (c <= 1) { clearInterval(interval); return 0 }
        return c - 1
      })
    }, 1000)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          className="w-full max-w-sm space-y-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-foreground text-background mb-2">
              <Trophy className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[0.4em] font-mono h-14"
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={verifying || otpCode.length !== 6}>
              {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Verify & create account
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t get the email?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
            >
              {resending
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending…</>
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend code'}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              ← Back to sign up
            </button>
          </p>
        </motion.div>
      </div>
    )
  }

  const signupBlocked = !!siteKey && !turnstileDone

  return (
    <>
    <Script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
      strategy="lazyOnload"
    />
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-sm space-y-6"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
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
            Create your account
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Start running live draws in minutes — free forever
          </motion.p>
        </div>

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

        <motion.form
          onSubmit={handleSignup}
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5, ease: EASE_OUT }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setShowRules(true)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {/* Live password requirements */}
            <AnimatePresence>
              {showRules && (
                <motion.ul
                  className="space-y-1.5 pt-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {PASSWORD_RULES.map(rule => {
                    const passed = rule.test(password)
                    return (
                      <li key={rule.label} className="flex items-center gap-2 text-xs">
                        {passed
                          ? <Check className="size-3.5 text-emerald-500 shrink-0" />
                          : <X className="size-3.5 text-muted-foreground shrink-0" />}
                        <span className={passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </li>
                    )
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {/* Turnstile widget */}
          {siteKey && (
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-callback="__signupTurnstileCb"
              data-expired-callback="__signupTurnstileExpired"
              data-theme="auto"
              data-size="normal"
            />
          )}

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={loading || !isPasswordValid(password) || signupBlocked}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {signupBlocked ? 'Complete the check above' : 'Continue'}
          </Button>
        </motion.form>

        <motion.p
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
    </>
  )
}
