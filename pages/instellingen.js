export default function Page() {
  return (
    <div>
      <h1>Instellingen</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/instellingen/gebruikers" className="btn btn-primary me-2 mb-2">
      Gebruikers
    </a>
  
    <a href="/instellingen/rollen" className="btn btn-primary me-2 mb-2">
      Rollen
    </a>
  
    <a href="/instellingen/systeem" className="btn btn-primary me-2 mb-2">
      Systeem
    </a>
  
      </div>
    </div>
  )
}