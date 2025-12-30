import React, { useState } from 'react';

const PlanningIntegration = ({ 
  projectId, 
  dailyPlanning, 
  currentTask, 
  onTaskComplete, 
  onDelayReport, 
  onProgressUpdate 
}) => {
  const [taskComment, setTaskComment] = useState('');
  
  const renderTaskCard = (task) => (
    <div className={`task-card ${task.status}`} key={task.id}>
      <div className="task-header">
        <div className="task-info">
          <h4>{task.task}</h4>
          <div className="task-meta">
            <span className="badge bg-primary">{task.buildingNumber}</span>
            <span className="badge bg-secondary">{task.space}</span>
            <span className="badge bg-info">{task.assignedTo.join(', ')}</span>
          </div>
        </div>
        <div className="task-status">
          <span className={`status-badge ${task.status}`}>
            {getStatusText(task.status)}
          </span>
          <div className="progress-circle" style={{background: `conic-gradient(var(--primary) 0% ${task.progress}%, #e9ecef ${task.progress}% 100%)`}}>
            <span>{task.progress}%</span>
          </div>
        </div>
      </div>
      
      <div className="task-timing">
        <div className="time-slot">
          <small>Gepland:</small>
          <strong>{new Date(task.plannedStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
        </div>
        <div className="time-slot">
          <small>Start:</small>
          <strong>{task.actualStart ? new Date(task.actualStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Nog niet'}</strong>
        </div>
        <div className="time-slot">
          <small>Eind:</small>
          <strong>{task.actualEnd ? new Date(task.actualEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-:-'}</strong>
        </div>
      </div>
      
      {task.status === 'in_progress' && (
        <div className="task-controls">
          <div className="progress-slider">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={task.progress} 
              onChange={(e) => onProgressUpdate(task.id, parseInt(e.target.value))}
              className="form-range"
            />
            <div className="progress-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="task-actions">
            <button 
              className="btn btn-success"
              onClick={() => onTaskComplete(task.id)}
            >
              <i className="fas fa-check"></i> Voltooien
            </button>
            
            <button 
              className="btn btn-warning"
              onClick={() => {
                const reason = prompt('Reden vertraging:');
                if (reason) onDelayReport(task.id, reason);
              }}
            >
              <i className="fas fa-clock"></i> Vertraging
            </button>
            
            <button className="btn btn-outline">
              <i className="fas fa-camera"></i> Foto
            </button>
          </div>
        </div>
      )}
      
      {task.delayReason && (
        <div className="delay-alert">
          <i className="fas fa-exclamation-triangle text-warning"></i>
          <strong>Vertraging:</strong> {task.delayReason}
        </div>
      )}
    </div>
  );
  
  const getStatusText = (status) => {
    switch(status) {
      case 'planned': return 'Gepland';
      case 'in_progress': return 'Bezig';
      case 'completed': return 'Voltooid';
      case 'delayed': return 'Vertraagd';
      default: return status;
    }
  };
  
  return (
    <div className="planning-integration">
      <div className="planning-header">
        <h2><i className="fas fa-calendar-alt"></i> Planning Integratie</h2>
        <div className="planning-stats">
          <span className="stat">
            <strong>{dailyPlanning.filter(t => t.status === 'completed').length}</strong>
            <small>Voltooid</small>
          </span>
          <span className="stat">
            <strong>{dailyPlanning.filter(t => t.status === 'in_progress').length}</strong>
            <small>Bezig</small>
          </span>
          <span className="stat">
            <strong>{dailyPlanning.filter(t => t.status === 'delayed').length}</strong>
            <small>Vertraagd</small>
          </span>
        </div>
      </div>
      
      {/* Huidige taak */}
      {currentTask && (
        <div className="current-task">
          <h3><i className="fas fa-play-circle"></i> Huidige taak</h3>
          {renderTaskCard(currentTask)}
        </div>
      )}
      
      {/* Overzicht alle taken */}
      <div className="all-tasks">
        <h3><i className="fas fa-tasks"></i> Alle taken voor vandaag</h3>
        <div className="tasks-grid">
          {dailyPlanning.map(renderTaskCard)}
        </div>
      </div>
      
      {/* Planning commentaar */}
      <div className="planning-comments">
        <h4><i className="fas fa-comment"></i> Planning opmerkingen</h4>
        <div className="comment-input">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Voeg planning opmerking toe..."
            value={taskComment}
            onChange={(e) => setTaskComment(e.target.value)}
          />
          <button className="btn btn-primary">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .planning-integration {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .planning-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .planning-stats {
          display: flex;
          gap: 20px;
        }
        
        .planning-stats .stat {
          text-align: center;
        }
        
        .planning-stats strong {
          display: block;
          font-size: 1.5rem;
          color: var(--primary);
        }
        
        .planning-stats small {
          color: var(--gray);
          font-size: 0.8rem;
        }
        
        .current-task {
          margin-bottom: 30px;
        }
        
        .task-card {
          background: white;
          border-radius: 10px;
          padding: 15px;
          border: 2px solid #e9ecef;
          margin-bottom: 15px;
        }
        
        .task-card.in_progress {
          border-color: var(--info);
          background: rgba(23, 162, 184, 0.05);
        }
        
        .task-card.completed {
          border-color: var(--success);
          background: rgba(40, 167, 69, 0.05);
          opacity: 0.8;
        }
        
        .task-card.delayed {
          border-color: var(--warning);
          background: rgba(255, 193, 7, 0.05);
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        
        .task-info h4 {
          margin: 0 0 10px 0;
          color: var(--dark);
        }
        
        .task-meta {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        
        .task-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status-badge.planned { background: #e9ecef; color: #6c757d; }
        .status-badge.in_progress { background: rgba(23, 162, 184, 0.2); color: #0c5460; }
        .status-badge.completed { background: rgba(40, 167, 69, 0.2); color: #155724; }
        .status-badge.delayed { background: rgba(255, 193, 7, 0.2); color: #856404; }
        
        .progress-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .progress-circle::before {
          content: '';
          position: absolute;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
        }
        
        .progress-circle span {
          position: relative;
          font-weight: bold;
          color: var(--primary);
          font-size: 0.9rem;
        }
        
        .task-timing {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .time-slot {
          text-align: center;
          flex: 1;
        }
        
        .time-slot small {
          display: block;
          color: var(--gray);
          font-size: 0.7rem;
          margin-bottom: 3px;
        }
        
        .time-slot strong {
          display: block;
          color: var(--dark);
          font-size: 1rem;
        }
        
        .task-controls {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        
        .progress-slider {
          margin-bottom: 15px;
        }
        
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--gray);
          margin-top: 5px;
        }
        
        .task-actions {
          display: flex;
          gap: 10px;
        }
        
        .delay-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .all-tasks {
          margin-bottom: 20px;
        }
        
        .tasks-grid {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .planning-comments {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
        
        .comment-input {
          display: flex;
          gap: 10px;
        }
        
        .comment-input .form-control {
          flex: 1;
        }
        
        @media (max-width: 768px) {
          .planning-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .planning-stats {
            width: 100%;
            justify-content: space-between;
          }
          
          .task-header {
            flex-direction: column;
            gap: 15px;
          }
          
          .task-status {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
          
          .task-timing {
            flex-direction: column;
            gap: 10px;
          }
          
          .task-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PlanningIntegration;
