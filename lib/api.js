import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getSession() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return session
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data.session
}

export async function signOut() {
  await supabase.auth.signOut()
}
