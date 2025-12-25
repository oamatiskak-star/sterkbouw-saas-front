import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function KoperNotificaties() {
  const router = useRouter()
  const { id } = router.query

  const [koper, setKoper] = useState(null)
  const [notificaties, setNotificaties] = useState([])
  const [titel, setTitel] = useState("")
  const [bericht, setBericht] = useState("")
  const [loading, setLoading] = useState(true)

  const loadedRef = useRef(false)

  useEffect(() => {
    if (!id) return
    if (loadedRef.current) return
    loadedRef.current = true

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: k, error: koperErr } = await supabase
        .from("kopers")
        .select("id, naam, email")
        .eq("id", id)
        .single()

      if (koperErr || !k) {
        if (!cancelled) {
          setKoper(null)
          setNotificaties([])
          setLoading(false)
        }
        return
      }

      const { data: n } = await supabase
        .from("koper_notificaties")
        .select("*")
        .eq("koper_id", id)
        .order("created_at", { ascending: false })

      if (!cancelled) {
        setKoper(k)
        setNotificaties(n || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  async function verstuurNotificatie() {
    if (!titel.trim() || !bericht.trim() || !id) return

    await supabase
      .from("koper_notificaties")
      .insert({
        koper_id: id,
        titel,
        bericht,
        kanaal: "portaal",
        status: "verzonden"
      })

    setTitel("")
    setBericht("")
    router.reload()
  }

  if (loading) return null
  if (!koper) return <p>Koper niet gevonden.</p>

  return (
    <>
      <h1>Notificaties – {koper.naam}</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Nieuwe notificatie</h2>

        <input
          type="text"
          placeholder="Titel"
          value={titel}
          onChange={e => setTitel(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <textarea
          placeholder="Bericht"
          value={bericht}
          onChange={e => setBericht(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <button onClick={verstuurNotificatie}>
          Verstuur notificatie
        </button>
      </section>

      <section>
        <h2>Verstuurde notificaties</h2>

        {notificaties.length === 0 && (
          <p>Geen notificaties verzonden.</p>
        )}

        {notificaties.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Status</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {notificaties.map(n => (
                <tr key={n.id}>
                  <td>{n.titel}</td>
                  <td>{n.status}</td>
                  <td>{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
