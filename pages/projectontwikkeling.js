export default function Page() {
  return (
    <div>
      <h1>Projectontwikkeling</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/projectontwikkeling/updates" className="btn btn-primary me-2 mb-2">
      Updates
    </a>
  
    <a href="/projectontwikkeling/documenten" className="btn btn-primary me-2 mb-2">
      Documenten
    </a>
  
    <a href="/projectontwikkeling/meldingen" className="btn btn-primary me-2 mb-2">
      Meldingen
    </a>
  
      </div>
    </div>
  )
}