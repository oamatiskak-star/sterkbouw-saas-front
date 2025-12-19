import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectFinanciering() {
  const router = useRouter()
  const { id } = router.query

  const [calculaties, setCalculaties] = useState([])
  const [risico, setRisico] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)

      const { data: c } = await supabase
        .from("calculaties")
        .select("kostprijs, verkoopprijs, marge")
        .eq("project_id", id)

      const { data: r } = await supabase
        .from("v_project_risico")
        .select("*")
        .eq("project_id", id)
        .single()

      setCalculaties(c || [])
      setRisico(r)
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

  const totaleMarge = calculaties.reduce(
    (sum, c) => sum + Number(c.marge || 0),
    0
  )

  const eigenInbreng = totaleKostprijs * 0.25
  const financieringsbehoefte = totaleKostprijs - eigenInbreng
  const ltv =
    totaleVerkoopprijs > 0
      ? (financieringsbehoefte / totaleVerkoopprijs) * 100
      : 0

  return (
    <>
      <h1>Projectfinanciering</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Projectcijfers</h2>
        <p>Totale kostprijs: € {totaleKostprijs.toFixed(2)}</p>
        <p>Totale verkoopprijs: € {totaleVerkoopprijs.toFixed(2)}</p>
        <p>Totale marge: € {totaleMarge.toFixed(2)}</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Financieringsstructuur</h2>
        <p>Eigen inbreng (25%): € {eigenInbreng.toFixed(2)}</p>
        <p>Financieringsbehoefte: € {financieringsbehoefte.toFixed(2)}</p>
        <p>LTV: {ltv.toFixed(1)}%</p>
      </section>

      {risico && (
        <section>
          <h2>Risico-inschatting</h2>
          <p>Risicoscore: {Number(risico.risico_score || 0).toFixed(2)}</p>
          <p>
            Verwachte faalkosten: €{" "}
            {Number(risico.faalkosten_inschatting || 0).toFixed(2)}
          </p>
        </section>
      )}
    </>
  )
}
