import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function MailDashboard() {
  const [mails, setMails] = useState([])
  const [nieuwBericht, setNieuwBericht] = useState({
    project_id: "",
    onderwerp: "",
    bericht: ""
  })
  const [projecten, setProjecten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: p } = await supabase
        .from("projecten")
        .select("id, naam")
        .order("naam", { ascending: true })

      const { data: m } = await supabase
        .from("project_mail")
        .select("*")
        .order("created_at", { ascending: false })

      setProjecten(p || [])
      setMails(m || [])
      setLoading(false)
    }

    load()
  }, [])

  async function verstuur() {
    if (!nieuwBericht.project_id || !nieuwBericht.onderwerp || !nieuwBericht.bericht) return

    await supabase.from("project_mail").insert(nieuwBericht)
    setNieuwBericht({ project_id: "", onderwerp: "", bericht: "" })
    location.reload()
  }

  if (loading) return null

  return (
    <div style={{ padding: 16 }}>
      <h1>Project Mailbox</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuw bericht</h2>
        <select
          value={nieuwBericht.project_id}
          onChange={e => setNieuwBericht({ ...nieuwBericht, project_id: e.target.value })}
          style={{ marginRight: 8 }}
        >
          <option value="">Kies project</option>
          {projecten.map(p => (
            <option key={p.id} value={p.id}>{p.naam}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Onderwerp"
          value={nieuwBericht.onderwerp}
          onChange={e => setNieuwBericht({ ...nieuwBericht, onderwerp: e.target.value })}
          style={{ marginRight: 8 }}
        />

        <input
          type="text"
          placeholder="Bericht"
          value={nieuwBericht.bericht}
          onChange={e => setNieuwBericht({ ...nieuwBericht, bericht: e.target.value })}
          style={{ marginRight: 8, width: "40%" }}
        />

        <button onClick={verstuur}>Verstuur</button>
      </section>

      <section>
        <h2>Inbox</h2>
        {mails.length === 0 && <p>Geen berichten aanwezig.</p>}

        {mails.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Project</th>
                <th>Onderwerp</th>
                <th>Bericht</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {mails.map(m => (
                <tr key={m.id}>
                  <td>{projecten.find(p => p.id === m.project_id)?.naam || "-"}</td>
                  <td>{m.onderwerp}</td>
                  <td>{m.bericht}</td>
                  <td>{m.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
