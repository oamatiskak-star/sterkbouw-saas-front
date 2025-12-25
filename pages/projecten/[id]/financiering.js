import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function ProjectFinanciering() {
  const router = useRouter()
  const { id } = router.query

  const [calculaties, setCalculaties] = useState([])
  const [risico, setRisico] = useState(null)
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
        .select("kostprijs, verkoopprijs, marge")
        .eq("project_id", id)

      if (cErr) {
        if (!cancelled) {
          setError(cErr.message)
          setLoading(false)
        }
        return
      }

      const { data: r, error: rErr } = await supabase
        .from("v_project_risico")
        .select("*")
        .eq("project_id", id)
        .maybeSingle()

      if (rErr) {
        if (!cancelled) {
          setError(rErr.message)
          setLoading(false)
        }
        return
      }

      if (cancelled) return

      setCalculaties(c || [])
      setRisico(r || null)
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div>Loading…</div>

  if (error) {
    return (
      <div style={{ color: "red" }}>
        {error}
      </div>
    )
  }

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
