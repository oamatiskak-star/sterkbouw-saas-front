import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Calculaties() {
  const [rows, setRows] = useState([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCalculaties()
  }, [])

  async function loadCalculaties() {
    const { data, error } = await supabase
      .from("calculaties")
      .select("id, naam, workflow_status, kostprijs, verkoopprijs, marge")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      return
    }
    setRows(data || [])
  }

  async function handleNieuweCalculatie() {
    if (creating) return
    setCreating(true)
    setError(null)

    try {
      // Dispatch ONLY. Geen project aanmaken hier.
      const r = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_project" })
      })
      const res = await r.json()
      if (!r.ok || !res.task_id) {
        throw new Error(res.error || "Dispatch mislukt")
      }

      const taskId = res.task_id

      // Poll executor_tasks tot executor het project_id heeft gezet
      const poll = async () => {
        const { data, error } = await supabase
          .from("executor_tasks")
          .select("project_id")
          .eq("id", taskId)
          .single()

        if (!error && data?.project_id) {
          window.location.href = `/calculaties/nieuw?project_id=${data.project_id}`
          return
        }
        setTimeout(poll, 1000)
      }
      poll()
    } catch (e) {
      setError(e.message)
      setCreating(false)
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Calculaties</h1>
        <button onClick={handleNieuweCalculatie} disabled={creating}>
          Nieuwe calculatie
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}

      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
                <td><Link href={`/calculaties/${r.id}`}>{r.naam}</Link></td>
                <td>{r.workflow_status}</td>
                <td>€ {Number(r.kostprijs || 0).toFixed(2)}</td>
                <td>€ {Number(r.verkoopprijs || 0).toFixed(2)}</td>
                <td>€ {Number(r.marge || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
