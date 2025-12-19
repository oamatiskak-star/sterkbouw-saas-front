import { canProcessMailWorkflow } from "../../../lib/mailWorkflowPermissions"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const { workflow_key, project_id } = JSON.parse(req.body)
  const userId = req.session?.user?.id

  if (!userId || !workflow_key || !project_id) {
    return res.status(400).json({ error: "CONTEXT_REQUIRED" })
  }

  const allowed = await canRunMailWorkflow(userId, workflow_key)
  if (!allowed) {
    return res.status(403).json({ error: "NOT_ALLOWED" })
  }

  // workflow trigger naar backend/executor
  return res.status(200).json({ ok: true })
}
