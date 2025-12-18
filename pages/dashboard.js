export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/nieuw-project" className="btn btn-primary me-2 mb-2">
      Nieuw project
    </a>
  
    <a href="/projecten" className="btn btn-primary me-2 mb-2">
      Projecten
    </a>
  
    <a href="/calculaties" className="btn btn-primary me-2 mb-2">
      Calculaties
    </a>
  
    <a href="/financien" className="btn btn-primary me-2 mb-2">
      Financiën
    </a>
  
      </div>
    </div>
  )
}