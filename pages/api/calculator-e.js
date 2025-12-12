import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
if (req.method === "GET") {
const { data, error } = await supabase
.from("calculator_e")
.select("*")
.order("id", { ascending: false })

if (error) return res.status(500).json([])
return res.status(200).json(data)


}

if (req.method === "POST") {
const { project_id, omschrijving, eenheden, prijs_per_eenheid } = req.body

const { error } = await supabase.from("calculator_e").insert([
  { project_id, omschrijving, eenheden, prijs_per_eenheid }
])

if (error) return res.status(500).json({ ok: false })
return res.status(200).json({ ok: true })


}

res.status(405).end()
}
