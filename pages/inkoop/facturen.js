import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function Facturen() {
  const [bestellingen, setBestellingen] = useState([])
  const [facturen, setFacturen] = useState([])
  const [bestellingId, setBestellingId] = useState("")
  const [factuurnummer, setFactuurnummer] = useState("")
  const [bedrag, setBedrag] = useState("")
  const [factuurdatum, setFactuurdatum] = useState("")
  const [status, setStatus] = useState("ontvangen")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: b, error: bErr } = await supabase
        .from("inkoop_bestellingen")
        .select(`
          id,
          omschrijving,
          inkoop_contracten (
            contract_nummer,
            inkoop_offertes (
              discipline,
              leveranciers ( naam )
            )
          )
        `)
        .order("created_at", { ascending: false })

      const { data: f, error: fErr } = await supabase
        .from("inkoop_facturen")
        .select(`
          id,
          factuurnummer,
          bedrag,
          factuurdatum,
          status,
          inkoop_bestellingen (
            omschrijving,
            inkoop_contracten (
              contract_nummer,
              inkoop_offertes (
                discipline,
                leveranciers ( naam )
              )
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (!cancelled) {
        if (bErr) {
          console.error("BESTELLINGEN_LOAD_FAILED", bErr)
          setBestellingen([])
        } else {
          setBestellingen(b || [])
        }

        if (fErr) {
          console.error("FACTUREN_LOAD_FAILED", fErr)
          setFacturen([])
        } else {
          setFacturen(f || [])
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
    if (!bestellingId || !factuurnummer || !bedrag) return

    await supabase.from("inkoop_facturen").insert({
      bestelling_id: bestellingId,
      factuurnummer,
      bedrag: Number(bedrag),
      factuurdatum: factuurdatum || null,
      status
    })

    setBestellingId("")
    setFactuurnummer("")
    setBedrag("")
    setFactuurdatum("")
    setStatus("ontvangen")
    location.reload()
  }

  if (loading) return null

  return (
    <>
      <h1>Facturen en voortgang</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuwe factuur</h2>

        <select
          value={bestellingId}
          onChange={e => setBestellingId(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="">Kies bestelling</option>
          {bestellingen.map(b => (
            <option key={b.id} value={b.id}>
              {b.omschrijving} –{" "}
              {b.inkoop_contracten?.inkoop_offertes?.discipline} –{" "}
              {b.inkoop_contracten?.inkoop_offertes?.leveranciers?.naam}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Factuurnummer"
          value={factuurnummer}
          onChange={e => setFactuurnummer(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="number"
          placeholder="Bedrag"
          value={bedrag}
          onChange={e => setBedrag(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="date"
          value={factuurdatum}
          onChange={e => setFactuurdatum(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="ontvangen">Ontvangen</option>
          <option value="goedgekeurd">Goedgekeurd</option>
          <option value="betaald">Betaald</option>
        </select>

        <button onClick={toevoegen}>
          Factuur toevoegen
        </button>
      </section>

      <section>
        <h2>Overzicht</h2>

        {facturen.length === 0 && (
          <p>Geen facturen aanwezig.</p>
        )}

        {facturen.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Factuur</th>
                <th>Contract</th>
                <th>Leverancier</th>
                <th>Omschrijving</th>
                <th>Bedrag</th>
                <th>Datum</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {facturen.map(f => (
                <tr key={f.id}>
                  <td>{f.factuurnummer}</td>
                  <td>
                    {f.inkoop_bestellingen?.inkoop_contracten?.contract_nummer}
                  </td>
                  <td>
                    {f.inkoop_bestellingen?.inkoop_contracten?.inkoop_offertes?.leveranciers?.naam}
                  </td>
                  <td>{f.inkoop_bestellingen?.omschrijving}</td>
                  <td>€ {Number(f.bedrag).toFixed(2)}</td>
                  <td>{f.factuurdatum || "-"}</td>
                  <td>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
