import formidable from "formidable"

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const form = new formidable.IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "UPLOAD_FAILED" })
    }

    const workflowKey = fields.workflow_key
    const projectId = fields.project_id

    if (!workflowKey || !projectId) {
      return res.status(400).json({ error: "WORKFLOW_CONTEXT_REQUIRED" })
    }

    // opslag + workflow trigger gebeurt backend/executor
    return res.status(200).json({ ok: true })
  })
}
