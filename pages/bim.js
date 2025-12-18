export default function Page() {
  return (
    <div>
      <h1>Ontwerp en BIM</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/bim/bouwkundig" className="btn btn-primary me-2 mb-2">
      Bouwkundig
    </a>
  
    <a href="/bim/installaties" className="btn btn-primary me-2 mb-2">
      Installaties
    </a>
  
    <a href="/bim/tekeningen" className="btn btn-primary me-2 mb-2">
      Tekeningen
    </a>
  
      </div>
    </div>
  )
}