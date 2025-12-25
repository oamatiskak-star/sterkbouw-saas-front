import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function ProjectDashboard() {
  const router = useRouter()
  const { id } = router.query

  const [project, setProject] = useState(null)
  const [calculaties, setCalculaties] = useState([])
  const [planning, setPlanning] = useState(null)
  const [risico, setRisico] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data: p, error: pErr } = await supabase
        .from("projecten")
        .select("*")
        .eq("id", id)
        .single()

      if (pErr) {
        if (!cancelled) {
          setError(pErr.message)
          setLoading(false)
        }
        return
      }

      const { data: c, error: cErr } = await supabase
        .from("calculaties")
        .select("id, naam, kostprijs, verkoopprijs, marge, workflow_status")
        .eq("project_id", id)

      if (cErr) {
        if (!cancelled) {
          setError(cErr.message)
          setLoading(false)
        }
        return
      }

      const { data: plan, error: planErr } = await supabase
        .from("v_project_dashboard")
        .select("*")
        .eq("project_id", id)
        .maybeSingle()

      if (planErr) {
        if (!cancelled) {
          setError(planErr.message)
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

      setProject(p)
      setCalculaties(c || [])
      setPlanning(plan || null)
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

  if (!project) return <p>Project niet gevonden.</p>

  const totaalKostprijs = calculaties.reduce(
    (sum, c) => sum + Number(c.kostprijs || 0),
    0
  )

  const totaalVerkoopprijs = calculaties.reduce(
    (sum, c) => sum + Number(c.verkoopprijs || 0),
    0
  )

  const totaalMarge = calculaties.reduce(
    (sum, c) => sum + Number(c.marge || 0),
    0
  )

  return (
    <>
      <h1>{project.naam || "Project"}</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Kerncijfers</h2>
        <p>Totale kostprijs: € {totaalKostprijs.toFixed(2)}</p>
        <p>Totale verkoopprijs: € {totaalVerkoopprijs.toFixed(2)}</p>
        <p>Totale marge: € {totaalMarge.toFixed(2)}</p>

        {planning && (
          <>
            <p>Start project: {planning.start_project}</p>
            <p>Einde project: {planning.einde_project}</p>
          </>
        )}

        {risico && (
          <>
            <p>Risicoscore: {Number(risico.risico_score || 0).toFixed(2)}</p>
            <p>
              Faalkosten: €{" "}
              {Number(risico.faalkosten_inschatting || 0).toFixed(2)}
            </p>
          </>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Project acties</h2>

        <Link href={`/projecten/${id}/planning`}>
          Planning bekijken
        </Link>

        <br />

        <Link href={`/projecten/${id}/risico`}>
          Risicoanalyse bekijken
        </Link>
      </section>

      <section>
        <h2>Calculaties</h2>

        {calculaties.length === 0 && (
          <p>Geen calculaties gekoppeld aan dit project.</p>
        )}

        {calculaties.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Status</th>
                <th>Kostprijs</th>
                <th>Verkoopprijs</th>
                <th>Marge</th>
              </tr>
            </thead>
            <tbody>
              {calculaties.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/calculaties/${c.id}`}>
                      {c.naam}
                    </Link>
                  </td>
                  <td>{c.workflow_status}</td>
                  <td>€ {Number(c.kostprijs).toFixed(2)}</td>
                  <td>€ {Number(c.verkoopprijs).toFixed(2)}</td>
                  <td>€ {Number(c.marge).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
