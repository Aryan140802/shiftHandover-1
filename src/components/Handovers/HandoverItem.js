import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './HandoverItem.css';

const HandoverItem = ({ handover, tasks = [] }) => {
  // Add null checks for handover and its properties
  if (!handover || !handover.handover_id_id) {
    return (
      <div className="handover-item error">
        <p>Error: Invalid handover data</p>
      </div>
    );
  }

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return '-';
    }
  };

  // Get priority class based on tasks
  const getPriorityClass = () => {
    const priorities = tasks.map(task => task.priority?.toLowerCase());
    if (priorities.includes('critical')) return 'priority-critical';
    if (priorities.includes('high')) return 'priority-high';
    if (priorities.includes('medium')) return 'priority-medium';
    if (priorities.includes('low')) return 'priority-low';
    return '';
  };

  return (
    <div className={`handover-item ${getPriorityClass()}`}>
      <div className="handover-header">
        <h3>
          <Link to={`/handover/${handover.handover_id_id}`}>
            {handover.teamName} Team Handover
          </Link>
        </h3>
      </div>

      <div className="handover-meta">
        <div className="meta-item">
          <span className="meta-label">Team:</span>
          <span>{handover.teamName}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Team ID:</span>
          <span>{handover.TeamId}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Team Lead ID:</span>
          <span>{handover.teamLead_id}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Handover ID:</span>
          <span>{handover.handover_id_id}</span>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="handover-tasks">
          <h4>Tasks ({tasks.length})</h4>
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title/Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Acknowledge Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.Taskid}>
                    <td style={{ fontWeight: 500 }}>
                      {task.taskTitle || task.taskDesc || 'Untitled'}
                    </td>
                    <td>
                      <span className={`priority-badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${task.status}`}>
                        {task.status === 'in-progress' ? 'In Progress' :
                         task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${task.acknowledgeStatus?.toLowerCase() === 'pending' ? 'pending' : 'completed'}`}>
                        {task.acknowledgeStatus || 'Pending'}
                      </span>
                    </td>
                    <td>{formatDate(task.creationTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="handover-actions">
        <Link to={`/handover/${handover.handover_id_id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default HandoverItem;
