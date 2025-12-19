import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectCashflow() {
  const router = useRouter()
  const { id } = router.query

  const [calculaties, setCalculaties] = useState([])
  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)

      const { data: c } = await supabase
        .from("calculaties")
        .select("id, naam, kostprijs, verkoopprijs")
        .eq("project_id", id)

      const { data: p } = await supabase
        .from("project_planning_activiteiten")
        .select("start_datum, eind_datum, duur_dagen")
        .eq("project_id", id)

      setCalculaties(c || [])
      setPlanning(p || [])
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return null

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
