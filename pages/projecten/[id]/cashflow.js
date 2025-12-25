import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function ProjectCashflow() {
  const router = useRouter()
  const { id } = router.query

  const [calculaties, setCalculaties] = useState([])
  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data: c, error: cErr } = await supabase
        .from("calculaties")
        .select("id, naam, kostprijs, verkoopprijs")
        .eq("project_id", id)

      if (cErr) {
        if (!cancelled) {
          setError(cErr.message)
          setLoading(false)
        }
        return
      }

      const { data: p, error: pErr } = await supabase
        .from("project_planning_activiteiten")
        .select("start_datum, eind_datum, duur_dagen")
        .eq("project_id", id)

      if (pErr) {
        if (!cancelled) {
          setError(pErr.message)
          setLoading(false)
        }
        return
      }

      if (cancelled) return

      setCalculaties(c || [])
      setPlanning(p || [])
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div>Loading…</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>

  const totaleKostprijs = calculaties.reduce(
    (sum, c) => sum + Number(c.kostprijs || 0),
    0
  )

  const totaleVerkoopprijs = calculaties.reduce(
    (sum, c) => sum + Number(c.verkoopprijs || 0),
    0
  )

  const totaleDuur = planning.reduce(
    (sum, p) => sum + Number(p.duur_dagen || 0),
    0
  )

  const maandKostprijs =
    totaleDuur > 0 ? totaleKostprijs / (totaleDuur / 20) : 0

  const maandVerkoopprijs =
    totaleDuur > 0 ? totaleVerkoopprijs / (totaleDuur / 20) : 0

  return (
    <>
      <h1>Project cashflow</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Samenvatting</h2>
        <p>Totale kostprijs: € {totaleKostprijs.toFixed(2)}</p>
        <p>Totale verkoopprijs: € {totaleVerkoopprijs.toFixed(2)}</p>
        <p>Totale doorlooptijd (dagen): {totaleDuur}</p>
      </section>

      <section>
        <h2>Indicatieve maandcashflow</h2>
        <p>Uitgaven per maand: € {maandKostprijs.toFixed(2)}</p>
        <p>Inkomsten per maand: € {maandVerkoopprijs.toFixed(2)}</p>
      </section>
    </>
  )
}
