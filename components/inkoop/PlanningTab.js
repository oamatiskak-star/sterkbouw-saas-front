export default function PlanningTab({ planningData, projects, orders, integrateWithPlanning, loading }) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-calendar text-primary me-2"></i>
        Planning Integratie
      </h5>
      <div className="alert alert-info">
        <i className="ti ti-info-circle me-2"></i>
        Planning integratie met MS Project
      </div>
    </div>
  )
}
