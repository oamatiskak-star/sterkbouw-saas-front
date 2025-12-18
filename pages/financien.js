export default function Page() {
  return (
    <div>
      <h1>Financiën</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/financien/cashflow" className="btn btn-primary me-2 mb-2">
      Cashflow
    </a>
  
    <a href="/financien/rapportages" className="btn btn-primary me-2 mb-2">
      Rapportages
    </a>
  
      </div>
    </div>
  )
}