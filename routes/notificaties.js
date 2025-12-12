import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Alle notificaties ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("notificaties")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuwe notificatie toevoegen
router.post("/", async (req, res) => {
  const { gebruiker_id, type, bericht, belangrijk } = req.body

  const { data, error } = await supabase
    .from("notificaties")
    .insert([{ gebruiker_id, type, bericht, belangrijk }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// Specifieke notificatie markeren als gelezen
router.patch("/:id", async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("notificaties")
    .update({ gelezen: true })
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

export default router
