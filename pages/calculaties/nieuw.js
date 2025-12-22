import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const inputStyle = {
  width: "100%",
  height: 44,
  padding: "8px 12px",
  fontSize: 14,
  boxSizing: "border-box",
  borderRadius: 4,
  border: "1px solid #d1d5db"
}

const buttonStyle = {
  ...inputStyle,
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  fontWeight: 600,
  cursor: "pointer"
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

export default function NieuweCalculatie() {
  const router = useRouter()
  const { isReady, query } = router
  const project_id = isReady && query.project_id ? String(query.project_id) : null

  if (!isReady) return <div>Laden...</div>
  if (!project_id) return <div>Project ontbreekt</div>

  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("Nederland")
  const [telefoon, setTelefoon] = useState("")
  const [projectType, setProjectType] = useState("Nieuwbouw")
  const [opmerking, setOpmerking] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleStartCalculatie() {
    if (creating) return
    setCreating(true)

    try {
      const { data, error } = await supabase
        .from("calculaties")
        .insert({
          project_id,
          naam_opdrachtgever: naamOpdrachtgever,
          omschrijving,
          adres,
          postcode,
          plaatsnaam,
          land,
          telefoon,
          project_type: projectType,
          opmerking,
          workflow_status: "initializing"
        })
        .select("id")
        .single()

      if (error) throw error

      await supabase.rpc("start_project_initialisation", {
        p_project_id: project_id
      })

      router.replace(`/calculaties/${data.id}`)
    } catch (e) {
      alert(e.message)
      setCreating(false)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>

      <div style={{ marginBottom: 16, padding: 12, background: "#eef2ff", borderRadius: 6, fontWeight: 600 }}>
        Project ID: {project_id}
      </div>

      {/* KNOP NAAR UPLOADPAGINA */}
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          style={{ ...buttonStyle, background: "#16a34a" }}
          onClick={() => router.push(`/calculaties/upload?project_id=${project_id}`)}
        >
          Bestanden uploaden
        </button>
      </div>

      <form onSubmit={e => e.preventDefault()}>
        <Field label="Naam opdrachtgever">
          <input style={inputStyle} value={naamOpdrachtgever} onChange={e => setNaamOpdrachtgever(e.target.value)} />
        </Field>

        <Field label="Omschrijving">
          <input style={inputStyle} value={omschrijving} onChange={e => setOmschrijving(e.target.value)} />
        </Field>

        <Field label="Adres">
          <input style={inputStyle} value={adres} onChange={e => setAdres(e.target.value)} />
        </Field>

        <Field label="Postcode">
          <input style={inputStyle} value={postcode} onChange={e => setPostcode(e.target.value)} />
        </Field>

        <Field label="Plaatsnaam">
          <input style={inputStyle} value={plaatsnaam} onChange={e => setPlaatsnaam(e.target.value)} />
        </Field>

        <Field label="Projecttype">
          <select style={inputStyle} value={projectType} onChange={e => setProjectType(e.target.value)}>
            <option>Nieuwbouw</option>
            <option>Utiliteitsbouw</option>
            <option>Transformatie</option>
            <option>Renovatie</option>
          </select>
        </Field>

        <Field label=" ">
          <button
            type="button"
            style={buttonStyle}
            onClick={handleStartCalculatie}
            disabled={creating}
          >
            {creating ? "Bezig..." : "Start calculatie"}
          </button>
        </Field>
      </form>
    </>
  )
}
