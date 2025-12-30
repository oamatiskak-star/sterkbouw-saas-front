// middleware.js
// AUTH MIDDLEWARE VOLLEDIG UITGESCHAKELD
// Reden: Supabase client-auth regelt login state
// Middleware veroorzaakte infinite redirect / hangende login

import { NextResponse } from "next/server"

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
