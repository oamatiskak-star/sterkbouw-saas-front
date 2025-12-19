import { canRunWorkflow } from "../../../lib/workflowPermissions"
import { logAudit } from "../../../lib/audit"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const { workflow_key, project_id } = JSON.parse(req.body)
  const userId = req.session?.user?.id

  if (!userId || !workflow_key || !project_id) {
    return res.status(400).json({ error: "CONTEXT_REQUIRED" })
  }

  const allowed = await canRunWorkflow(userId, workflow_key)
  if (!allowed) {
    return res.status(403).json({ error: "NOT_ALLOWED" })
  }

  await logAudit({
    user_id: userId,
    project_id,
    workflow_key,
    action: "workflow_run"
  })

  return res.status(200).json({ ok: true })
}
