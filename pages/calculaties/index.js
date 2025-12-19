import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Calculaties() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("calculaties")
        .select("id, naam, workflow_status, kostprijs, verkoopprijs, marge")
        .order("created_at", { ascending: false })

      setRows(data || [])
    }
    load()
  }, [])

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Calculaties</h1>
        <Link href="/calculaties/nieuw">
          Nieuwe calculatie
        </Link>
      </div>

      <table width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Status</th>
            <th>Kostprijs</th>
            <th>Verkoopprijs</th>
            <th>Marge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>
                <Link href={`/calculaties/${r.id}`}>
                  {r.naam}
                </Link>
              </td>
              <td>{r.workflow_status}</td>
              <td>€ {Number(r.kostprijs).toFixed(2)}</td>
              <td>€ {Number(r.verkoopprijs).toFixed(2)}</td>
              <td>€ {Number(r.marge).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
