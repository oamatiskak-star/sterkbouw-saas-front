export default function handler(req, res) {
  const { module } = req.query

  res.json({
    module,
    status: "actief",
    items: [
      { name: "Breskens" },
      { name: "Hilversum" },
      { name: "Apeldoorn" }
    ],
    meta: {
      generated: true,
      timestamp: Date.now()
    }
  })
}
