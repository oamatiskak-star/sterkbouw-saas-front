import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("projecten")
      .select("id, naam, created_at")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data || [])
  }

  if (req.method === "POST") {
    const body = req.body || {}

    const { naam } = body

    const { data, error } = await supabase
      .from("projecten")
      .insert({
        naam: naam || "Nieuw project",
        status: "naw_complete"
      })
      .select("id")
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({
      project_id: data.id
    })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
