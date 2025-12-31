export default function NotificationsTab({ notifications, setNotifications }) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-bell text-primary me-2"></i>
        Meldingen
      </h5>
      <div className="alert alert-info">
        <i className="ti ti-info-circle me-2"></i>
        Notificaties voor inkoop activiteiten
      </div>
    </div>
  )
}
