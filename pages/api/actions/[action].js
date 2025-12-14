import { runAction, getStatus } from "../../../executor/actionRouter"

export default async function handler(req, res) {
  const { action } = req.query

  if (req.method === "POST") {
    const r = await runAction(action, {})
    res.json(r)
    return
  }

  if (req.method === "GET") {
    const s = await getStatus(action)
    res.json(s)
    return
  }

  res.status(405).end()
}
