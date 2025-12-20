import { useState } from "react"

export default function ProjectInitOptionsModal({ onConfirm, onCancel }) {
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
          width: 640,
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

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24
          }}
        >
          <button onClick={onCancel}>Annuleren</button>
          <button onClick={() => onConfirm(options)}>Start</button>
        </div>
      </div>
    </div>
  )
}
