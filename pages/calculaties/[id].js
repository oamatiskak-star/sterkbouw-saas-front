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

      // 🔒 KEIHARDE, CORRECTE GUARD
      if (
        c.workflow_status === "scan_pending" ||
        c.workflow_status === "initializing"
      ) {
        router.replace(`/calculaties/${id}/initialisatie`)
        return
      }

      const { data: r } = await supabase
        .from("calculatie_regels")
        .select("*")
        .eq("calculatie_id", id)

      const { data: o } = await supabase
        .from("calculatie_opslagen")
        .select("*")
        .eq("calculatie_id", id)
        .single()

      const { data: w } = await supabase
        .from("calculatie_workflow_log")
        .select("*")
        .eq("calculatie_id", id)

      if (cancelled) return

      setCalculatie(c)
      setRegels(r || [])
      setOpslagen(o)
      setWorkflowLog(w || [])
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id, router])

  if (loading || !calculatie) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h1>{calculatie.naam_opdrachtgever || "Calculatie"}</h1>

      <p>Status: <strong>{calculatie.workflow_status}</strong></p>

      <p>Kostprijs: € {Number(calculatie.kostprijs || 0).toFixed(2)}</p>
      <p>Verkoopprijs: € {Number(calculatie.verkoopprijs || 0).toFixed(2)}</p>
      <p>Marge: € {Number(calculatie.marge || 0).toFixed(2)}</p>
    </>
  )
}
