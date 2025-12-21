import { useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectInitOptionsModal({ projectId, onConfirm, onCancel }) {
  const fileInputRef = useRef(null)

  const [uploadCount, setUploadCount] = useState(0)
  const [uploading, setUploading] = useState(false)

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
      const path = `${projectId}/${Date.now()}_${file.name}`

      await supabase.storage
        .from("project-files")
        .upload(path, file, { upsert: false })

      await supabase.from("project_files").insert({
        project_id: projectId,
        filename: file.name,
        storage_path: path
      })
    }

    setUploadCount(prev => prev + files.length)
    setUploading(false)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleStart() {
    if (uploadCount === 0) return

    const { data: jobId, error } = await supabase.rpc(
      "start_project_initialisation",
      { p_project_id: projectId }
    )

    if (error) {
      alert("Starten van calculatie mislukt")
      return
    }

    onConfirm({
      options,
      uploaded_files: uploadCount,
      job_id: jobId
    })
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
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>
          Project initialisatie
        </h2>

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

        <Section title="Calculatie">
          <Row checked={options.stabu_structure} onChange={() => toggle("stabu_structure")} label="STABU structuur" />
          <Row checked={options.default_posts} onChange={() => toggle("default_posts")} label="Standaard posten" />
          <Row checked={options.quantity_derivation} onChange={() => toggle("quantity_derivation")} label="Hoeveelheden afleiden" />
        </Section>

        <Section title="Installaties">
          <Row checked={options.installations_e} onChange={() => toggle("installations_e")} label="Elektra" />
          <Row checked={options.installations_w} onChange={() => toggle("installations_w")} label="Werktuigbouw" />
        </Section>

        <Section title="Planning">
          <Row checked={options.planning} onChange={() => toggle("planning")} label="Bouwplanning" />
        </Section>

        <Section title="Rapportage">
          <Row checked={options.report_pdf} onChange={() => toggle("report_pdf")} label="2jours PDF" />
          <Row checked={options.assumptions_report} onChange={() => toggle("assumptions_report")} label="Aannames" />
          <Row checked={options.risk_report} onChange={() => toggle("risk_report")} label="Risico’s" />
        </Section>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFilesSelected}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24
          }}
        >
          <div style={{ fontSize: 14 }}>
            {uploading && "Uploaden..."}
            {!uploading && uploadCount > 0 && `${uploadCount} bestanden geüpload`}
            {!uploading && uploadCount === 0 && "Nog geen bestanden geüpload"}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{ padding: "12px 20px", background: "#2563eb", color: "#fff", borderRadius: 6 }}
              onClick={handleImportClick}
            >
              Importeer bestanden
            </button>

            <button
              style={{ padding: "12px 20px" }}
              onClick={onCancel}
            >
              Annuleren
            </button>

            <button
              disabled={uploadCount === 0}
              style={{
                padding: "12px 20px",
                background: uploadCount === 0 ? "#9ca3af" : "#2563eb",
                color: "#fff",
                borderRadius: 6,
                cursor: uploadCount === 0 ? "not-allowed" : "pointer"
              }}
              onClick={handleStart}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
