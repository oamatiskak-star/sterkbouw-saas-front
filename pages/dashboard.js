
import { NAVIGATION } from "../config/navigation"

export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="row row-cards mt-4">
        {NAVIGATION.map(item => (
          <div key={item.key} className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h3>{item.label}</h3>
                <a href={item.route}>Ga naar {item.label}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
