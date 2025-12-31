// pages/inkoop/components/NotificationsTab.js
export default function NotificationsTab({ notifications, setNotifications }) {
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-bell text-primary me-2"></i>
        Meldingen
      </h5>
      
      <div className="card border">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Inkoop Notificaties</h6>
            <div>
              <span className="badge bg-primary">
                {notifications.filter(n => !n.read).length} ongelezen
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="list-group list-group-flush">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="me-3">
                      <div className={`rounded-circle p-2 ${notification.type === 'price_response' ? 'bg-success' : notification.type === 'negotiation' ? 'bg-warning' : 'bg-info'}`}>
                        <i className={`ti ti-${notification.type === 'price_response' ? 'mail' : notification.type === 'negotiation' ? 'message' : 'bell'}`}></i>
                      </div>
                    </div>
                    
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{notification.title}</h6>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">
                        {new Date(notification.created_at).toLocaleString('nl-NL')}
                      </small>
                    </div>
                    
                    <div className="ms-3">
                      <div className="btn-group btn-group-sm">
                        {!notification.read && (
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <i className="ti ti-check"></i>
                          </button>
                        )}
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <i className="ti ti-bell-off text-muted" style={{fontSize: '3rem'}}></i>
                <p className="text-muted mt-3">Geen meldingen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
