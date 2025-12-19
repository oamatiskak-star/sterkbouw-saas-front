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

  const [calc, setCalc] = useState(null)
  const [regels, setRegels] = useState([])
  const [opslagen, setOpslagen] = useState(null)
  const [workflowLog, setWorkflowLog] = useState([])

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data: c } = await supabase
        .from("calculaties")
        .select("*")
        .eq("id", id)
        .single()

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
        .order("changed_at", { ascending: false })

      setCalc(c)
      setRegels(r || [])
      setOpslagen(o)
      setWorkflowLog(w || [])
    }

    load()
  }, [id])

  if (!calc) return null

  return (
    <>
      <h1>{calc.naam}</h1>

      {/* SAMENVATTING */}
      <div style={{ marginBottom: 24 }}>
        <strong>Status:</strong> {calc.workflow_status}<br />
        <strong>Kostprijs:</strong> € {Number(calc.kostprijs).toFixed(2)}<br />
        <strong>Verkoopprijs:</strong> € {Number(calc.verkoopprijs).toFixed(2)}<br />
        <strong>Marge:</strong> € {Number(calc.marge).toFixed(2)}
      </div>

      {/* REGELS */}
      <h2>Regels</h2>
      <table width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Hoeveelheid</th>
            <th>Eenheid</th>
            <th>Materiaal</th>
            <th>Arbeid</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          {regels.map(r => (
            <tr key={r.id}>
              <td>{r.hoeveelheid}</td>
              <td>{r.eenheid}</td>
              <td>€ {Number(r.materiaalprijs).toFixed(2)}</td>
              <td>€ {Number(r.arbeidsprijs).toFixed(2)}</td>
              <td>€ {Number(r.totaal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXED PRICE */}
      {opslagen && (
        <>
          <h2>Fixed Price</h2>
          <div>
            AK: {opslagen.ak_pct}%<br />
            ABK: {opslagen.abk_pct}%<br />
            W&R: {opslagen.wr_pct}%
          </div>
        </>
      )}

      {/* WORKFLOW */}
      <h2>Workflow</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={async () => {
            await supabase.rpc("wijzig_calculatie_status", {
              p_calculatie_id: id,
              p_nieuwe_status: "in_behandeling"
            })
            router.reload()
          }}
        >
          Naar in behandeling
        </button>

        <button
          onClick={async () => {
            await supabase.rpc("wijzig_calculatie_status", {
              p_calculatie_id: id,
              p_nieuwe_status: "akkoord"
            })
            router.reload()
          }}
          style={{ marginLeft: 8 }}
        >
          Akkoord
        </button>
      </div>

      <ul>
        {workflowLog.map(w => (
          <li key={w.id}>
            {w.oude_status} → {w.nieuwe_status}
          </li>
        ))}
      </ul>
    </>
  )
}
