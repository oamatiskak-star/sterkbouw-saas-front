import { getSupabase } from "@/lib/supabase"

export async function logAudit({
  user_id,
  project_id,
  workflow_key,
  action,
  meta = {}
}) {
  const supabase = getSupabase()

  await supabase.from("audit_logs").insert([
    {
      user_id,
      project_id,
      workflow_key,
      action,
      meta
    }
  ])
}
