import { canRunMailWorkflow } from "../../lib/mailWorkflowPermissions"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("METHOD_NOT_ALLOWED")
  }

  let body
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: "INVALID_JSON" })
  }

  const { workflow_key, project_id } = body
  const userId = req.session?.user?.id

  if (!userId || !workflow_key || !project_id) {
    return res.status(400).json({ error: "CONTEXT_REQUIRED" })
  }

  const allowed = await canRunMailWorkflow(userId, workflow_key)
  if (!allowed) {
    return res.status(403).json({ error: "NOT_ALLOWED" })
  }

  /*
  Workflow trigger naar backend / executor
  */

  return res.status(200).json({ ok: true })
}
