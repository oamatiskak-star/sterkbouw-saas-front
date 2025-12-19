import formidable from "formidable"

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end("METHOD_NOT_ALLOWED")
  }

  let form

  try {
    form = new formidable.IncomingForm({
      multiples: false,
      keepExtensions: true
    })
  } catch (e) {
    return res.status(500).json({ error: "FORM_INIT_FAILED" })
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "UPLOAD_FAILED" })
    }

    const workflowKey = fields?.workflow_key
    const projectId = fields?.project_id

    if (!workflowKey || !projectId) {
      return res.status(400).json({
        error: "WORKFLOW_CONTEXT_REQUIRED"
      })
    }

    /*
    Bestanden + workflow worden opgepakt door backend / executor
    */

    return res.status(200).json({ ok: true })
  })
}
