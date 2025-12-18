export default function Page() {
  return (
    <div>
      <h1>Nieuw Project</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/nieuw-project/import" className="btn btn-primary me-2 mb-2">
      Importeer bestanden
    </a>
  
    <a href="/nieuw-project/structuur" className="btn btn-primary me-2 mb-2">
      Maak structuur
    </a>
  
    <a href="/nieuw-project/taken" className="btn btn-primary me-2 mb-2">
      Open taken
    </a>
  
      </div>
    </div>
  )
}