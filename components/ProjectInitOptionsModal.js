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

  const toggle = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div
      className="sb-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div
        className="sb-modal"
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h2>Project initialisatie</h2>

        <section>
          <strong>Document & structuur</strong>
          <label><input type="checkbox" checked={options.documents} onChange={() => toggle("documents")} /> Document scan</label><br />
          <label><input type="checkbox" checked={options.rename_files} onChange={() => toggle("rename_files")} /> Bestanden hernoemen</label><br />
          <label><input type="checkbox" checked={options.classify_documents} onChange={() => toggle("classify_documents")} /> Document classificatie</label>
        </section>

        <section>
          <strong>Analyse & controle</strong>
          <label><input type="checkbox" checked={options.foundation_check} onChange={() => toggle("foundation_check")} /> Fundering check</label><br />
          <label><input type="checkbox" checked={options.nen_meting} onChange={() => toggle("nen_meting")} /> NEN-meting</label><br />
          <label><input type="checkbox" checked={options.bag_bro_check} onChange={() => toggle("bag_bro_check")} /> BAG / BRO analyse</label><br />
          <label><input type="checkbox" checked={options.scope_reconstruction} onChange={() => toggle("scope_reconstruction")} /> Scope reconstructie</label>
        </section>

        <section>
          <strong>Calculatie</strong>
          <label><input type="checkbox" checked={options.stabu_structure} onChange={() => toggle("stabu_structure")} /> STABU structuur</label><br />
          <label><input type="checkbox" checked={options.default_posts} onChange={() => toggle("default_posts")} /> Standaard posten</label><br />
          <label><input type="checkbox" checked={options.quantity_derivation} onChange={() => toggle("quantity_derivation")} /> Hoeveelheden afleiden</label>
        </section>

        <section>
          <strong>Installaties</strong>
          <label><input type="checkbox" checked={options.installations_e} onChange={() => toggle("installations_e")} /> Elektra</label><br />
          <label><input type="checkbox" checked={options.installations_w} onChange={() => toggle("installations_w")} /> Werktuigbouw</label>
        </section>

        <section>
          <strong>Planning</strong>
          <label><input type="checkbox" checked={options.planning} onChange={() => toggle("planning")} /> Bouwplanning</label>
        </section>

        <section>
          <strong>Rapportage</strong>
          <label><input type="checkbox" checked={options.report_pdf} onChange={() => toggle("report_pdf")} /> 2jours PDF</label><br />
          <label><input type="checkbox" checked={options.assumptions_report} onChange={() => toggle("assumptions_report")} /> Aannames</label><br />
          <label><input type="checkbox" checked={options.risk_report} onChange={() => toggle("risk_report")} /> Risico’s</label>
        </section>

        <div className="sb-modal-actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={() => onConfirm(options)}
          >
            Start
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ marginLeft: 12 }}
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  )
}
