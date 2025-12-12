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
    .from("risicoanalyses")
    .select("*")
    .order("datum", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuwe risicoanalyse opslaan
router.post("/", async (req, res) => {
  const { project_id, risico_score, opmerkingen } = req.body

  const { data, error } = await supabase
    .from("risicoanalyses")
    .insert([{ project_id, risico_score, opmerkingen }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

export default router
