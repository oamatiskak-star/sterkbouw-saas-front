import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" })
  }

  try {
    const body = req.body || {}

    const {
      naam,
      naam_opdrachtgever,
      adres,
      postcode,
      plaatsnaam,
      land,
      telefoon,
      project_type,
      opmerking
    } = body

    const { data, error } = await supabase
      .from("projects")
      .insert({
        naam,
        naam_opdrachtgever,
        adres,
        postcode,
        plaatsnaam,
        land,
        telefoon,
        project_type,
        opmerking,
        analysis_status: false
      })
      .select("id")
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      project_id: data.id
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
