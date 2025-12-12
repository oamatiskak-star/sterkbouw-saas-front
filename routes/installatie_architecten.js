import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import { sendTelegram } from "../utils/telegram.js"

const router = express.Router()

const installPath = "./uploads/installaties/"
if (!fs.existsSync(installPath)) fs.mkdirSync(installPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, installPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})

const upload = multer({ storage })

// Upload van E- of W-tekening (PDF/PNG/DWG)
router.post("/upload", upload.single("tekening"), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: "Geen bestand ontvangen" })

  await sendTelegram(`⚡ Installatietekening geüpload: ${file.originalname}`)
  res.status(200).json({ message: "Upload succesvol", bestand: file.filename })
})

// Lijst van installatietekeningen
router.get("/list", (req, res) => {
  const bestanden = fs.readdirSync(installPath)
  res.status(200).json({ bestanden })
})

// Verwijder specifieke tekening
router.delete("/delete/:filename", (req, res) => {
  const file = path.join(installPath, req.params.filename)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    return res.status(200).json({ message: "Bestand verwijderd" })
  }
  res.status(404).json({ error: "Bestand niet gevonden" })
})

export default router
