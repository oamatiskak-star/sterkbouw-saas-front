import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Alle calculaties ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("calculaties")
    .select("*")
    .order("datum", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuwe calculatie toevoegen
router.post("/", async (req, res) => {
  const { naam, gebruiker_id, onderdelen } = req.body

  const { data, error } = await supabase
    .from("calculaties")
    .insert([{ naam, gebruiker_id, onderdelen }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Calculatie verwijderen
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from("calculaties")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(204).end()
})

export default router
