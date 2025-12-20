export default function ProjectInitOptionsModal({ onConfirm, onCancel }) {
  const options = {
    documents_scanner: true,
    foundation_analyzer: true,
    nen_analyzer: true,
    scope_reconstructor: true,
    calculation_initializer: true,
    installations_generator: true,
    planning_generator: true,
    report_preparer: true
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Project initialisatie</h2>

        {Object.keys(options).map(key => (
          <label key={key}>
            <input type="checkbox" defaultChecked />
            {key}
          </label>
        ))}

        <button onClick={() => onConfirm(options)}>Start</button>
        <button onClick={onCancel}>Annuleren</button>
      </div>
    </div>
  )
}
