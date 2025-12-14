import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Workspace() {
  const router = useRouter()
  const { action } = router.query
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)

  const startAction = async () => {
    const res = await fetch(`/api/actions/${action}`, { method: "POST" })
    const data = await res.json()
    setStatus(data)
  }

  useEffect(() => {
    if (!action) return
    const poll = setInterval(async () => {
      const res = await fetch(`/api/actions/${action}?status=1`)
      const data = await res.json()
      setStatus(data)
      if (data?.state === "KLAAR") {
        setResult(data.result)
        clearInterval(poll)
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [action])

  return (
    <div className="dashboard-grid">

      <div className="card">
        <h3>Actie</h3>
        <p>{action}</p>
      </div>

      <div className="card">
        <h3>Bestanden uploaden</h3>
        <input type="file" multiple />
      </div>

      <div className="card">
        <h3>Actie uitvoeren</h3>
        <button onClick={startAction}>Start</button>
      </div>

      <div className="card">
        <h3>Status</h3>
        <pre>{JSON.stringify(status, null, 2)}</pre>
      </div>

      <div className="card">
        <h3>Resultaat</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>

    </div>
  )
}
