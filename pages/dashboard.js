import Link from "next/link"
import { NAVIGATION } from "../config/navigation"

export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title mb-4">Dashboard</h1>

      <div className="row row-cards">
        {NAVIGATION.map(item => (
          <div key={item.key} className="col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h3 className="card-title">{item.label}</h3>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="text-muted">KPI 1</div>
                    <div className="h3">—</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">KPI 2</div>
                    <div className="h3">—</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">KPI 3</div>
                    <div className="h3">—</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">KPI 4</div>
                    <div className="h3">—</div>
                  </div>
                </div>

                <div className="mt-auto d-flex gap-2">
                  <Link href={item.route} className="btn btn-primary">
                    Naar {item.label}
                  </Link>

                  {item.children && item.children.length > 0 && (
                    <Link
                      href={item.children[0].route}
                      className="btn btn-outline-secondary"
                    >
                      Eerste actie
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

