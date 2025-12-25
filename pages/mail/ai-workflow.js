import { useEffect, useState, useRef } from "react"
import axios from "axios"
import supabase from "@/lib/supabase"

export default function AIWorkflowMail() {
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const loadedRef = useRef(false)

  // Laad alle mails – exact 1×
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("project_mail")
        .select("*")
        .order("created_at", { ascending: false })

      if (!cancelled) {
        setMails(data || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  // Scan en verwerk mails
  async function scanMails() {
    if (processing) return
    setProcessing(true)

    for (const mail of mails) {
      if (mail.verwerkt) continue

      try {
        const response = await axios.post("/api/ai/mail-analyse", {
          onderwerp: mail.onderwerp,
          bericht: mail.bericht,
          bijlagen: mail.bijlagen || []
        })

        const acties = response.data.acties || []

        for (const a of acties) {
          switch (a.type) {
            case "calculatie_regel":
              await supabase.from("calculatie_regels").insert({
                calculatie_id: a.calculatie_id,
                omschrijving: a.omschrijving,
                stabu_id: a.stabu_id || null,
                hoeveelheid: a.hoeveelheid || 1,
                eenheid: a.eenheid || "st",
                materiaalprijs: a.materiaalprijs || 0,
                arbeidsprijs: a.arbeidsprijs || 0,
                totaal: a.totaal || 0
              })
              break

            case "inkoop_order":
              await supabase.from("inkoop_bestellingen").insert({
                project_id: a.project_id,
                discipline: a.discipline,
                omschrijving: a.omschrijving,
                bedrag: a.bedrag || 0,
                status: "open"
              })
              break

            case "contracten":
              await supabase.from("project_contracten").insert({
                project_id: a.project_id,
                naam: a.naam,
                bestand: a.bestand || null,
                status: "concept"
              })
              break

            case "notificatie":
              await supabase.from("project_notificaties").insert({
                project_id: a.project_id,
                bericht: a.bericht,
                type: a.type
              })
              break
          }
        }

        await supabase
          .from("project_mail")
          .update({ verwerkt: true })
          .eq("id", mail.id)

      } catch (err) {
        console.error("FOUT BIJ MAIL VERWERKING:", mail.id, err.message)
      }
    }

    setProcessing(false)

    const { data } = await supabase
      .from("project_mail")
      .select("*")
      .order("created_at", { ascending: false })

    setMails(data || [])
  }

  if (loading) return null

  return (
    <div style={{ padding: 16 }}>
      <h1>AI Mail Workflow</h1>

      <button onClick={scanMails} disabled={processing}>
        {processing ? "Verwerken..." : "Scan en verwerk mails"}
      </button>

      <section style={{ marginTop: 24 }}>
        <h2>Inbox</h2>

        {mails.length === 0 && <p>Geen mails aanwezig.</p>}

        {mails.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Project</th>
                <th>Onderwerp</th>
                <th>Bericht</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mails.map(m => (
                <tr key={m.id}>
                  <td>{m.project_id}</td>
                  <td>{m.onderwerp}</td>
                  <td>{m.bericht}</td>
                  <td>{m.verwerkt ? "Verwerkt" : "Nieuw"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
