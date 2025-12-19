export default async function handler(req, res) {
  const { onderwerp, bericht, bijlagen } = req.body

  // Voorbeeld AI-analyse
  // In echte implementatie: GPT + rules engines
  const acties = []

  if (onderwerp.toLowerCase().includes("factuur") || bijlagen.some(b => b.endsWith(".pdf"))) {
    acties.push({
      type: "inkoop_order",
      project_id: "PASTE_PROJECT_ID",
      discipline: "Algemeen",
      omschrijving: "Factuur verwerkt",
      bedrag: 1000
    })
  }

  if (onderwerp.toLowerCase().includes("contract")) {
    acties.push({
      type: "contracten",
      project_id: "PASTE_PROJECT_ID",
      naam: "Nieuw contract",
      bestand: bijlagen[0] || null
    })
  }

  if (bericht.toLowerCase().includes("vraag")) {
    acties.push({
      type: "notificatie",
      project_id: "PASTE_PROJECT_ID",
      bericht: "Nieuwe vraag ontvangen",
      type: "info"
    })
  }

  res.status(200).json({ acties })
}
