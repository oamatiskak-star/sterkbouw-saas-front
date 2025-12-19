import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function logAudit({
  user_id,
  project_id,
  workflow_key,
  action,
  meta = {}
}) {
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
