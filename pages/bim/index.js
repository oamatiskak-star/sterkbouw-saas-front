export default function Page() {
  return (
    <>
      <h1 className="mb-4">Ontwerp en BIM</h1>

      <div className="row row-cards mb-4">
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">KPI 1</div>
              <div className="h1">–</div>
            </div>
          </div>
        </div>
      
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">KPI 2</div>
              <div className="h1">–</div>
            </div>
          </div>
        </div>
      
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">KPI 3</div>
              <div className="h1">–</div>
            </div>
          </div>
        </div>
      
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">KPI 4</div>
              <div className="h1">–</div>
            </div>
          </div>
        </div>
      
      </div>

      <div className="row row-cards">
        
        <div className="col-md-3">
          <a href="/bim/bouwkundig" className="card card-link">
            <div className="card-body text-center">
              <h3 className="card-title">Bouwkundig</h3>
              <div className="btn btn-primary mt-2 w-100">
                Open
              </div>
            </div>
          </a>
        </div>
      
        <div className="col-md-3">
          <a href="/bim/installaties" className="card card-link">
            <div className="card-body text-center">
              <h3 className="card-title">Installaties</h3>
              <div className="btn btn-primary mt-2 w-100">
                Open
              </div>
            </div>
          </a>
        </div>
      
        <div className="col-md-3">
          <a href="/bim/tekeningen" className="card card-link">
            <div className="card-body text-center">
              <h3 className="card-title">Tekeningen</h3>
              <div className="btn btn-primary mt-2 w-100">
                Open
              </div>
            </div>
          </a>
        </div>
      
      </div>
    </>
  )
}