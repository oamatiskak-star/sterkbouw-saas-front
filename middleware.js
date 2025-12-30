import { NextResponse } from "next/server"

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Publieke routes (altijd toegestaan)
  const publicRoutes = [
    "/login",
    "/register",
    "/auth",
    "/api",
    "/_next",
    "/favicon.ico"
  ]

  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  if (isPublic) return NextResponse.next()

  /**
   * Supabase auth tokens beginnen met:
   * sb-<project-ref>-auth-token
   * We checken alleen of er IETS is
   */
  const hasSupabaseSession = request.cookies
    .getAll()
    .some(c => c.name.includes("sb-") && c.name.includes("auth-token"))

  if (!hasSupabaseSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("returnTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
