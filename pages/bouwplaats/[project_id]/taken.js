import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function BouwplaatsTaken() {
  const router = useRouter()
  const { project_id } = router.query

  const [taken, setTaken] = useState([])
  const [nieuweTaak, setNieuweTaak] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("bouwplaats_taken")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", { ascending: true })

      setTaken(data || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  async function toevoegen() {
    if (!nieuweTaak.trim()) return

    await supabase.from("bouwplaats_taken").insert({
      project_id,
      omschrijving: nieuweTaak,
      status: "open"
    })

    setNieuweTaak("")
    router.reload()
  }

  async function toggleStatus(t) {
    const nieuweStatus = t.status === "open" ? "gereed" : "open"

    await supabase
      .from("bouwplaats_taken")
      .update({ status: nieuweStatus })
      .eq("id", t.id)

    router.reload()
  }

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Bouwplaats Taken</h1>

      <section style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nieuwe taak"
          value={nieuweTaak}
          onChange={e => setNieuweTaak(e.target.value)}
          style={{ width: "70%", marginRight: 8 }}
        />
        <button onClick={toevoegen}>Toevoegen</button>
      </section>

      <section>
        {taken.length === 0 && <p>Geen taken.</p>}

        {taken.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {taken.map(t => (
              <li
                key={t.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: t.status === "gereed" ? "#d4edda" : "#f8d7da"
                }}
              >
                <span>{t.omschrijving}</span>
                <button onClick={() => toggleStatus(t)}>
                  {t.status === "open" ? "Markeer gereed" : "Heropenen"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
