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

  const [creating, setCreating] = useState(false)

  async function handleStartCalculatie() {
    if (creating) return
    setCreating(true)

    try {
      const { data, error } = await supabase
        .from("calculaties")
        .insert([
          {
            project_id: project_id,
            workflow_status: "initializing"
          }
        ])
        .select("id")

      if (error) {
        alert("Insert fout: " + error.message)
        setCreating(false)
        return
      }

      if (!data || !data[0]?.id) {
        alert("Calculatie aangemaakt maar geen ID ontvangen")
        setCreating(false)
        return
      }

      const calculatieId = data[0].id

      await supabase.rpc("start_project_initialisation", {
        p_project_id: project_id
      })

      router.replace(`/calculaties/${calculatieId}`)
    } catch (e) {
      alert("Onverwachte fout: " + e.message)
      setCreating(false)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: "#eef2ff",
          borderRadius: 6,
          fontWeight: 600
        }}
      >
        Project ID: {project_id}
      </div>

      <button
        type="button"
        style={{ ...buttonStyle, width: 260 }}
        onClick={handleStartCalculatie}
        disabled={creating}
      >
        {creating ? "Bezig..." : "Start calculatie"}
      </button>
    </>
  )
}
