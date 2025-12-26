import { useState, useEffect } from "react"
import { useRouter } from "next/router"

export default function IndexPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [calculaties, setCalculaties] = useState([])

  // =========================
  // ALLEEN NAVIGATIE
  // =========================
  function handleNieuweCalculatie() {
    router.push("/calculaties/nieuw")
  }

  // =========================
  // VEILIG: RECENTE CALCULATIES
  // =========================
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/calculaties/recent", {
          method: "GET"
        })

        if (!res.ok) {
          // index mag NOOIT stuk gaan
          setCalculaties([])
          return
        }

        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setCalculaties(data)
        }
      } catch (_) {
        // index moet altijd renderen
        if (!cancelled) setCalculaties([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
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

        {loading && <div style={{ marginTop: 8 }}>Laden…</div>}

        {!loading && calculaties.length === 0 && (
          <div style={{ marginTop: 8 }}>
            Nog geen calculaties
          </div>
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
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          background: "#2563eb",
          color: "#ffffff",
          fontWeight: 600
        }}
      >
        Start calculatie
      </button>

      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
    </div>
  )
}
