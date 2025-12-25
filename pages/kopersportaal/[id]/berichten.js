import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function KoperBerichten() {
  const router = useRouter()
  const { id } = router.query

  const [koper, setKoper] = useState(null)
  const [berichten, setBerichten] = useState([])
  const [nieuwBericht, setNieuwBericht] = useState("")
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
        .select("id, naam")
        .eq("id", id)
        .single()

      if (koperErr || !k) {
        if (!cancelled) {
          setKoper(null)
          setBerichten([])
          setLoading(false)
        }
        return
      }

      const { data: b } = await supabase
        .from("koper_berichten")
        .select("*")
        .eq("koper_id", id)
        .order("created_at", { ascending: true })

      if (!cancelled) {
        setKoper(k)
        setBerichten(b || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  async function verstuurBericht() {
    if (!nieuwBericht.trim() || !id) return

    await supabase
      .from("koper_berichten")
      .insert({
        koper_id: id,
        bericht: nieuwBericht,
        afzender: "intern"
      })

    setNieuwBericht("")
    router.reload()
  }

  if (loading) return null
  if (!koper) return <p>Koper niet gevonden.</p>

  return (
    <>
      <h1>Berichten – {koper.naam}</h1>

      <section style={{ marginBottom: 32 }}>
        {berichten.length === 0 && (
          <p>Geen berichten.</p>
        )}

        {berichten.length > 0 && (
          <ul>
            {berichten.map(b => (
              <li key={b.id} style={{ marginBottom: 12 }}>
                <strong>{b.afzender}</strong><br />
                {b.bericht}<br />
                <small>{new Date(b.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Nieuw bericht</h2>

        <textarea
          value={nieuwBericht}
          onChange={e => setNieuwBericht(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <button onClick={verstuurBericht}>
          Verstuur
        </button>
      </section>
    </>
  )
}
