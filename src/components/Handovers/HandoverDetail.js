import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './HandoverDetail.css';

const HandoverDetail = ({ handovers }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handover = handovers.find(h => h.id === id);

  if (!handover) {
    return (
      <div className="handover-detail-container">
        <div className="not-found">
          <h2>Handover not found</h2>
          <button onClick={() => navigate('/')} className="back-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="handover-detail-container">
      <div className="handover-detail-header">
        <h2>{handover.title}</h2>
        <button onClick={() => navigate('/')} className="back-button">
          Back to List
        </button>
      </div>

      <div className="handover-detail-content">
        <div className="detail-section">
          <h3>Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">From Shift:</span>
              <span className="detail-value">
                {handover.fromShift.name} ({handover.fromShift.time})
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">To Shift:</span>
              <span className="detail-value">
                {handover.toShift.name} ({handover.toShift.time})
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">
                {format(new Date(handover.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created By:</span>
              <span className="detail-value">{handover.createdBy.name}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <div className="description-content">
            <p>{handover.description}</p>
          </div>
        </div>

        {handover.tasks && handover.tasks.length > 0 && (
          <div className="detail-section">
            <h3>Tasks ({handover.tasks.length})</h3>
            <div className="tasks-table-wrapper">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {handover.tasks.map((task, index) => (
                    <tr key={index}>
                      <td>{task.title}</td>
                      <td>{task.description || '-'}</td>
                      <td>
                        <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${task.status || 'pending'}`}>
                          {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ') : 'Pending'}
                        </span>
                      </td>
                      <td>{format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {handover.attachments && handover.attachments.length > 0 && (
          <div className="detail-section">
            <h3>Attachments ({handover.attachments.length})</h3>
            <div className="attachments-list">
              {handover.attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <div className={`file-icon ${file.type}`}></div>
                  <span className="file-name">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandoverDetail;