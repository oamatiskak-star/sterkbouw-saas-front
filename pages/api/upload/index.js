// pages/api/upload/index.js
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { supabase } from '@/lib/supabase'

const router = createRouter()

router.post(async (req, res) => {
  try {
    // Vereenvoudigde versie zonder multer voor nu
    return res.status(200).json({
      success: true,
      message: 'Upload API is in onderhoud',
      note: 'Multer dependency is tijdelijk uitgeschakeld'
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    })
  }
})

export default router.handler({
  onError: (err, req, res) => {
    console.error('Upload API error:', err)
    res.status(500).json({ error: err.message })
  },
})
