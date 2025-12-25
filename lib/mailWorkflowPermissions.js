import supabase from "@/lib/supabase"

/*
Controleert of gebruiker een mail-workflow mag uitvoeren
Fail-safe: altijd false bij fout
*/
export async function canRunMailWorkflow(userId, workflowKey) {
  if (!userId || !workflowKey) {
    return false
  }

  const { data, error } = await supabase
    .from("mail_workflow_permissions")
    .select("workflow_key")
    .eq("user_id", userId)
    .eq("workflow_key", workflowKey)
    .limit(1)

  if (error) {
    return false
  }

  return Array.isArray(data) && data.length === 1
}
