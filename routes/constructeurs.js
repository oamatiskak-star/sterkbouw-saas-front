import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import { sendTelegram } from "../utils/telegram.js"

const router = express.Router()

const constructorPath = "./uploads/constructeurs/"
if (!fs.existsSync(constructorPath)) fs.mkdirSync(constructorPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, constructorPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})

const upload = multer({ storage })

// Upload rekenblad of detailbestand
router.post("/upload", upload.single("bestand"), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: "Geen bestand ontvangen" })

  await sendTelegram(`📐 Constructeursbestand ontvangen: ${file.originalname}`)
  res.status(200).json({ message: "Upload succesvol", bestand: file.filename })
})

// Lijst bestanden
router.get("/list", (req, res) => {
  const bestanden = fs.readdirSync(constructorPath)
  res.status(200).json({ bestanden })
})

// Verwijder bestand
router.delete("/delete/:filename", (req, res) => {
  const file = path.join(constructorPath, req.params.filename)
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    return res.status(200).json({ message: "Bestand verwijderd" })
  }
  res.status(404).json({ error: "Bestand niet gevonden" })
})

export default router
