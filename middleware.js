import { NextResponse } from 'next/server'

export async function middleware(request) {
  const response = NextResponse.next()

  // Simple auth check - kan later uitgebreid worden met Supabase
  const token = request.cookies.get('auth-token')
  const isLoggedIn = !!token

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/projects',
    '/calculaties',
    '/bim',
    '/reports',
    '/users',
    '/settings'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes
  const authRoutes = ['/login', '/register', '/auth']

  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect logic - basic voor nu
  if (isProtectedRoute && !isLoggedIn) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('returnTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
