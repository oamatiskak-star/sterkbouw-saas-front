import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function InitialisatieStatus() {
  const router = useRouter()
  const { id } = router.query

  const [project, setProject] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

      const { data: logs } = await supabase
        .from("project_initialization_log")
        .select("*")
        .eq("project_id", id)
        .order("started_at", { ascending: true })

      setProject(project)
      setLogs(logs || [])
      setLoading(false)
    }

    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) return <p>Initialisatie starten…</p>

  return (
    <>
      <h1>Project initialisatie</h1>
      <p>Status: <strong>{project.status}</strong></p>

      <div style={{ marginTop: 24 }}>
        {logs.map(log => (
          <div
            key={log.id}
            style={{
              padding: 12,
              marginBottom: 8,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background:
                log.status === "running"
                  ? "#fef3c7"
                  : log.status === "done"
                  ? "#ecfeff"
                  : "#fee2e2"
            }}
          >
            <strong>{log.module}</strong><br />
            Status: {log.status}
          </div>
        ))}
      </div>

      {project.status === "initialized" && (
        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => router.push(`/calculaties/${id}`)}
            style={{
              padding: "12px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Ga naar calculatie
          </button>
        </div>
      )}
    </>
  )
}
