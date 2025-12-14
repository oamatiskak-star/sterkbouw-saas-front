export default async function handler(req, res) {
  const { action } = req.query

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" })
  }

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_AO_CORE_URL + "/action",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target: action,
          payload: req.body
        })
      }
    )

    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
