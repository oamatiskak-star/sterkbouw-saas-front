import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import { sendTelegram } from "../utils/telegram.js"

const router = express.Router()

const huurdersUploadPath = "./uploads/huurders/"
if (!fs.existsSync(huurdersUploadPath)) fs.mkdirSync(huurdersUploadPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, huurdersUploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})

const upload = multer({ storage })

// Upload document
router.post("/upload", upload.single("document"), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: "Geen bestand geüpload" })

  await sendTelegram(`📎 Document geüpload voor huurders: ${file.originalname}`)
  res.status(200).json({ message: "Upload succesvol", file: file.filename })
})

// Ophaal alle documenten
router.get("/list", (req, res) => {
  const files = fs.readdirSync(huurdersUploadPath)
  res.status(200).json({ files })
})

// Verwijder document
router.delete("/delete/:filename", (req, res) => {
  const file = path.join(huurdersUploadPath, req.params.filename)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    return res.status(200).json({ message: "Document verwijderd" })
  }
  res.status(404).json({ error: "Bestand niet gevonden" })
})

export default router
