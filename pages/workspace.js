import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { actionSchemas } from "../lib/actionSchemas"

export default function Workspace() {
  const { query } = useRouter()
  const action = query.action
  const schema = actionSchemas[action]

  const [status, setStatus] = useState(null)
  const [files, setFiles] = useState([])

  const start = async () => {
    const res = await fetch(`/api/actions/${action}`, { method:"POST" })
    setStatus(await res.json())
  }

  if (!schema) {
    return <div className="card">Onbekende actie</div>
  }

  return (
    <div className="workspace">

      <h2>{schema.title}</h2>

      {schema.blocks.includes("project") && (
        <div className="card">
          <h3>Project</h3>
          <select><option>Selecteer project</option></select>
        </div>
      )}

      {schema.blocks.includes("upload") && (
        <div className="card">
          <h3>Bestanden</h3>
          <input type="file" multiple onChange={e => setFiles(e.target.files)} />
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
          <button onClick={start}>Start</button>
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
