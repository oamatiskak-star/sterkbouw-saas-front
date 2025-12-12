import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import { sendTelegram } from "../utils/telegram.js"

const router = express.Router()

const bimUploadPath = "./uploads/bim/"
if (!fs.existsSync(bimUploadPath)) fs.mkdirSync(bimUploadPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bimUploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})

const upload = multer({ storage })

// BIM-bestand uploaden (IFC, PDF, JSON)
router.post("/upload", upload.single("bestand"), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: "Geen bestand geüpload" })

  await sendTelegram(`🧱 BIM-bestand ontvangen: ${file.originalname}`)
  res.status(200).json({ message: "Upload succesvol", bestand: file.filename })
})

// Lijst van geüploade BIM-bestanden
router.get("/list", (req, res) => {
  const bestanden = fs.readdirSync(bimUploadPath)
  res.status(200).json({ bestanden })
})

// Verwijderen van BIM-bestand
router.delete("/delete/:filename", (req, res) => {
  const file = path.join(bimUploadPath, req.params.filename)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    return res.status(200).json({ message: "Bestand verwijderd" })
  }
  res.status(404).json({ error: "Bestand niet gevonden" })
})

export default router
