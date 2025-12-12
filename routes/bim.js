import express from "express"
import { createClient } from "@supabase/supabase-js"

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// BIM-modellen ophalen
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("bim_modellen")
    .select("*")
    .order("aangemaakt_op", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// BIM-model uploaden
router.post("/", async (req, res) => {
  const { naam, url, type } = req.body

  const { data, error } = await supabase
    .from("bim_modellen")
    .insert([{ naam, url, type }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

// BIM-model verwijderen
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from("bim_modellen")
    .delete()
    .eq("id", id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(204).end()
})

export default router
