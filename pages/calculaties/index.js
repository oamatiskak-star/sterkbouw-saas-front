import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import supabase from "@/lib/supabase"

export default function IndexPage() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [calculaties, setCalculaties] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Alleen navigatie
  async function handleNieuweCalculatie() {
    if (creating) return
    setCreating(true)
    setError(null)

    try {
      router.push("/calculaties/nieuw")
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  // Read-only ophalen recente calculaties
  useEffect(() => {
    let cancelled = false

    async function loadCalculaties() {
      setLoading(true)

      const { data, error } = await supabase
        .from("calculaties")
        .select("id, omschrijving, workflow_status, created_at")
        .order("created_at", { ascending: false })
        .limit(10)

      if (!cancelled) {
        if (error) {
          setError(error.message)
        } else {
          setCalculaties(data || [])
        }
        setLoading(false)
      }
    }

    loadCalculaties()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <h1>Calculaties</h1>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 16,
          marginBottom: 20
        }}
      >
        <strong>Recente calculaties</strong>

        {loading && <div style={{ marginTop: 8 }}>Laden...</div>}

        {!loading && calculaties.length === 0 && (
          <div style={{ marginTop: 8 }}>Nog geen calculaties</div>
        )}

        {!loading && calculaties.length > 0 && (
          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
            {calculaties.map(c => (
              <li key={c.id}>
                {c.omschrijving || "Zonder omschrijving"} – {c.workflow_status}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleNieuweCalculatie}
        disabled={creating}
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          cursor: creating ? "not-allowed" : "pointer",
          background: "#2563eb",
          color: "#ffffff",
          fontWeight: 600
        }}
      >
        {creating ? "Bezig..." : "Start calculatie"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
    </>
  )
}
