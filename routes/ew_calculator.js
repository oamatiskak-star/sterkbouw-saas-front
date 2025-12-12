import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Berekening opslaan
router.post("/bereken", async (req, res) => {
  const { project_id, type_installatie, oppervlakte_m2, aantal_units } = req.body

  const prijs_per_m2 = type_installatie === "elektro" ? 120 : 180
  const totaalprijs = prijs_per_m2 * oppervlakte_m2 * aantal_units

  const { data, error } = await supabase
    .from("ew_calculaties")
    .insert([{ project_id, type_installatie, oppervlakte_m2, aantal_units, totaalprijs }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ totaalprijs, data })
})

// Historie opvragen per project
router.get("/historie/:project_id", async (req, res) => {
  const project_id = req.params.project_id

  const { data, error } = await supabase
    .from("ew_calculaties")
    .select("*")
    .eq("project_id", project_id)
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

export default router
