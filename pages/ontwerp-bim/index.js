import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function OntwerpBIMDashboard() {
  const [projecten, setProjecten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("projecten")
        .select("id, naam, status")
        .order("created_at", { ascending: false })

      setProjecten(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null

  return (
    <div style={{ padding: 16 }}>
      <h1>Ontwerp & BIM Dashboard</h1>

      {projecten.length === 0 && <p>Geen projecten beschikbaar.</p>}

      {projecten.map(p => (
        <div
          key={p.id}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12
          }}
        >
          <strong>{p.naam}</strong>
          <div style={{ fontSize: 14, marginBottom: 8 }}>
            Status: {p.status}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/ontwerp-bim/${p.id}/tekeningen`}>
              <button>Tekeningen</button>
            </Link>

            <Link href={`/ontwerp-bim/${p.id}/bim-model`}>
              <button>BIM Model</button>
            </Link>

            <Link href={`/ontwerp-bim/${p.id}/revisies`}>
              <button>Revisies</button>
            </Link>

            <Link href={`/ontwerp-bim/${p.id}/documenten`}>
              <button>Documenten</button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
