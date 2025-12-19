import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getDashboardKpis() {
  const { data, error } = await supabase
    .from("kpi_values")
    .select("kpi_key, label, value")
    .eq("scope", "dashboard")
    .order("sort_order")

  if (error || !data) return []
  return data
}
