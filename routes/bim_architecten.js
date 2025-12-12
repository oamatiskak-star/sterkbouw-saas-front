import express from "express"
import supabase from "../../../supabaseClient.js"

const router = express.Router()

// GET: Alle BIM-projecten ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("bim_architecten").select("*").order("created_at", { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST: Nieuw BIM-project toevoegen
router.post("/", async (req, res) => {
  const { project_id, architect_id, model_url, opmerking } = req.body

  const { data, error } = await supabase.from("bim_architecten").insert([
    {
      project_id,
      architect_id,
      model_url,
      opmerking
    }
  ])

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PUT: BIM-project bewerken
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { model_url, opmerking } = req.body

  const { data, error } = await supabase.from("bim_architecten").update({ model_url, opmerking }).eq("id", id)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE: BIM-project verwijderen
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const { error } = await supabase.from("bim_architecten").delete().eq("id", id)

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

export default router
