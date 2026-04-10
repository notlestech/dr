import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const resend = new Proxy({} as Resend, {
  get(_t, prop) {
    return (getResend() as never)[prop]
  },
})

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@drawvault.site'
