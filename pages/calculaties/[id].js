// pages/calculaties/[id].js - VEILIGE VERSIE
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function CalculatieDetail() {
  const router = useRouter()
  const { id } = router.query

  const [calculatie, setCalculatie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Simpele styling
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      marginBottom: '30px'
    },
    card: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: 'white'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }
  }

  useEffect(() => {
    if (!id) return

    // Simuleer data laden - vervang dit met echte API call
    const timer = setTimeout(() => {
      setCalculatie({
        id: id,
        naam: `Project ${id}`,
        klant_naam: "Test Klant",
        status: "draft",
        created_at: new Date().toISOString()
      })
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [id])

  if (loading) {
    return (
      <div style={styles.container}>
        <h1>Calculatie laden...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1>Fout</h1>
        <p>{error}</p>
        <Link href="/calculaties">
          <button style={styles.button}>Terug naar overzicht</button>
        </Link>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/calculaties" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Terug naar overzicht
        </Link>
        <h1>Calculatie: {calculatie.naam}</h1>
      </div>

      <div style={styles.card}>
        <h2>Projectinformatie</h2>
        <p><strong>ID:</strong> {calculatie.id}</p>
        <p><strong>Naam:</strong> {calculatie.naam}</p>
        <p><strong>Klant:</strong> {calculatie.klant_naam}</p>
        <p><strong>Status:</strong> {calculatie.status}</p>
        <p><strong>Aangemaakt:</strong> {new Date(calculatie.created_at).toLocaleDateString('nl-NL')}</p>
      </div>

      <div style={styles.card}>
        <h2>Acties</h2>
        <button style={{...styles.button, marginRight: '10px'}}>
          Bewerken
        </button>
        <button style={{...styles.button, backgroundColor: '#ef4444'}}>
          Verwijderen
        </button>
      </div>

      <div style={styles.card}>
        <h2>Debug Informatie</h2>
        <p>Deze pagina is een veilige testversie.</p>
        <p>Als dit werkt, voeg dan langzaam componenten toe.</p>
        <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '6px' }}>
          {JSON.stringify(calculatie, null, 2)}
        </pre>
      </div>
    </div>
  )
}
