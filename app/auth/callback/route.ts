import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/debug'

  console.log('[auth/callback] hit — code present:', !!code, '| origin:', origin)

  if (!code) {
    console.error('[auth/callback] No code found in URL')
    return NextResponse.redirect(`${origin}/login?cb_error=no_code`)
  }

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  console.log('[auth/callback] Incoming cookies:', allCookies.map(c => c.name))

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          console.log('[auth/callback] Setting cookies:', cookiesToSet.map(c => c.name))
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message, error.status)
    return NextResponse.redirect(
      `${origin}/login?cb_error=${encodeURIComponent(error.message)}`
    )
  }

  console.log('[auth/callback] Session exchanged OK — user:', data.session?.user?.email)
  return response
}
