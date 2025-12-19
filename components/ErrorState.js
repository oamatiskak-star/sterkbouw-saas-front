export default function ErrorState({ title, message, actionLabel, onAction }) {
  return (
    <div className="alert alert-danger">
      <div className="fw-bold mb-1">
        {title || "Er is een fout opgetreden"}
      </div>

      <div className="mb-3">
        {message || "Onbekende fout"}
      </div>

      {actionLabel && onAction && (
        <button
          className="btn btn-outline-danger"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
