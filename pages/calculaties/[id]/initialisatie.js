import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function InitialisatieStatus() {
  const router = useRouter()
  const { id } = router.query

  const [projectId, setProjectId] = useState(null)
  const [logs, setLogs] = useState([])

  const startedRef = useRef(false)
  const redirectedRef = useRef(false)

  // project_id ophalen via calculatie
  useEffect(() => {
    if (!id) return

    supabase
      .from("calculaties")
      .select("project_id")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data?.project_id) return
        setProjectId(data.project_id)
      })
  }, [id])

  // initialisatie 1× starten
  useEffect(() => {
    if (!projectId) return
    if (startedRef.current) return

    startedRef.current = true

    supabase.from("executor_tasks").insert({
      project_id: projectId,
      action: "PROJECT_SCAN",
      status: "open",
      assigned_to: "executor",
      payload: {}
    })
  }, [projectId])

  // logs pollen + DIRECT doorsturen zodra er iets klaar is
  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      const { data } = await supabase
        .from("project_initialization_log")
        .select("module, status")
        .eq("project_id", projectId)

      const rows = data || []
      setLogs(rows)

      const hasAnyDone = rows.some(r => r.status === "done")

      if (hasAnyDone && !redirectedRef.current) {
        redirectedRef.current = true
        router.replace(`/calculaties/${id}`)
      }
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [projectId, id, router])

  return (
    <div style={{ maxWidth: 900, margin: "60px auto" }}>
      <h1>Project initialisatie</h1>
      <p>Project wordt geanalyseerd.</p>

      <div
        style={{
          background: "#0f172a",
          color: "#e5e7eb",
          padding: 16,
          borderRadius: 6,
          fontFamily: "monospace",
          fontSize: 13,
          maxHeight: 300,
          overflowY: "auto"
        }}
      >
        {logs.length === 0 && <div>Wachten op eerste logregel…</div>}

        {logs.map((log, i) => (
          <div key={i}>
            {log.module} → <strong>{log.status}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
