import { useEffect, useState } from "react"
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

  const [logs, setLogs] = useState([])
  const [completed, setCompleted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([]) // array met bestanden en status
  const [creating, setCreating] = useState(false)

  const allFilesUploaded = uploadedFiles.every(f => f.status === "completed")

  async function handleStartCalculatie() {
    if (creating) return
    setCreating(true)

    try {
      const { data: calculatie, error } = await supabase
        .from("calculaties")
        .insert({
          project_id: id,
          status: "initializing",
          workflow_status: "scan_pending"
        })
        .select("id")
        .single()
      if (error) throw error

      const calculatieId = calculatie.id

      await supabase.from("executor_tasks").insert({
        task_type: "PROJECT_SCAN",
        status: "open",
        payload: { project_id: id }
      })

      await supabase.from("executor_tasks").insert({
        task_type: "START_REKENWOLK",
        status: "waiting",
        depends_on: "PROJECT_SCAN",
        payload: { project_id: id }
      })

      router.push(`/calculaties/${calculatieId}/initialisatie`)
    } catch (err) {
      alert(err.message)
      setCreating(false)
    }
  }

  useEffect(() => {
    if (allFilesUploaded && !creating) {
      handleStartCalculatie()
    }
  }, [allFilesUploaded])

  useEffect(() => {
    if (!id) return

    const load = async () => {
      const { data } = await supabase
        .from("project_initialization_log")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true })

      setLogs(data || [])

      const doneModules = (data || []).filter(l => l.status === "done")
      if (doneModules.length >= STATUS_ORDER.length) {
        setCompleted(true)
      }
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [id])

  const doneCount = logs.filter(l => l.status === "done").length
  const progressPct = Math.min(
    Math.round((doneCount / STATUS_ORDER.length) * 100),
    100
  )

  return (
    <div style={{ maxWidth: 900, margin: "60px auto" }}>
      <h1>Project initialisatie</h1>
      <p>Project wordt geanalyseerd. Dit kan enkele minuten duren.</p>

      <div style={{ margin: "24px 0" }}>
        <div
          style={{
            height: 12,
            background: "#e5e7eb",
            borderRadius: 6,
            overflow: "hidden"
          }}
        >
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
          <div key={i} style={{ marginBottom: 6 }}>
            [{new Date(log.created_at).toLocaleTimeString()}]{" "}
            {log.module} → <strong>{log.status}</strong>
          </div>
        ))}
      </div>

      {completed && (
        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => router.push(`/calculaties/${id}`)}
            style={{
              padding: "12px 20px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Ga naar calculatie
          </button>
        </div>
      )}
    </div>
  )
}
