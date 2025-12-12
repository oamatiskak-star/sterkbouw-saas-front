import { NextResponse } from "next/server"

export async function middleware(req) {
  const token = req.cookies["sb-access-token"]

  const isAuthRoute = req.nextUrl.pathname.startsWith("/login")
  const isProtectedRoute = ["/dashboard", "/bim", "/calculator", "/risico", "/notificaties", "/admin", "/projecten", "/team"].includes(req.nextUrl.pathname)

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}
