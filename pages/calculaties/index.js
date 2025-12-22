import { useState } from "react"
import { useRouter } from "next/router"

export default function IndexPage() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Haal project_id op van de backend via de executor
  async function handleNieuweCalculatie() {
    if (creating) return
    setCreating(true)
    setError(null)

    try {
      // Verstuur POST-aanroep naar de executor backend om een nieuw project aan te maken
      const response = await fetch("/api/executor/create-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          naam: "Nieuw project", // Naam van het project kan worden aangepast
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Project aanmaken mislukt")
        setCreating(false)
        return
      }

      // Redirect naar de nieuw gemaakte projectpagina met het project_id
      router.push(`/calculaties/nieuw?project_id=${data.project_id}`)
    } catch (e) {
      setError(e.message)
      setCreating(false)
    }
  }

  return (
    <>
      <h1>Welkom bij de Project Calculator</h1>

      <button
        onClick={handleNieuweCalculatie}
        disabled={creating}
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer"
        }}
      >
        Maak een nieuw project aan
      </button>

      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
    </>
  )
}
