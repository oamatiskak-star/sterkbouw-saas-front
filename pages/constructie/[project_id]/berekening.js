import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ConstructieBerekening() {
  const router = useRouter()
  const { project_id } = router.query

  const [berekeningen, setBerekeningen] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("constructie_berekeningen")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", { ascending: true })

      setBerekeningen(data || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Constructie berekening – Project</h1>

      {berekeningen.length === 0 && <p>Geen berekeningen aanwezig.</p>}

      {berekeningen.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Omschrijving</th>
              <th>Kosten</th>
              <th>Arbeid</th>
              <th>Totaal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {berekeningen.map(b => (
              <tr key={b.id}>
                <td>{b.omschrijving}</td>
                <td>€ {Number(b.kosten).toFixed(2)}</td>
                <td>€ {Number(b.arbeid).toFixed(2)}</td>
                <td>€ {Number(b.totaal).toFixed(2)}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
