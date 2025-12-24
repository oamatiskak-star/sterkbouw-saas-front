import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { projectId, fileName } = req.body

  if (!projectId || !fileName) {
    return res.status(400).json({ error: "Missing projectId or fileName" })
  }

  try {
    const { signedURL, error } = await supabase.storage
      .from("sterkcalc")
      .createSignedUrl(`${projectId}/${fileName}`, 3600)

    if (error) throw error

    return res.status(200).json({ url: signedURL })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
