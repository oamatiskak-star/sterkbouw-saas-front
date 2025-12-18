export default function Page() {
  return (
    <div>
      <h1>Calculaties</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/calculaties/nieuw" className="btn btn-primary me-2 mb-2">
      Nieuwe calculatie
    </a>
  
    <a href="/calculaties" className="btn btn-primary me-2 mb-2">
      Overzicht
    </a>
  
    <a href="/calculaties/output" className="btn btn-primary me-2 mb-2">
      Output / PDF
    </a>
  
      </div>
    </div>
  )
}