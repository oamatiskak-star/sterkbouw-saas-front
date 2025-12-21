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
  const { id } = router.query

  const [projectId, setProjectId] = useState(null)
  const [logs, setLogs] = useState([])
  const [started, setStarted] = useState(false)

  const startedRef = useRef(false)

  /*
  ====================================
  PROJECT_ID OPHALEN VIA CALCULATIE
  ====================================
  */
  useEffect(() => {
    if (!id) return

    const loadProjectId = async () => {
      const { data, error } = await supabase
        .from("calculaties")
        .select("project_id")
        .eq("id", id)
        .single()

      if (error || !data?.project_id) {
        console.error("PROJECT_ID_NOT_FOUND", error)
        return
      }

      setProjectId(data.project_id)
    }

    loadProjectId()
  }, [id])

  /*
  ====================================
  INITIALISATIE STARTEN (1×)
  ====================================
  */
  useEffect(() => {
    if (!projectId) return
    if (startedRef.current) return

    startedRef.current = true
    setStarted(true)

    supabase.from("executor_tasks").insert({
      project_id: projectId,
      action: "PROJECT_SCAN",
      status: "open",
      assigned_to: "executor",
      payload: {}
    }).then(({ error }) => {
      if (error) {
        console.error("INIT_START_FAILED", error)
      }
    })
  }, [projectId])

  /*
  ====================================
  LOGS POLLEN + REDIRECT
  ====================================
  */
  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      const { data, error } = await supabase
        .from("project_initialization_log")
        .select("module, status")
        .eq("project_id", projectId)

      if (error) {
        console.error("LOG_LOAD_FAILED", error)
        return
      }

      const rows = data || []
      setLogs(rows)

      const doneSet = new Set(
        rows.filter(r => r.status === "done").map(r => r.module)
      )

      const allDone = STATUS_ORDER.every(m => doneSet.has(m))

      if (allDone) {
        router.replace(`/calculaties/${id}`)
      }
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [projectId, id, router])

  const doneCount = new Set(
    logs.filter(l => l.status === "done").map(l => l.module)
  ).size

  const progressPct = Math.round(
    (doneCount / STATUS_ORDER.length) * 100
  )

  return (
    <div style={{ maxWidth: 900, margin: "60px auto" }}>
      <h1>Project initialisatie</h1>
      <p>Project wordt geanalyseerd. Dit kan enkele minuten duren.</p>

      <div style={{ margin: "24px 0" }}>
        <div style={{ height: 12, background: "#e5e7eb", borderRadius: 6 }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "#2563eb",
              transition: "width 0.3s"
            }}
          />
        </div>
        <div style={{ marginTop: 8, fontSize: 13 }}>
          Voortgang: {progressPct}%
        </div>
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
