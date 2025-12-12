import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Alle projecten ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("projecten")
    .select("*")

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuw project toevoegen
router.post("/", async (req, res) => {
  const { naam, locatie, status } = req.body

  const { data, error } = await supabase
    .from("projecten")
    .insert([{ naam, locatie, status }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Project verwijderen
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("projecten")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

export default router
