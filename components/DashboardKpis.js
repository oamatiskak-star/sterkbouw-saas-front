export default function DashboardKpis({ kpis }) {
  if (!kpis || kpis.length === 0) return null

  return (
    <div className="row mb-4">
      {kpis.map(kpi => (
        <div key={kpi.kpi_key} className="col">
          <div className="card">
            <div className="card-body">
              <div className="text-muted">{kpi.label}</div>
              <div className="fs-3 fw-bold">{kpi.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
