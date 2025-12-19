import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getMailAccounts() {
  const { data, error } = await supabase
    .from("mail_accounts")
    .select("id, address, label")
    .eq("active", true)
    .order("label")

  if (error) return []
  return data || []
}
