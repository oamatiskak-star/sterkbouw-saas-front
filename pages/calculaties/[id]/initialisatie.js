import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import supabase from "@/lib/supabase"

export default function InitialisatieStatus() {
  const router = useRouter()
  const { id } = router.query

  const [projectId, setProjectId] = useState(null)
  const [logs, setLogs] = useState([])

  const startedRef = useRef(false)
  const redirectedRef = useRef(false)

  // 1. project_id ophalen via calculatie
  useEffect(() => {
    if (!id) return

    supabase
      .from("calculaties")
      .select("project_id")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("PROJECT_ID_LOAD_FAILED", error)
          return
        }

        if (data?.project_id) {
          setProjectId(data.project_id)
        }
      })
  }, [id])

  // 2. initialisatie starten (slechts 1×)
  useEffect(() => {
    if (!projectId) return
    if (startedRef.current) return

    startedRef.current = true

    ;(async () => {
      const { error } = await supabase.from("executor_tasks").insert({
        project_id: projectId,
        action: "PROJECT_SCAN",
        status: "open",
        assigned_to: "executor",
        payload: {}
      })

      if (error) {
        // RLS / anon blokkade bewust afvangen
        console.error("EXECUTOR_TASK_INSERT_BLOCKED", error)
      }
    })()
  }, [projectId])

  // 3. logs pollen → DIRECT door naar calculatie bij eerste done
  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      const { data, error } = await supabase
        .from("project_initialization_log")
        .select("module, status")
        .eq("project_id", projectId)

      if (error) {
        console.error("INIT_LOG_LOAD_FAILED", error)
        return
      }

      const rows = data || []
      setLogs(rows)

      const hasDone = rows.some(r => r.status === "done")

      if (hasDone && !redirectedRef.current) {
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
      <p>Project wordt gestart.</p>

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
        {logs.length === 0 && <div>Wachten op status…</div>}

        {logs.map((log, i) => (
          <div key={i}>
            {log.module} → <strong>{log.status}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
