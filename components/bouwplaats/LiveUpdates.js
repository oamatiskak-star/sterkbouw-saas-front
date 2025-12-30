import React, { useState, useEffect } from 'react';

const LiveUpdates = ({ projectId, deliveryPoints, dailyPlanning }) => {
  const [updates, setUpdates] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'delivery', 'planning', 'safety'
  
  // Simuleer live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Voeg random updates toe
      const updateTypes = [
        { type: 'delivery', icon: 'fas fa-clipboard-check', color: 'success' },
        { type: 'planning', icon: 'fas fa-calendar', color: 'info' },
        { type: 'safety', icon: 'fas fa-shield-alt', color: 'warning' },
        { type: 'material', icon: 'fas fa-boxes', color: 'primary' },
        { type: 'quality', icon: 'fas fa-award', color: 'purple' }
      ];
      
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      const newUpdate = {
        id: Date.now(),
        type: randomType.type,
        message: getRandomMessage(randomType.type),
        timestamp: new Date().toISOString(),
        icon: randomType.icon,
        color: randomType.color,
        read: false
      };
      
      setUpdates(prev => [newUpdate, ...prev.slice(0, 19)]); // Max 20 updates
    }, 30000); // Elke 30 seconden een nieuwe update
    
    return () => clearInterval(interval);
  }, []);
  
  const getRandomMessage = (type) => {
    const messages = {
      delivery: [
        "Nieuw opleverpunt toegevoegd in BN-001 Badkamer",
        "Opleverpunt goedgekeurd door inspecteur",
        "3 nieuwe beschadigingen gedetecteerd door AI",
        "Oplevering bouwnummer 002 85% compleet"
      ],
      planning: [
        "Taak 'Tegelen' 10 minuten voor op schema",
        "Nieuwe planning update beschikbaar",
        "Vertraging gemeld bij elektra installatie",
        "Planning BN-003 aangepast wegens weersomstandigheden"
      ],
      safety: [
        "Veiligheidsinspectie gepland voor 14:00",
        "PBW check uitgevoerd: alle certificaten geldig",
        "Veiligheidsprotocol update beschikbaar",
        "Nieuwe veiligheidsinstructie geüpload"
      ],
      material: [
        "Nieuwe materiaallevering aangekomen",
        "Cement voorraad onder 20% - tijd om bij te bestellen",
        "Materiaal verbruik 15% hoger dan gepland",
        "Kwaliteitscontrole materialen geslaagd"
      ],
      quality: [
        "AI kwaliteitscheck: 3 afwijkingen gedetecteerd",
        "Kwaliteitsrapport BN-002 beschikbaar",
        "Nieuwe kwaliteitsnormen toegevoegd",
        "Kwaliteitsinspectie gepland voor morgen"
      ]
    };
    
    return messages[type]?.[Math.floor(Math.random() * messages[type].length)] || "Nieuwe update";
  };
  
  const filteredUpdates = updates.filter(update => 
    filter === 'all' || update.type === filter
  );
  
  return (
    <div className="live-updates">
      <div className="updates-header">
        <h4><i className="fas fa-broadcast-tower"></i> Live Updates</h4>
        <div className="update-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
          <button 
            className={`filter-btn ${filter === 'delivery' ? 'active' : ''}`}
            onClick={() => setFilter('delivery')}
          >
            Oplevering
          </button>
          <button 
            className={`filter-btn ${filter === 'planning' ? 'active' : ''}`}
            onClick={() => setFilter('planning')}
          >
            Planning
          </button>
        </div>
      </div>
      
      <div className="updates-list">
        {filteredUpdates.map(update => (
          <div key={update.id} className={`update-item ${update.read ? 'read' : 'unread'}`}>
            <div className="update-icon">
              <i className={update.icon} style={{color: `var(--${update.color})`}}></i>
            </div>
            <div className="update-content">
              <p className="update-message">{update.message}</p>
              <small className="update-time">
                {new Date(update.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </small>
            </div>
            {!update.read && <div className="unread-dot"></div>}
          </div>
        ))}
        
        {filteredUpdates.length === 0 && (
          <div className="no-updates">
            <i className="fas fa-check-circle text-muted"></i>
            <p>Geen updates</p>
          </div>
        )}
      </div>
      
      <div className="updates-stats">
        <div className="stat">
          <i className="fas fa-exclamation-triangle text-warning"></i>
          <span>{deliveryPoints.filter(p => p.status === 'open').length} open punten</span>
        </div>
        <div className="stat">
          <i className="fas fa-clock text-info"></i>
          <span>{dailyPlanning.filter(t => t.status === 'in_progress').length} lopende taken</span>
        </div>
      </div>
      
      <style jsx>{`
        .live-updates {
          background: white;
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .updates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .updates-header h4 {
          margin: 0;
          font-size: 0.9rem;
          color: var(--primary);
        }
        
        .update-filters {
          display: flex;
          gap: 5px;
        }
        
        .filter-btn {
          padding: 4px 8px;
          font-size: 0.7rem;
          border: 1px solid #e9ecef;
          background: white;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .filter-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .updates-list {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 15px;
        }
        
        .update-item {
          display: flex;
          align-items: flex-start;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 8px;
          transition: all 0.3s;
          position: relative;
        }
        
        .update-item.unread {
          background: rgba(26, 95, 122, 0.05);
        }
        
        .update-item:hover {
          background: #f8f9fa;
        }
        
        .update-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(26, 95, 122, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          flex-shrink: 0;
        }
        
        .update-content {
          flex: 1;
        }
        
        .update-message {
          margin: 0 0 3px 0;
          font-size: 0.85rem;
          line-height: 1.3;
        }
        
        .update-time {
          color: var(--gray);
          font-size: 0.7rem;
        }
        
        .unread-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--danger);
        }
        
        .no-updates {
          text-align: center;
          padding: 20px;
          color: var(--gray);
        }
        
        .no-updates i {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .no-updates p {
          margin: 0;
          font-size: 0.9rem;
        }
        
        .updates-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .updates-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .update-filters {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveUpdates;
