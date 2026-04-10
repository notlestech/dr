import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') ?? 'drawvault.site'

  // Subdomain detection — only in production
  if (host !== appDomain && host !== `www.${appDomain}` && !host.includes('localhost') && !host.includes('vercel.app')) {
    const subdomain = host.replace(`.${appDomain}`, '')
    if (subdomain && subdomain !== 'www') {
      const url = request.nextUrl.clone()
      url.pathname = `/f/${subdomain}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`
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

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
