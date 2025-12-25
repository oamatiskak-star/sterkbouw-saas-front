import { useEffect, useState } from "react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function RapportagesDashboard() {
  const [projecten, setProjecten] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("projecten")
        .select("id, naam, status, startdatum, einddatum")
        .order("startdatum", { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setProjecten(data || [])
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div>Loading…</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>

  return (
    <div style={{ padding: 16 }}>
      <h1>Rapportages financiers</h1>

      {projecten.length === 0 && <p>Geen projecten beschikbaar.</p>}

      {projecten.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Startdatum</th>
              <th>Einddatum</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {projecten.map(p => (
              <tr key={p.id}>
                <td>{p.naam}</td>
                <td>{p.status}</td>
                <td>{p.startdatum || "-"}</td>
                <td>{p.einddatum || "-"}</td>
                <td>
                  <Link href={`/rapportages/${p.id}`}>
                    <button>Bekijk rapport</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
