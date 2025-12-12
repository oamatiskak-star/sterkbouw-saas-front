import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { error } = await supabase.auth.signOut()

  if (error) {
    res.status(500).json({ error: error.message })
  } else {
    res.status(200).json({ message: "Uitgelogd" })
  }
}
