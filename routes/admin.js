import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Haal alle gebruikers op
router.get('/gebruikers', async (req, res) => {
  const { data, error } = await supabase
    .from('gebruikers')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  res.status(200).json(data)
})

// Voeg een nieuwe gebruiker toe
router.post('/gebruikers', async (req, res) => {
  const { email, rol } = req.body
  const { data, error } = await supabase
    .from('gebruikers')
    .insert([{ email, rol }])

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  res.status(201).json(data)
})

// Verwijder een gebruiker
router.delete('/gebruikers/:id', async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('gebruikers')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  res.status(200).json(data)
})

export default router
