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

      // 1. CALCULATIE IS LEIDEND
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

      // 2. REGELS (optioneel)
      const { data: r } = await supabase
        .from("calculatie_regels")
        .select("*")
        .eq("calculatie_id", id)

      if (!cancelled) setRegels(r || [])

      // 3. OPSLAGEN (optioneel)
      const { data: o } = await supabase
        .from("calculatie_opslagen")
        .select("*")
        .eq("calculatie_id", id)
        .single()

      if (!cancelled) setOpslagen(o || null)

      // 4. WORKFLOW LOG (optioneel)
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
    </>
  )
}
