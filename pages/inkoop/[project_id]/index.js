import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function InkoopProjectDetail() {
  const router = useRouter()
  const { project_id } = router.query

  const [project, setProject] = useState(null)
  const [regels, setRegels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data: p } = await supabase
        .from("projecten")
        .select("id, naam")
        .eq("id", project_id)
        .single()

      const { data: r } = await supabase
        .from("v_inkoop_project_regels")
        .select("*")
        .eq("project_id", project_id)
        .order("discipline", { ascending: true })

      setProject(p)
      setRegels(r || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  if (loading) return null
  if (!project) return <p>Project niet gevonden.</p>

  return (
    <>
      <h1>Inkoop – {project.naam}</h1>

      {regels.length === 0 && (
        <p>Geen inkoopregels beschikbaar voor dit project.</p>
      )}

      {regels.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Discipline</th>
              <th>Omschrijving</th>
              <th>Begroot</th>
              <th>Ingekocht</th>
              <th>Openstaand</th>
              <th>Leverancier</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {regels.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    Number(r.openstaand_bedrag) > 0
                      ? "#fff3cd"
                      : "transparent"
                }}
              >
                <td>{r.discipline}</td>
                <td>{r.omschrijving}</td>
                <td>€ {Number(r.begroot).toFixed(2)}</td>
                <td>€ {Number(r.ingekocht).toFixed(2)}</td>
                <td>€ {Number(r.openstaand_bedrag).toFixed(2)}</td>
                <td>{r.leverancier || "-"}</td>
                <td>
                  {Number(r.openstaand_bedrag) > 0
                    ? "Open"
                    : "Afgerond"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
