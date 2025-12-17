import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function ModuleKPI({ submoduleKey }) {
  const [kpi, setKpi] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/kpi/${submoduleKey}`)
      .then(r => r.json())
      .then(setKpi)
  }, [submoduleKey])

  if (!kpi) return null

  return (
    <div className="row mb-4">
      {kpi.map(item => (
        <div key={item.key} className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted">{item.label}</div>
              <div className="h2">{item.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
