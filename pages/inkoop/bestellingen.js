import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function Bestellingen() {
  const [contracten, setContracten] = useState([])
  const [bestellingen, setBestellingen] = useState([])
  const [contractId, setContractId] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [bedrag, setBedrag] = useState("")
  const [leverdatum, setLeverdatum] = useState("")
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
          inkoop_offertes (
            discipline,
            leveranciers ( naam )
          )
        `)
        .eq("status", "actief")
        .order("created_at", { ascending: false })

      const { data: b, error: bErr } = await supabase
        .from("inkoop_bestellingen")
        .select(`
          id,
          omschrijving,
          bedrag,
          leverdatum,
          status,
          inkoop_contracten (
            contract_nummer,
            inkoop_offertes (
              discipline,
              leveranciers ( naam )
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (!cancelled) {
        if (cErr) {
          console.error("CONTRACTEN_LOAD_FAILED", cErr)
          setContracten([])
        } else {
          setContracten(c || [])
        }

        if (bErr) {
          console.error("BESTELLINGEN_LOAD_FAILED", bErr)
          setBestellingen([])
        } else {
          setBestellingen(b || [])
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
    if (!contractId || !omschrijving || !bedrag) return

    await supabase.from("inkoop_bestellingen").insert({
      contract_id: contractId,
      omschrijving,
      bedrag: Number(bedrag),
      leverdatum: leverdatum || null,
      status: "besteld"
    })

    setContractId("")
    setOmschrijving("")
    setBedrag("")
    setLeverdatum("")
    location.reload()
  }

  if (loading) return null

  return (
    <>
      <h1>Bestellingen</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuwe bestelling</h2>

        <select
          value={contractId}
          onChange={e => setContractId(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="">Kies contract</option>
          {contracten.map(c => (
            <option key={c.id} value={c.id}>
              {c.contract_nummer} – {c.inkoop_offertes?.discipline} –{" "}
              {c.inkoop_offertes?.leveranciers?.naam}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Omschrijving"
          value={omschrijving}
          onChange={e => setOmschrijving(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="number"
          placeholder="Bedrag"
          value={bedrag}
