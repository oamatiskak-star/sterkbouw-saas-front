import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import { sendTelegram } from "../utils/telegram.js"

const router = express.Router()

// Upload map
const uploadPath = "./uploads/bim/"
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})

const upload = multer({ storage })

// Upload BIM-bestand
router.post("/upload", upload.single("bimfile"), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: "Geen bestand geüpload" })

  // Simpele bestandscontrole op IFC
  if (!file.originalname.endsWith(".ifc")) {
    return res.status(400).json({ error: "Alleen .ifc-bestanden zijn toegestaan" })
  }

  await sendTelegram(`📁 BIM-bestand geüpload: ${file.filename}`)
  res.status(200).json({ message: "Upload succesvol", file: file.filename })
})

export default router
