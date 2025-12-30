import { NextResponse } from "next/server"

export function middleware(request) {
  // ❗ Supabase auth wordt client-side gedaan
  // ❗ Middleware mag NIET op cookies controleren

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
