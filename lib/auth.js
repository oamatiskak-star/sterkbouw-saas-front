import supabase from "@/lib/supabase"

/*
Leest huidige Supabase sessie
*/
export async function getSession() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) return null
  return session
}

/*
Login met email + wachtwoord
*/
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

/*
Logout
*/
export async function signOut() {
  await supabase.auth.signOut()
}
