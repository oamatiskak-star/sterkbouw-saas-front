import { useState } from "react"

export default function AuditLogTable({ logs }) {
  const [filter, setFilter] = useState("")

  if (!logs || logs.length === 0) {
    return <div>Geen audit logs gevonden</div>
  }

  const filtered = logs.filter(l =>
    !filter ||
    l.workflow_key?.includes(filter) ||
    l.action?.includes(filter) ||
    l.user_email?.includes(filter)
  )

  return (
    <div>
      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Filter op workflow, actie of gebruiker"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tijd</th>
              <th>Gebruiker</th>
              <th>Project</th>
              <th>Workflow</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.user_email || log.user_id}</td>
                <td>{log.project_id}</td>
                <td>{log.workflow_key}</td>
                <td>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
