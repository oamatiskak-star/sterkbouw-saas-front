// pages/api/projects.js - API route voor project management
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Check for GET method (zoek projecten)
  if (req.method === 'GET') {
    try {
      const { user_id } = req.query

      if (!user_id) {
        return res.status(400).json({ 
          error: 'User ID is required',
          message: 'Please provide a user_id query parameter'
        })
      }

      console.log(`🔍 Fetching projects for user: ${user_id}`)

      // Query Supabase - gebruik 'calculaties' tabel (zoals in je nieuw.js)
      const { data, error } = await supabase
        .from('calculaties')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ 
          error: 'Database error',
          details: error.message 
        })
      }

      console.log(`✅ Found ${data?.length || 0} projects`)

      return res.status(200).json(data || [])

    } catch (error) {
      console.error('API error:', error)
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }

  // Check for POST method (nieuw project)
  if (req.method === 'POST') {
    try {
      const projectData = req.body

      if (!projectData.user_id) {
        return res.status(400).json({ 
          error: 'User ID is required',
          message: 'Please provide a user_id in the request body'
        })
      }

      console.log('📝 Creating new project:', projectData.naam)

      const { data, error } = await supabase
        .from('calculaties')
        .insert({
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: projectData.status || 'draft'
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        return res.status(500).json({ 
          error: 'Database error',
          details: error.message 
        })
      }

      console.log('✅ Project created:', data.id)

      return res.status(201).json(data)

    } catch (error) {
      console.error('API error:', error)
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }

  // Check for DELETE method
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ 
          error: 'Project ID is required',
          message: 'Please provide an id query parameter'
        })
      }

      const { error } = await supabase
        .from('calculaties')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete error:', error)
        return res.status(500).json({ 
          error: 'Database error',
          details: error.message 
        })
      }

      console.log(`✅ Project deleted: ${id}`)

      return res.status(200).json({ 
        success: true,
        message: 'Project deleted successfully'
      })

    } catch (error) {
      console.error('API error:', error)
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }

  // Method not allowed
  return res.status(405).json({ 
    error: 'Method not allowed',
    message: 'Only GET, POST, and DELETE methods are supported' 
  })
}
