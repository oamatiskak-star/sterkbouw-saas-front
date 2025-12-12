import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Alle risicoanalyses ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("risicoanalyse")
    .select("*")

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Risicoanalyse toevoegen
router.post("/", async (req, res) => {
  const { project_id, categorie, impact, kans, toelichting } = req.body

  const { data, error } = await supabase
    .from("risicoanalyse")
    .insert([{ project_id, categorie, impact, kans, toelichting }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Risicoanalyse verwijderen
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("risicoanalyse")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

export default router
