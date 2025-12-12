import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Documenten ophalen voor specifieke gebruiker
router.get("/:gebruiker_id/documenten", async (req, res) => {
  const gebruiker_id = req.params.gebruiker_id

  const { data, error } = await supabase
    .from("kopers_documenten")
    .select("*")
    .eq("gebruiker_id", gebruiker_id)
    .order("upload_datum", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// Vraag of update indienen
router.post("/vraag", async (req, res) => {
  const { gebruiker_id, onderwerp, bericht } = req.body

  const { data, error } = await supabase
    .from("kopers_vragen")
    .insert([{ gebruiker_id, onderwerp, bericht }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ message: "Vraag ingediend", data })
})

export default router
