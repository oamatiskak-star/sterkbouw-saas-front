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
    .order("aangemaakt_op", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Nieuwe notificatie toevoegen
router.post("/", async (req, res) => {
  const { titel, inhoud, type } = req.body

  const { data, error } = await supabase
    .from("notificaties")
    .insert([{ titel, inhoud, type }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

export default router
