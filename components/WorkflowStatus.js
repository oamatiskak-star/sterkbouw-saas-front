export default function WorkflowStatus({ status }) {
  if (!status) {
    return (
      <div className="alert alert-secondary">
        Geen workflowstatus beschikbaar
      </div>
    )
  }

  const {
    workflow_key,
    state,
    started_at,
    finished_at,
    message
  } = status

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <strong>{workflow_key}</strong>
          <span className="badge bg-primary">{state}</span>
        </div>

        {started_at && (
          <div className="text-muted">
            Start: {new Date(started_at).toLocaleString()}
          </div>
        )}

        {finished_at && (
          <div className="text-muted">
            Einde: {new Date(finished_at).toLocaleString()}
          </div>
        )}

        {message && (
          <div className="mt-2">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
