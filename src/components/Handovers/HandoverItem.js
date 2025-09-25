import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './HandoverItem.css';

const HandoverItem = ({ handover }) => {
  // Add null checks for handover and its properties
  if (!handover || !handover.id) {
    console.error('Invalid handover data:', handover);
    return (
      <div className="handover-item error">
        <p>Error: Invalid handover data</p>
      </div>
    );
  }

  // Safe property access with defaults
  const {
    title = 'Untitled Handover',
    description = 'No description available',
    priority = 'medium',
    
    
    createdBy = { name: 'Unknown User' },
    createdAt = new Date().toISOString(),
    attachments = []
  } = handover;

  const getPriorityClass = () => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return '';
      




    }
  };

 

  const handleTaskStatusChange = (taskIndex, newStatus) => {
    if (handover.onTaskUpdate) {
      const updatedTasks = [...handover.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status: newStatus,
        lastUpdated: new Date().toISOString()
      };
      
      // Update overall handover status based on tasks
      let newHandoverStatus = 'completed';
      for (const task of updatedTasks) {
        if (task.status === 'pending') {
          newHandoverStatus = 'pending';
          break;
        } else if (task.status === 'in-progress') {
          newHandoverStatus = 'in-progress';
          break;
        }
      }
      handover.status = newHandoverStatus;
      handover.onTaskUpdate(handover.id, updatedTasks);
    }
  };

  return (
    <div className={`handover-item ${getPriorityClass()}`}>
      <div className="handover-header">
        <h3>
          <Link to={`/handover/${handover.id}`}>{title}</Link>
        </h3>
        
      </div>
      
      <div className="handover-meta">
      
       
        <div className="meta-item">
          <span className="meta-label">Created:</span>
          <span>{format(new Date(createdAt), 'MMM d, yyyy h:mm a')}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">By:</span>
          <span>{createdBy.name}</span>
        </div>
      </div>
      
      <div className="handover-description">
        <p>{description}</p>
      </div>

      {handover.tasks && handover.tasks.length > 0 && (
        <div className="handover-tasks">
          <h4>Tasks</h4>
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Updated</th>
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
                      {/* Remove status select, show status as badge */}
                      <span className={`status-badge ${task.status}`}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {task.lastUpdated 
                        ? format(new Date(task.lastUpdated), 'MMM d, yyyy h:mm a')
                        : format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {attachments.length > 0 && (
        <div className="handover-attachments">
          <span className="attachment-icon"></span>
          <span>{attachments.length} attachment(s)</span>
        </div>
      )}
      
      <div className="handover-actions">
        <Link to={`/handover/${handover.id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default HandoverItem;
