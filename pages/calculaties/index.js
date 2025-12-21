import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Calculaties() {
  const router = useRouter()
  const [rows, setRows] = useState([])
  const [creating, setCreating] = useState(false)

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

  async function handleNieuweCalculatie(e) {
    e.preventDefault()
    if (creating) return
    setCreating(true)

    const { data, error } = await supabase
      .from("projects")
      .insert({
        projectnaam: "Nieuw project",
        status: "nieuw"
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      alert("Project aanmaken mislukt")
      setCreating(false)
      return
    }

    router.push(`/calculaties/nieuw?project_id=${data.id}`)
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Calculaties</h1>

        <Link href="#" onClick={handleNieuweCalculatie}>
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
              <td>€ {Number(r.kostprijs || 0).toFixed(2)}</td>
              <td>€ {Number(r.verkoopprijs || 0).toFixed(2)}</td>
              <td>€ {Number(r.marge || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
