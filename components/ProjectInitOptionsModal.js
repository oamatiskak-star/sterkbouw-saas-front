import { useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectInitOptionsModal({ projectId, onConfirm, onCancel }) {
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [uploadCount, setUploadCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [starting, setStarting] = useState(false)

  const [options, setOptions] = useState({
    documents: true,
    rename_files: true,
    classify_documents: true,
    foundation_check: true,
    nen_meting: true,
    bag_bro_check: true,
    scope_reconstruction: true,
    stabu_structure: true,
    default_posts: true,
    quantity_derivation: true,
    installations_e: true,
    installations_w: true,
    planning: true,
    report_pdf: true,
    assumptions_report: true,
    risk_report: true
  })

  const toggle = key =>
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)

    for (const file of files) {
      await supabase.storage
        .from("project-files")
        .upload(`temp/${Date.now()}_${file.name}`, file, { upsert: false })
    }

    setUploadCount(prev => prev + files.length)
    setUploading(false)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleStart() {
    if (starting) return
    if (!projectId) {
      alert("Project ontbreekt")
      return
    }
    if (uploadCount === 0) {
      alert("Upload eerst bestanden")
      return
    }

    setStarting(true)

    const { error } = await supabase.from("executor_tasks").insert({
      project_id: projectId,
      action: "PROJECT_SCAN",
      status: "open",
      assigned_to: "executor",
      payload: {
        options,
        uploaded_files: uploadCount
      }
    })

    if (error) {
      console.error(error)
      alert("Initialisatie kon niet worden gestart")
      setStarting(false)
      return
    }

    // UI afronden
    setStarting(false)
    if (onConfirm) onConfirm()

    // DIRECT DOOR NAAR INITIALISATIE
    router.push(`/calculaties/${projectId}/initialisatie`)
  }

  const Row = ({ checked, onChange, label }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  )

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
    >
      <div
        style={{
          width: 720,
          background: "#fff",
          borderRadius: 8,
          padding: 24
        }}
      >
        <h2>Project initialisatie</h2>

        <Section title="Document & structuur">
          <Row checked={options.documents} onChange={() => toggle("documents")} label="Document scan" />
          <Row checked={options.rename_files} onChange={() => toggle("rename_files")} label="Bestanden hernoemen" />
          <Row checked={options.classify_documents} onChange={() => toggle("classify_documents")} label="Document classificatie" />
        </Section>

        <Section title="Analyse & controle">
          <Row checked={options.foundation_check} onChange={() => toggle("foundation_check")} label="Fundering check" />
          <Row checked={options.nen_meting} onChange={() => toggle("nen_meting")} label="NEN-meting" />
          <Row checked={options.bag_bro_check} onChange={() => toggle("bag_bro_check")} label="BAG / BRO analyse" />
          <Row checked={options.scope_reconstruction} onChange={() => toggle("scope_reconstruction")} label="Scope reconstructie" />
        </Section>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFilesSelected}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <div>
            {uploading && "Uploaden..."}
            {!uploading && uploadCount > 0 && `${uploadCount} bestanden geüpload`}
            {!uploading && uploadCount === 0 && "Nog geen bestanden geüpload"}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleImportClick}>Importeer bestanden</button>
            <button onClick={onCancel}>Annuleren</button>
            <button disabled={uploadCount === 0 || starting} onClick={handleStart}>
              {starting ? "Starten…" : "Start"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
