import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function canRunMailWorkflow(userId, workflowKey) {
  const { data, error } = await supabase
    .from("mail_workflow_permissions")
    .select("workflow_key")
    .eq("user_id", userId)
    .eq("workflow_key", workflowKey)
    .single()

  if (error || !data) return false
  return true
}
