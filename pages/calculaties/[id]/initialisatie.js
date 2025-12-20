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

  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState("initializing")
  const [reports, setReports] = useState([])

  useEffect(() => {
    if (!id) return

    const load = async () => {
      const { data: logData } = await supabase
        .from("project_initialization_log")
        .select("*")
        .eq("project_id", id)
        .order("started_at", { ascending: true })

      setLogs(logData || [])

      const { data: calc } = await supabase
        .from("calculaties")
        .select("status")
        .eq("id", id)
        .single()

      if (calc?.status === "initialized") {
        setStatus("done")
      }

      const { data: rep } = await supabase
        .from("project_reports")
        .select("*")
        .eq("project_id", id)

      setReports(rep || [])
    }

    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [id])

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h1>Project initialisatie</h1>

      {status !== "done" && (
        <p>Project wordt geanalyseerd. Dit kan enkele minuten duren.</p>
      )}

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

      {status === "done" && (
        <div style={{ marginTop: 32 }}>
          <h3>Rapporten</h3>

          {reports.map(r => (
            <div key={r.id} style={{ marginBottom: 8 }}>
              <a
                href={`/api/download-report?project_id=${id}&type=${r.report_type}`}
                target="_blank"
                rel="noreferrer"
              >
                Download {r.report_type}
              </a>
            </div>
          ))}

          <button
            style={{
              marginTop: 24,
              padding: "12px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
            onClick={() => router.push(`/calculaties/${id}`)}
          >
            Ga naar calculatie
          </button>
        </div>
      )}
    </div>
  )
}
