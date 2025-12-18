export default function Page() {
  return (
    <div>
      <h1>Constructie berekenen</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/constructie/fundering" className="btn btn-primary me-2 mb-2">
      Fundering
    </a>
  
    <a href="/constructie/staal" className="btn btn-primary me-2 mb-2">
      Staal
    </a>
  
    <a href="/constructie/rapporten" className="btn btn-primary me-2 mb-2">
      Rapporten
    </a>
  
      </div>
    </div>
  )
}