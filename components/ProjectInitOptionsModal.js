import { useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/* ======================
   HARDE UPLOAD FUNCTIE
   GEEN SUPABASE CLIENT
   GEEN STORAGE SDK
   ====================== */
async function uploadFileHard({ file, projectId }) {
  if (!file || !projectId) {
    throw new Error("FILE_OF_PROJECT_ID_ONTBREEKT")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error("SUPABASE_ENV_ONTBREEKT")
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const filePath = `${projectId}/${Date.now()}_${safeName}`

  const uploadUrl =
    `${supabaseUrl}/storage/v1/object/STERKBOUW/${filePath}`

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": file.type || "application/octet-stream"
    },
    body: file
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`UPLOAD_FAILED ${res.status}: ${text}`)
  }

  return filePath
}

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

    try {
      for (const file of files) {
        await uploadFileHard({ file, projectId })
      }
      setUploadCount(prev => prev + files.length)
    } catch (err) {
      console.error("UPLOAD_ERROR", err)
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleStart() {
    if (starting) return
    if (!projectId) return alert("Project ontbreekt")
    if (uploadCount === 0) return alert("Upload eerst bestanden")

    setStarting(true)

    const { error } = await supabase
      .from("executor_tasks")
      .insert({
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

    setStarting(false)
    if (onConfirm) onConfirm()
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
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        width: 720,
        background: "#fff",
        borderRadius: 8,
        padding: 24
      }}>
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
