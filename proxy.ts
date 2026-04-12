import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') ?? 'drawvault.site'

  // Subdomain detection — only rewrite root path to /f/[subdomain]
  // API routes and other paths must pass through unchanged so that fetches
  // from the public form page (e.g. /api/forms/[subdomain]/submit) work.
  if (host !== appDomain && host !== `www.${appDomain}` && !host.includes('localhost') && !host.includes('vercel.app')) {
    const subdomain = host.replace(`.${appDomain}`, '')
    if (subdomain && subdomain !== 'www' && request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = `/f/${subdomain}`
      return NextResponse.rewrite(url)
    }
  }

  // Supabase Auth session refresh
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes — redirect to login if not authenticated
  const isProtectedPath = request.nextUrl.pathname.startsWith('/forms') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/upgrade') ||
    (request.nextUrl.pathname === '/' && !request.nextUrl.pathname.startsWith('/f/'))

  // Allow public paths
  const isPublicPath =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/f/') ||
    request.nextUrl.pathname.startsWith('/stream/') ||
    request.nextUrl.pathname.startsWith('/winners/') ||
    request.nextUrl.pathname.startsWith('/embed/') ||
    request.nextUrl.pathname.startsWith('/replay/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/'

  if (!user && isProtectedPath && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // NOTE: do NOT redirect logged-in users away from /login here.
  // The dashboard layout redirects to /login when workspace data is missing,
  // and redirecting them back to /dashboard from the proxy creates an infinite
  // redirect loop. The login page handles the already-logged-in case itself.

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
