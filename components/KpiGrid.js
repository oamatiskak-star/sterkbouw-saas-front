import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function KpiGrid({ module = "dashboard" }) {
  const [kpis, setKpis] = useState([])

  useEffect(() => {
    loadKpis()
  }, [module])

  async function loadKpis() {
    const { data } = await supabase
      .from("ui_kpi_blocks")
      .select("*")
      .eq("module_slug", module)
      .order("position")

    setKpis(data || [])
  }

  return (
    <div className="row row-deck row-cards">
      {kpis.map(kpi => (
        <div key={kpi.id} className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className={`icon ti ti-${kpi.icon} me-2`} />
                <div>
                  <div className="text-muted">{kpi.title}</div>
                  <div className="h1">—</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
