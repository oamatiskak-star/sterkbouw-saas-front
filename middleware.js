import { NextResponse } from "next/server"
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { supabaseConfig } from "./utils/supabaseClient"

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient({ req, res }, supabaseConfig)

  const {
    data: { session }
  } = await supabase.auth.getSession()

  const protectedRoutes = ["/dashboard", "/admin", "/calculator", "/risico", "/bim", "/notificaties", "/projecten", "/team"]

  if (protectedRoutes.includes(req.nextUrl.pathname) && !session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}
