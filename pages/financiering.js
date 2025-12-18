export default function Page() {
  return (
    <div>
      <h1>Financiering</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/financiering" className="btn btn-primary me-2 mb-2">
      Nieuwe analyse
    </a>
  
    <a href="/financiering/ltv" className="btn btn-primary me-2 mb-2">
      LTV overzicht
    </a>
  
    <a href="/financiering/exit" className="btn btn-primary me-2 mb-2">
      Exit scenario
    </a>
  
      </div>
    </div>
  )
}