export default function OrdersTab({ 
  orders, projects, suppliers, autoOrderTemplate, 
  setAutoOrderTemplate, previewOrder, setPreviewOrder, activeTab 
}) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-package text-primary me-2"></i>
        Bestellingen
      </h5>
      <div className="alert alert-info">
        <i className="ti ti-info-circle me-2"></i>
        Hier worden automatisch gegenereerde orders getoond
      </div>
    </div>
  )
}
