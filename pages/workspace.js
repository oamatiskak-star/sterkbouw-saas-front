import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { actionSchemas } from "../lib/actionSchemas"

export default function Workspace() {
  const router = useRouter()
  const action = typeof router.query.action === "string" ? router.query.action : null
  const schema = action ? actionSchemas[action] : null

  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [files, setFiles] = useState([])
  const [starting, setStarting] = useState(false)

  // HARD GUARD: nooit starten zonder geldige actie
  async function start() {
    setError(null)
    setStatus(null)

    if (!action || !schema) {
      setError("ONGELDIGE_ACTIE")
      return
    }

    setStarting(true)
    try {
      const res = await fetch(`/api/actions/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // altijd een payload sturen zodat de API niet 400t
          files_count: files?.length || 0,
          ts: Date.now()
        })
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `HTTP_${res.status}`)
      }

      const json = await res.json()
      setStatus(json)
    } catch (e) {
      setError(e.message || "START_FAILED")
    } finally {
      setStarting(false)
    }
  }

  if (!schema) {
    return (
      <div className="card">
        <h3>Ongeldige of ontbrekende actie</h3>
        <p>Er is geen geldige actie geselecteerd.</p>
      </div>
    )
  }

  return (
    <div className="workspace">
      <h2>{schema.title}</h2>

      {schema.blocks.includes("project") && (
        <div className="card">
          <h3>Project</h3>
          <select>
            <option>Selecteer project</option>
          </select>
        </div>
      )}

      {schema.blocks.includes("upload") && (
        <div className="card">
          <h3>Bestanden</h3>
          <input
            type="file"
            multiple
            onChange={e => setFiles(Array.from(e.target.files || []))}
          />
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Geselecteerd: {files.length}
          </div>
        </div>
      )}

      {schema.blocks.includes("parameters") && (
        <div className="card">
          <h3>Instellingen</h3>
          <input placeholder="Aantal m2" />
        </div>
      )}

      {schema.blocks.includes("start") && (
        <div className="card">
          <button onClick={start} disabled={starting}>
            {starting ? "Bezig..." : "Start"}
          </button>
        </div>
      )}

      {error && (
        <div className="card" style={{ color: "red" }}>
          <pre>{error}</pre>
        </div>
      )}

      {schema.blocks.includes("status") && (
        <div className="card">
          <h3>Status</h3>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}

      {schema.blocks.includes("result") && (
        <div className="card">
          <h3>Resultaat</h3>
          <div>Nog geen resultaat</div>
        </div>
      )}
    </div>
  )
}
