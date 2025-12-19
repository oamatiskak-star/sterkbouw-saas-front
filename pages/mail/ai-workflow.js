import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AIWorkflowMail() {
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Laad alle mails
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from("project_mail")
        .select("*")
        .order("created_at", { ascending: false })
      setMails(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Scan en verwerk mails
  async function scanMails() {
    if (processing) return
    setProcessing(true)

    for (let mail of mails) {
      if (mail.verwerkt) continue

      try {
        // AI analyse van onderwerp + bericht
        const response = await axios.post("/api/ai/mail-analyse", {
          onderwerp: mail.onderwerp,
          bericht: mail.bericht,
          bijlagen: mail.bijlagen || []
        })

        const acties = response.data.acties || []

        // Verwerk acties in calculatie / inkoop / contracten
        for (let a of acties) {
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

        // Markeer mail als verwerkt
        await supabase
          .from("project_mail")
          .update({ verwerkt: true })
          .eq("id", mail.id)

      } catch (err) {
        console.error("FOUT BIJ MAIL VERWERKING:", mail.id, err.message)
      }
    }

    setProcessing(false)
    // refresh mails
    const { data } = await supabase.from("project_mail").select("*").order("created_at", { ascending: false })
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
