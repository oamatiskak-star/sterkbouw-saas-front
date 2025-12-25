import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function Offertes() {
  const [offertes, setOffertes] = useState([])
  const [leveranciers, setLeveranciers] = useState([])
  const [discipline, setDiscipline] = useState("")
  const [leverancierId, setLeverancierId] = useState("")
  const [bedrag, setBedrag] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: o, error: oErr } = await supabase
        .from("inkoop_offertes")
        .select(`
          id,
          discipline,
          bedrag,
          status,
          leveranciers ( naam )
        `)
        .order("created_at", { ascending: false })

      const { data: l, error: lErr } = await supabase
        .from("leveranciers")
        .select("id, naam")
        .eq("actief", true)
        .order("naam")

      if (!cancelled) {
        if (oErr || lErr) {
          console.error("INKOOP_OFFERTES_LOAD_FAILED", oErr || lErr)
          setOffertes([])
          setLeveranciers([])
        } else {
          setOffertes(o || [])
          setLeveranciers(l || [])
        }
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  async function toevoegen() {
    if (!discipline || !leverancierId || !bedrag) return

    const { error } = await supabase
      .from("inkoop_offertes")
      .insert({
        discipline,
        leverancier_id: leverancierId,
        bedrag: Number(bedrag),
        status: "aangevraagd"
      })

    if (error) {
      console.error("INKOOP_OFFERT_TOEVOEGEN_FAILED", error)
      return
    }

    // formulier resetten
    setDiscipline("")
    setLeverancierId("")
    setBedrag("")

    // lijst lokaal bijwerken i.p.v. reload
    const { data } = await supabase
      .from("inkoop_offertes")
      .select(`
        id,
        discipline,
        bedrag,
        status,
        leveranciers ( naam )
      `)
      .order("created_at", { ascending: false })

    setOffertes(data || [])
  }

  if (loading) return null

  return (
    <>
      <h1>Offertes</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuwe offerte</h2>

        <input
          type="text"
          placeholder="Discipline"
          value={discipline}
          onChange={e => setDiscipline(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <select
          value={leverancierId}
          onChange={e => setLeverancierId(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="">Kies leverancier</option>
          {leveranciers.map(l => (
            <option key={l.id} value={l.id}>
              {l.naam}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Bedrag"
          value={bedrag}
          onChange={e => setBedrag(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <button onClick={toevoegen}>
          Offerte toevoegen
        </button>
      </section>

      <section>
        <h2>Overzicht</h2>

        {offertes.length === 0 && (
          <p>Geen offertes aanwezig.</p>
        )}

        {offertes.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Discipline</th>
                <th>Leverancier</th>
                <th>Bedrag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {offertes.map(o => (
                <tr key={o.id}>
                  <td>{o.discipline}</td>
                  <td>{o.leveranciers?.naam || "-"}</td>
                  <td>€ {Number(o.bedrag).toFixed(2)}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
