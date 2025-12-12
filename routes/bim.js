import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Alle BIM-documenten ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("bim_documenten")
    .select("*")
    .order("upload_datum", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuw BIM-document uploaden
router.post("/", async (req, res) => {
  const { project_id, bestandsnaam, bestand_url, omschrijving } = req.body

  const { data, error } = await supabase
    .from("bim_documenten")
    .insert([{ project_id, bestandsnaam, bestand_url, omschrijving }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

export default router
