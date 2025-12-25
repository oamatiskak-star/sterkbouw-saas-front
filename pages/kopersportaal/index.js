import { useEffect, useState } from "react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function Kopersportaal() {
  const [kopers, setKopers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from("kopers")
        .select("id, naam, project_naam, woning, status")
        .order("created_at", { ascending: false })

      if (!cancelled) {
        setKopers(data || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return null

  return (
    <>
      <h1>Kopersportaal</h1>

      {kopers.length === 0 && (
        <p>Geen kopers beschikbaar.</p>
      )}

      {kopers.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Koper</th>
              <th>Project</th>
              <th>Woning</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {kopers.map(k => (
              <tr key={k.id}>
                <td>
                  <Link href={`/kopersportaal/${k.id}`}>
                    {k.naam}
                  </Link>
                </td>
                <td>{k.project_naam}</td>
                <td>{k.woning}</td>
                <td>{k.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
