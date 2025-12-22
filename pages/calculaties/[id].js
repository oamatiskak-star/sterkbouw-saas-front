import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CalculatieDetail() {
  const router = useRouter()
  const { id } = router.query

  const [calculatie, setCalculatie] = useState(null)
  const [regels, setRegels] = useState([])
  const [opslagen, setOpslagen] = useState(null)
  const [workflowLog, setWorkflowLog] = useState([])
  const [loading, setLoading] = useState(true)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: c, error } = await supabase
        .from("calculaties")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !c) {
        console.error("CALCULATIE_LOAD_FAILED", error)
        setLoading(false)
        return
      }

      if (cancelled) return
      setCalculatie(c)

      const { data: r } = await supabase
        .from("calculatie_regels")
        .select("*")
        .eq("calculatie_id", id)

      if (!cancelled) setRegels(r || [])

      const { data: o } = await supabase
        .from("calculatie_opslagen")
        .select("*")
        .eq("calculatie_id", id)
        .single()

      if (!cancelled) setOpslagen(o || null)

      const { data: w } = await supabase
        .from("calculatie_workflow_log")
        .select("*")
        .eq("calculatie_id", id)

      if (!cancelled) setWorkflowLog(w || [])

      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  // FRONTEND: GEEN UPLOAD, ALLEEN TASK
  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file || !calculatie) return

    setUploading(true)
    setUploadError(null)

    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          action: "upload_files",
          status: "open",
          assigned_to: "executor",
          payload: {
            bucket: "sterkcalc",
            project_id: calculatie.project_id,
            calculatie_id: id,
            filename: file.name,
            mime_type: file.type
          }
        })

      if (error) throw error
    } catch (err) {
      console.error("UPLOAD_TASK_FAILED", err)
      setUploadError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!calculatie) {
    return <div>Calculatie niet gevonden</div>
  }

  return (
    <>
      <h1>{calculatie.naam_opdrachtgever || "Calculatie"}</h1>

      <p>Status: <strong>{calculatie.workflow_status}</strong></p>
      <p>Kostprijs: € {Number(calculatie.kostprijs || 0).toFixed(2)}</p>
      <p>Verkoopprijs: € {Number(calculatie.verkoopprijs || 0).toFixed(2)}</p>
      <p>Marge: € {Number(calculatie.marge || 0).toFixed(2)}</p>

      <hr />

      <h3>Bestanden uploaden voor analyse</h3>

      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {uploading && <p>Bestand doorgestuurd naar executor...</p>}
      {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
    </>
  )
}
