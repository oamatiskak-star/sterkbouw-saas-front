import supabase from "@/lib/supabase"

export async function getMailAccounts() {
  const { data, error } = await supabase
    .from("mail_accounts")
    .select("id, address, label")
    .eq("active", true)
    .order("label")

  if (error) return []
  return data || []
}
