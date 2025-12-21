import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STATUS_ORDER = [
  "PROJECT_SCAN",
  "REKENWOLK",
  "STABU",
  "HOEVEELHEDEN",
  "INSTALLATIES_E",
  "INSTALLATIES_W",
  "PLANNING",
  "RAPPORTAGE"
]

export default function InitialisatieStatus() {
  const router = useRouter()
  const { id: projectId } = router.query

  const [logs, setLogs] = useState([])
  const startedRef = useRef(false)

  // 1. Start initialisatie exact één keer
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

  // 2. Poll logs + redirect
  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      const { data } = await supabase
        .from("project_initialization_log")
        .select("module, status")
        .eq("project_id", projectId)

      const rows = data || []
      setLogs(rows)

      const doneSet = new Set(
        rows.filter(r => r.status === "done").map(r => r.module)
      )

      if (STATUS_ORDER.every(m => doneSet.has(m))) {
        router.replace(`/calculaties/${projectId}`)
      }
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [projectId, router])

  const doneCount = new Set(
    logs.filter(l => l.status === "done").map(l => l.module)
  ).size

  const progressPct = Math.round(
    (doneCount / STATUS_ORDER.length) * 100
  )

  return (
    <div style={{ maxWidth: 900, margin: "60px auto" }}>
      <h1>Project initialisatie</h1>
      <p>Project wordt geanalyseerd.</p>

      <div style={{ margin: "24px 0" }}>
        <div style={{ height: 12, background: "#e5e7eb", borderRadius: 6 }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "#2563eb"
            }}
          />
        </div>
        <div style={{ marginTop: 8 }}>Voortgang: {progressPct}%</div>
      </div>

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
        {logs.length === 0 && <div>Wachten op logs…</div>}
        {logs.map((log, i) => (
          <div key={i}>
            {log.module} → <strong>{log.status}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
