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
    .order("startdatum", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuw project toevoegen
router.post("/", async (req, res) => {
  const { naam, locatie, startdatum, status } = req.body

  const { data, error } = await supabase
    .from("projecten")
    .insert([{ naam, locatie, startdatum, status }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

export default router
