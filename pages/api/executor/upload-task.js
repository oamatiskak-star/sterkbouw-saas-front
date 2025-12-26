import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" })
  }

  try {
    const body = req.body || {}
    const { project_id, files } = body

    if (!project_id) {
      return res.status(400).json({ error: "MISSING_PROJECT_ID" })
    }

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "NO_FILES" })
    }

    // executor task aanmaken
    const { error } = await supabase
      .from("executor_tasks")
      .insert({
        project_id,
        action: "upload_files",
        status: "open",
        assigned_to: "executor",
        payload: {
          project_id,
          files
        }
      })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ status: "OK" })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
