cat > pages/api/upload/index.js << 'EOF'
// pages/api/upload/index.js
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { supabase } from '@/lib/supabase'

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4()
    const extension = path.extname(file.originalname)
    cb(null, `${uniqueId}${extension}`)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('File type not allowed'), false)
    }
  }
})

const router = createRouter()

// Disable body parsing for multer
export const config = {
  api: {
    bodyParser: false,
  },
}

// Upload handler
const uploadMiddleware = upload.array('files', 10)

router.use((req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message })
    } else if (err) {
      return res.status(500).json({ error: err.message })
    }
    next()
  })
})

router.post(async (req, res) => {
  try {
    const { projectId, category, userId } = req.body
    const files = req.files

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadResults = []

    for (const file of files) {
      // Upload naar Supabase Storage
      const fileExt = path.extname(file.originalname)
      const fileName = `${uuidv4()}${fileExt}`
      const filePath = `project-documents/${projectId || 'general'}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      // Opslaan in database
      const documentData = {
        filename: file.originalname,
        storage_path: filePath,
        project_id: projectId || null,
        category: category || 'general',
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
        file_size: file.size,
        mime_type: file.mimetype,
        status: 'active',
      }

      const { data: dbData, error: dbError } = await supabase
        .from('documents')
        .insert([documentData])
        .select()

      if (dbError) {
        console.error('Database error:', dbError)
      } else {
        uploadResults.push({
          originalName: file.originalname,
          documentId: dbData[0]?.id,
          filePath: filePath,
          size: file.size,
          mimeType: file.mimetype,
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} file(s)`,
      files: uploadResults,
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
EOF
