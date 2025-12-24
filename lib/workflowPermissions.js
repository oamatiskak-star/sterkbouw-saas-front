import supabase from "@/lib/supabase"

export async function canRunWorkflow(userId, workflowKey) {
  if (!userId || !workflowKey) return false

  const { data, error } = await supabase
    .from("workflow_permissions")
    .select("workflow_key")
    .eq("user_id", userId)
    .eq("workflow_key", workflowKey)
    .maybeSingle()

  if (error || !data) return false
  return true
}
