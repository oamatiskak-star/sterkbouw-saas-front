
export default function PageShell({ title, description }) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="text-muted">{description}</p>
      <div className="row row-cards mt-4">
        <div className="col-md-3"><div className="card"><div className="card-body">KPI 1</div></div></div>
        <div className="col-md-3"><div className="card"><div className="card-body">KPI 2</div></div></div>
        <div className="col-md-3"><div className="card"><div className="card-body">KPI 3</div></div></div>
        <div className="col-md-3"><div className="card"><div className="card-body">KPI 4</div></div></div>
      </div>
    </div>
  )
}
