import { runAction } from "../../../executor/actionRouter"

export default async function handler(req, res) {
  const { action } = req.query
  const result = await runAction(action, req.body || {})
  res.json(result)
}
