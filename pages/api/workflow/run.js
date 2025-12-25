import { canRunWorkflow } from "../../../lib/workflowPermissions"
import { logAudit } from "../../../lib/audit"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" })
  }

  let body
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: "INVALID_JSON" })
  }

  const { workflow_key, project_id, user_id } = body

  if (!workflow_key || !project_id) {
    return res.status(400).json({ error: "CONTEXT_REQUIRED" })
  }

  if (user_id) {
    const allowed = await canRunWorkflow(user_id, workflow_key)
    if (!allowed) {
      return res.status(403).json({ error: "NOT_ALLOWED" })
    }
  }

  // voorkom dubbele open taken
  const { data: existing } = await supabase
    .from("executor_tasks")
    .select("id")
    .eq("project_id", project_id)
    .eq("task_type", workflow_key)
    .eq("status", "open")
    .maybeSingle()

  if (existing) {
    return res.status(409).json({
      error: "WORKFLOW_ALREADY_RUNNING"
    })
  }

  // audit altijd loggen
  await logAudit({
    user_id: user_id || null,
    project_id,
    workflow_key,
    action: "workflow_run"
  })

  if (workflow_key === "analysis") {
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        analysis_status: "running",
        updated_at: new Date().toISOString()
      })
      .eq("id", project_id)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    const { error: taskError } = await supabase
      .from("executor_tasks")
      .insert({
        project_id,
        task_type: "analysis",
        status: "open",
        payload: { project_id }
      })

    if (taskError) {
      return res.status(500).json({ error: taskError.message })
    }
  } else {
    return res.status(400).json({
      error: "UNKNOWN_WORKFLOW"
    })
  }

  return res.status(200).json({
    ok: true,
    workflow_key,
    project_id
  })
}
