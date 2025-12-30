// middleware.js
// GECOMBINEERDE EN VEILIGE AUTH MIDDLEWARE
// - Gebruikt Supabase middleware client
// - Voorkomt infinite redirects
// - Respecteert client-side auth flow

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  // Supabase middleware client (cookie-based)
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Routes die expliciet beschermd zijn
  const protectedRoutes = [
    '/admin',
    '/dashboard',
    '/bouwplaatsApp',
  ]

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Routes die NOOIT door middleware mogen worden geblokkeerd
  const isAuthRoute =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api')

  // Alleen redirecten als:
  // - route beschermd is
  // - gebruiker NIET ingelogd is
  // - het GEEN auth / api route is
  if (isProtectedRoute && !session && !isAuthRoute) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    // Alles behalve Next internals, static assets en favicon
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
