export default function Page() {
  return (
    <div>
      <h1>Mail</h1>

      <div className="row my-4">
        <div className="col"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>

      <div className="mt-4">
        
    <a href="/mail" className="btn btn-primary me-2 mb-2">
      Inbox
    </a>
  
    <a href="/mail/offertes" className="btn btn-primary me-2 mb-2">
      Offertes
    </a>
  
    <a href="/mail/facturen" className="btn btn-primary me-2 mb-2">
      Facturen
    </a>
  
      </div>
    </div>
  )
}