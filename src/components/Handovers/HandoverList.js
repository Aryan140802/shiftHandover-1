import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HandoverItem from './HandoverItem';
import { getHandovers } from './api'; // Import the API function
import './HandoverList.css';

const HandoverList = ({ handovers = [], onHandoversUpdate }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch handovers when component mounts
  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    // If handovers are provided via props, don't fetch
    if (handovers.length > 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getHandovers();
      
      // Assuming the API response has a data property containing handovers
      // You might need to adjust this based on your actual API response structure
      if (response.data && typeof onHandoversUpdate === 'function') {
        onHandoversUpdate(response.data);
      }
    } catch (err) {
      setError('Failed to fetch handovers. Please try again.');
      console.error('Error fetching handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate task statistics
  const taskStats = {
    pending: 0,
    'in-progress': 0,
    completed: 0
  };
  
  handovers.forEach(handover => {
    handover.tasks?.forEach(task => {
      if (task.status in taskStats) {
        taskStats[task.status]++;
      }
    });
  });

  const handleTaskUpdate = (handoverId, updatedTasks) => {
    const updatedHandovers = handovers.map(handover => {
      if (handover.id === handoverId) {
        return {
          ...handover,
          tasks: updatedTasks
        };
      }
      return handover;
    });
    
    // Only update if the callback is provided
    if (typeof onHandoversUpdate === 'function') {
      onHandoversUpdate(updatedHandovers);
    } else {
      console.warn('onHandoversUpdate function not provided to HandoverList component');
    }
  };

  const filteredHandovers = handovers.filter(handover => {
    const statusMatch = statusFilter === 'all' || handover.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || handover.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  return (
    <div className="handover-container">
      <div className="handover-header">
        <h2>Shift Handovers</h2>
        <button 
          onClick={fetchHandovers} 
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="task-statistics">
        <div className="stat-card pending">
          <h3>Pending Tasks</h3>
          <span className="stat-number">{taskStats.pending || 0}</span>
        </div>
        <div className="stat-card in-progress">
          <h3>In Progress</h3>
          <span className="stat-number">{taskStats['in-progress'] || 0}</span>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <span className="stat-number">{taskStats.completed || 0}</span>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {loading && handovers.length === 0 ? (
        <div className="loading-message">
          <p>Loading handovers...</p>
        </div>
      ) : (
        <div className="handover-list">
          {filteredHandovers.length > 0 ? (
            filteredHandovers.map((handover) => (
              <HandoverItem
                key={handover.id}
                handover={{
                  ...handover,
                  onTaskUpdate: handleTaskUpdate
                }}
                onClick={() => navigate(`/handover/${handover.id}`)}
              />
            ))
          ) : (
            <div className="no-handovers">
              <p>No handovers found matching the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HandoverList;
