import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Alle teamleden ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("team")
    .select("*")
    .order("aangemaakt_op", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuw teamlid toevoegen
router.post("/", async (req, res) => {
  const { naam, rol, email, telefoon } = req.body

  const { data, error } = await supabase
    .from("team")
    .insert([{ naam, rol, email, telefoon }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Teamlid bewerken
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const updates = req.body

  const { data, error } = await supabase
    .from("team")
    .update(updates)
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Teamlid verwijderen
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from("team")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(204).end()
})

export default router
