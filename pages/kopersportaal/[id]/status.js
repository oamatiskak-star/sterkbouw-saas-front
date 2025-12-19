import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STATUSSEN = [
  "concept",
  "in_voorbereiding",
  "in_aanbouw",
  "oplevering_gepland",
  "opgeleverd"
]

export default function KoperStatus() {
  const router = useRouter()
  const { id } = router.query

  const [koper, setKoper] = useState(null)
  const [statusLog, setStatusLog] = useState([])
  const [nieuweStatus, setNieuweStatus] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)

      const { data: k } = await supabase
        .from("kopers")
        .select("id, naam, status")
        .eq("id", id)
        .single()

      const { data: l } = await supabase
        .from("koper_status_log")
        .select("*")
        .eq("koper_id", id)
        .order("changed_at", { ascending: false })

      setKoper(k)
      setStatusLog(l || [])
      setNieuweStatus(k?.status || "")
      setLoading(false)
    }

    load()
  }, [id])

  async function updateStatus() {
    if (!nieuweStatus || nieuweStatus === koper.status) return

    await supabase.rpc("wijzig_koper_status", {
      p_koper_id: id,
      p_nieuwe_status: nieuweStatus
    })

    router.reload()
  }

  if (loading) return null
  if (!koper) return <p>Koper niet gevonden.</p>

  return (
    <>
      <h1>Status – {koper.naam}</h1>

      <section style={{ marginBottom: 32 }}>
        <p>Huidige status: <strong>{koper.status}</strong></p>

        <select
          value={nieuweStatus}
          onChange={e => setNieuweStatus(e.target.value)}
        >
          <option value="">Kies status</option>
          {STATUSSEN.map(s => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button
          onClick={updateStatus}
          style={{ marginLeft: 8 }}
        >
          Status bijwerken
        </button>
      </section>

      <section>
        <h2>Statushistorie</h2>

        {statusLog.length === 0 && (
          <p>Geen statuswijzigingen.</p>
        )}

        {statusLog.length > 0 && (
          <ul>
            {statusLog.map(l => (
              <li key={l.id}>
                {l.oude_status} → {l.nieuwe_status}  
                <small> {new Date(l.changed_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
