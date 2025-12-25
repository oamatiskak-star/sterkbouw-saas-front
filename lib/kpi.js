import supabase from "@/lib/supabase"

export async function getDashboardKpis() {
  const { data, error } = await supabase
    .from("kpi_values")
    .select("kpi_key, label, value")
    .eq("scope", "dashboard")
    .order("sort_order")

  if (error || !data) return []
  return data
}
