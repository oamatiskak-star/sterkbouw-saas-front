import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

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
            filename: file
