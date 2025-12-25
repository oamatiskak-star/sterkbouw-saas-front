import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function Contracten() {
  const [contracten, setContracten] = useState([])
  const [offertes, setOffertes] = useState([])
  const [offerteId, setOfferteId] = useState("")
  const [contractNummer, setContractNummer] = useState("")
  const [ingangsdatum, setIngangsdatum] = useState("")
  const [einddatum, setEinddatum] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: c, error: cErr } = await supabase
        .from("inkoop_contracten")
        .select(`
          id,
          contract_nummer,
          ingangsdatum,
          einddatum,
          status,
          inkoop_offertes (
            discipline,
            bedrag,
            leveranciers ( naam )
          )
        `)
        .order("created_at", { ascending: false })

      const { data: o, error: oErr } = await supabase
        .from("inkoop_offertes")
        .select(`
          id,
          discipline,
          bedrag,
          leveranciers ( naam )
        `)
        .eq("status", "geaccepteerd")
        .order("created_at", { ascending: false })

      if (!cancelled) {
        if (cErr) {
          console.error("CONTRACTEN_LOAD_FAILED", cErr)
          setContracten([])
        } else {
          setContracten(c || [])
        }

        if (oErr) {
          console.error("OFFERTES_LOAD_FAILED", oErr)
          setOffertes([])
        } else {
          setOffertes(o || [])
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
    if (!offerteId || !contractNummer || !ingangsdatum) return

    await supabase.from("inkoop_contracten").insert({
      offerte_id: offerteId,
      contract_nummer: contractNummer,
      ingangsdatum,
      einddatum: einddatum || null,
      status: "actief"
    })

    setOfferteId("")
    setContractNummer("")
    setIngangsdatum("")
    setEinddatum("")
    location.reload()
  }

  if (loading) return null

  return (
    <>
      <h1>Contracten</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuw contract</h2>

        <select
          value={offerteId}
          onChange={e => setOfferteId(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="">Kies geaccepteerde offerte</option>
          {offertes.map(o => (
            <option key={o.id} value={o.id}>
              {o.discipline} – {o.leveranciers?.naam} – €{" "}
              {Number(o.bedrag).toFixed(2)}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Contractnummer"
          value={contractNummer}
          onChange={e => setContractNummer(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="date"
          value={ingangsdatum}
          onChange={e => setIngangsdatum(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="date"
          value={einddatum}
          onChange={e => setEinddatum(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <button onClick={toevoegen}>
          Contract aanmaken
        </button>
      </section>

      <section>
        <h2>Overzicht</h2>

        {contracten.length === 0 && (
          <p>Geen contracten aanwezig.</p>
        )}

        {contracten.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Discipline</th>
                <th>Leverancier</th>
                <th>Bedrag</th>
                <th>Ingang</th>
                <th>Einde</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracten.map(c => (
                <tr key={c.id}>
                  <td>{c.contract_nummer}</td>
                  <td>{c.inkoop_offertes?.discipline || "-"}</td>
                  <td>{c.inkoop_offertes?.leveranciers?.naam || "-"}</td>
                  <td>
                    € {Number(c.inkoop_offertes?.bedrag || 0).toFixed(2)}
                  </td>
                  <td>{c.ingangsdatum}</td>
                  <td>{c.einddatum || "-"}</td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
