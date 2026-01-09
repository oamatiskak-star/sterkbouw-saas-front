export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" })
  }

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/api/executor/upload-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {})
    })

    const payload = await response.json()
    return res.status(response.status).json(payload)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
