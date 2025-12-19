import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Kopersportaal() {
  const [kopers, setKopers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("kopers")
        .select("id, naam, project_naam, woning, status")
        .order("created_at", { ascending: false })

      setKopers(data || [])
      setLoading(false)
    }

    load()
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
