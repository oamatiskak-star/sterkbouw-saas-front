export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const {
    mail_account_id,
    workflow_key,
    project_id
  } = req.body

  if (!mail_account_id || !workflow_key || !project_id) {
    return res.status(400).json({ error: "CONTEXT_REQUIRED" })
  }

  // verzending + workflow trigger via backend/executor
  return res.status(200).json({ ok: true })
}
