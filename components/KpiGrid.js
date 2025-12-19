export default function KpiGrid({ items = [] }) {
  if (!items.length) return null

  return (
    <div className="sb-kpi-grid">
      {items.map(kpi => (
        <div key={kpi.key} className="sb-kpi-card">
          <div className="sb-kpi-label">{kpi.label}</div>
          <div className="sb-kpi-value">{kpi.value}</div>

          {kpi.sub && (
            <div className="sb-kpi-sub">
              {kpi.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
