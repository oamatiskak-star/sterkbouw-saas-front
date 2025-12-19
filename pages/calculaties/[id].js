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

    async function load() {
      setLoading(true)

      const { data: c } = await supabase
        .from("calculaties")
        .select("*")
        .eq("id", id)
        .single()

      const { data: r } = await supabase
        .from("calculatie_regels")
        .select("*")
        .eq("calculatie_id", id)
        .order("created_at", { ascending: true })

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

      setCalculatie(c)
      setRegels(r || [])
      setOpslagen(o)
      setWorkflowLog(w || [])
      setLoading(false)
    }

    load()
  }, [id])

  if (loading || !calculatie) return null

  async function updateRegel(regelId, field, value) {
    await supabase
      .from("calculatie_regels")
      .update({ [field]: value })
      .eq("id", regelId)

    router.reload()
  }

  async function wijzigStatus(nieuweStatus) {
    await supabase.rpc("wijzig_calculatie_status", {
      p_calculatie_id: id,
      p_nieuwe_status: nieuweStatus
    })
    router.reload()
  }

  async function exporteer(type) {
    await supabase.from("calculatie_exports").insert({
      calculatie_id: id,
      export_type: type
    })
    alert(type.toUpperCase() + " export aangemaakt")
  }

  return (
    <>
      <h1>{calculatie.naam}</h1>

      {/* SAMENVATTING */}
      <section style={{ marginBottom: 32 }}>
        <p>Status: <strong>{calculatie.workflow_status}</strong></p>
        <p>Kostprijs: € {Number(calculatie.kostprijs).toFixed(2)}</p>
        <p>Verkoopprijs: € {Number(calculatie.verkoopprijs).toFixed(2)}</p>
        <p>Marge: € {Number(calculatie.marge).toFixed(2)}</p>
      </section>

      {/* REGELS INLINE */}
      <section style={{ marginBottom: 32 }}>
        <h2>Regels</h2>

        {regels.length === 0 && <p>Geen regels aanwezig.</p>}

        {regels.length > 0 && (
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
                  <td>
                    <input
                      type="number"
                      value={r.hoeveelheid}
                      onChange={e =>
                        updateRegel(r.id, "hoeveelheid", Number(e.target.value))
                      }
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>{r.eenheid}</td>
                  <td>
                    <input
                      type="number"
                      value={r.materiaalprijs}
                      onChange={e =>
                        updateRegel(
                          r.id,
                          "materiaalprijs",
                          Number(e.target.value)
                        )
                      }
                      style={{ width: 100 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={r.arbeidsprijs}
                      onChange={e =>
                        updateRegel(
                          r.id,
                          "arbeidsprijs",
                          Number(e.target.value)
                        )
                      }
                      style={{ width: 100 }}
                    />
                  </td>
                  <td>€ {Number(r.totaal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* FIXED PRICE */}
      {opslagen && (
        <section style={{ marginBottom: 32 }}>
          <h2>Fixed Price</h2>
          <p>AK: {opslagen.ak_pct}%</p>
          <p>ABK: {opslagen.abk_pct}%</p>
          <p>W&R: {opslagen.wr_pct}%</p>
        </section>
      )}

      {/* WORKFLOW */}
      <section style={{ marginBottom: 32 }}>
        <h2>Workflow</h2>

        <button onClick={() => wijzigStatus("in_behandeling")}>
          Naar in behandeling
        </button>

        <button
