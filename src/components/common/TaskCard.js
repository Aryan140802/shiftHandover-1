import React from 'react';
import './TaskCard.css';

const priorityColors = {
  Low: '#28a745',
  Medium: '#ffc107',
  High: '#fd7e14',
  Critical: '#dc3545'
};

const statusColors = {
  incomplete: '#dc3545',
  in_progress: '#ffc107',
  completed: '#28a745'
};

const TaskCard = ({ task, onClick }) => {
  const {
    title,
    description,
    priority,
    status,
    team,
    lastUpdated
  } = task;

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-header">
        <h3>{title}</h3>
        <div className="task-priority" style={{ backgroundColor: priorityColors[priority] }}>
          {priority}
        </div>
      </div>
      <div className="task-body">
        <p className="task-description">{description}</p>
        <div className="task-meta">
          <span className="task-team">{team}</span>
          <span className="task-status" style={{ color: statusColors[status] }}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="task-footer">
          <span className="task-date">Last updated: {lastUpdated}</span>
          <button className="view-details">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;