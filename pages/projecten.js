export default function Page() {
  return (
    <div>
      <h1>Projecten</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/projecten/planning" className="btn btn-primary me-2 mb-2">
      Planning
    </a>
  
    <a href="/projecten/documenten" className="btn btn-primary me-2 mb-2">
      Documenten
    </a>
  
    <a href="/projecten/cashflow" className="btn btn-primary me-2 mb-2">
      Cashflow
    </a>
  
      </div>
    </div>
  )
}