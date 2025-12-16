import { useRouter } from "next/router"
import { apiPost } from "../../lib/api"

export default function CalculatieHub() {
  const router = useRouter()

  const projectId = "ACTIEF_PROJECT" // later dynamisch

  async function trigger(action) {
    await apiPost("/tasks/trigger", {
      type: action,
      project_id: projectId
    })
  }

  return (
    <div>
      {/* CONTEXT */}
      <h1>Calculatie</h1>
      <p>Project: actief</p>

      {/* MIDDENBLOK */}
      <div className="card">
        <h2>Calculatie</h2>
        <button onClick={() => router.push("/calculatie/open")}>
          Open calculatie
        </button>
      </div>

      {/* RING 1 – CALCULATIES */}
      <h2>Berekeningen</h2>
      <div className="grid">
        <button onClick={() => trigger("calculaties:bouw")}>Bouwkundig</button>
        <button onClick={() => trigger("calculaties:ew")}>E en W</button>
        <button>Materialen</button>
        <button>Arbeid</button>
        <button>Opslagen</button>
        <button>Varianten</button>
      </div>

      {/* RING 2 – UPLOAD */}
      <h2>Upload</h2>
      <div className="grid">
        <button>Upload tekeningen</button>
        <button>Upload bestek</button>
        <button>Upload offertes</button>
        <button>Upload foto’s</button>
        <button>Upload Excel</button>
      </div>

      {/* RING 3 – OUTPUT */}
      <h2>Output</h2>
      <div className="grid">
        <button onClick={() => trigger("output:dashboard")}>Dashboard</button>
        <button onClick={() => trigger("output:frontend")}>Frontend</button>
        <button onClick={() => trigger("documenten:offertes")}>Offerte</button>
        <button>Export PDF</button>
        <button>Export Excel</button>
      </div>

      {/* VASTE ACTIES */}
      <h2>Project</h2>
      <div className="grid">
        <button>Nieuw project</button>
        <button>Project aanpassen</button>
        <button>Gebruikers</button>
        <button>Rechten</button>
        <button>Instellingen</button>
      </div>
    </div>
  )
}
