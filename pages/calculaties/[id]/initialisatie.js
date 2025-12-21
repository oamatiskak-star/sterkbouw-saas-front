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
  const [creating, setCreating] = useState(false)

  async function startInitialisatie() {
    if (!id || creating) return
    setCreating(true)

    try {
      await supabase.from("executor_tasks").insert({
        project_id: id,
        action: "PROJECT_SCAN",
        status: "open",
        assigned_to: "executor",
        payload: {}
      })
    } catch (err) {
      console.error("INIT_START_FAILED", err.message)
      setCreating(false)
    }
  }

  useEffect(() => {
    startInitialisatie()
  }, [id])

  useEffect(() => {
    if (!id) return

    const load = async () => {
      const { data } = await supabase
        .from("project_initialization_log")
        .select("module, status, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: true })

      const rows = data || []
      setLogs(rows)

      const doneSet = new Set(
        rows.filter(r => r.status === "done").map(r => r.module)
      )

      // 🔴 HIER ZIT DE ESSENTIËLE FIX
      if (doneSet.size === STATUS_ORDER.length) {
        setCompleted(true)

        // automatisch door naar uitkomsten
        router.replace(`/calculaties/${id}`)
      }
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [id])

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

      {/* fallback knop, wordt normaal niet meer bereikt */}
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
