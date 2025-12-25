import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("calculator_e")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data || [])
  }

  if (req.method === "POST") {
    const body = req.body || {}

    const {
      project_id,
      omschrijving,
      eenheden,
      prijs_per_eenheid
    } = body

    if (!project_id || !omschrijving) {
      return res.status(400).json({
        error: "project_id en omschrijving zijn verplicht"
      })
    }

    const { error } = await supabase
      .from("calculator_e")
      .insert({
        project_id,
        omschrijving,
        eenheden: Number(eenheden || 0),
        prijs_per_eenheid: Number(prijs_per_eenheid || 0)
      })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({ ok: true })
  }

  return res.status(405).json({
    error: "Method not allowed"
  })
}
