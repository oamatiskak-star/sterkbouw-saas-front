export default function ExecutorStatusPanel({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="alert alert-secondary">
        Geen executor activiteiten
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        Executor status
      </div>

      <div className="card-body p-0">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Tijd</th>
              <th>Project</th>
              <th>Workflow</th>
              <th>Status</th>
              <th>Melding</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.project_id}</td>
                <td>{log.workflow_key}</td>
                <td>
                  <span className="badge bg-info">
                    {log.status}
                  </span>
                </td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
