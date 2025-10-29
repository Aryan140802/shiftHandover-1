import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './HandoverDetail.css';
import Modal from '../UI/Modal';
import { getHandovers, createTask, updateTask, getHistoryHandovers } from '../../Api/HandOverApi';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

// Timeline Component
const AcknowledgeTimeline = ({ acknowledgeDetails }) => {
  if (!acknowledgeDetails || acknowledgeDetails.length === 0) {
    return (
      <div className="timeline-container">
        <div className="no-timeline-data">
          <p>No acknowledgment history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <h4 className="timeline-title">Acknowledgment History</h4>
      <div className="timeline-horizontal">
        {acknowledgeDetails.map((ack, index) => (
          <div key={ack.ackId} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-dot"></div>
              {index < acknowledgeDetails.length - 1 && (
                <div className="timeline-connector"></div>
              )}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-time">
                  {format(new Date(ack.acknowledgeTime), 'MMM d, yyyy h:mm a')}
                </span>
                <span className="timeline-user">
                  User ID: {ack.userAcknowleged_id}
                </span>
              </div>
              <div className="timeline-description">
                {ack.ackDesc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// History Data Table Component
const HistoryTable = ({ historyData, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return '-';
    }
  };

  if (!historyData || historyData.length === 0) {
    return (
      <div className="history-modal">
        <div className="modal-header">
          <h3>Handover History</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="no-history-data">
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-modal">
      <div className="modal-header">
        <h3>Handover History ({historyData.length} records)</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Handover ID</th>
              <th>Team Name</th>
              <th>Team Lead</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Last Updated</th>
              <th>Tasks Count</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((historyItem) => (
              <tr key={historyItem.handover_id || historyItem.id || historyItem.handover_id_id}>
                <td>{historyItem.handover_id || historyItem.id || historyItem.handover_id_id}</td>
                <td>{historyItem.teamName || historyItem.team_name || '-'}</td>
                <td>{historyItem.teamLead_id || historyItem.team_lead_id || '-'}</td>
                <td>
                  <span className={`status-badge ${(historyItem.status?.toLowerCase() || 'unknown')}`}>
                    {historyItem.status || 'Unknown'}
                  </span>
                </td>
                <td>{formatDate(historyItem.creationTime || historyItem.createdAt || historyItem.created_date)}</td>
                <td>{formatDate(historyItem.lastUpdated || historyItem.updatedAt || historyItem.updated_date)}</td>
                <td>{historyItem.tasksCount || historyItem.tasks?.length || historyItem.task_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Summary Modal Component - Uses History Data to create summary
const SummaryModal = ({ historyData, onClose }) => {
  // Calculate summary statistics from history data
  const calculateSummary = (data) => {
    if (!data || data.length === 0) {
      return {
        totalHandovers: 0,
        activeHandovers: 0,
        completedHandovers: 0,
        totalTasks: 0,
        teams: [],
        statusDistribution: {},
        recentActivity: []
      };
    }

    const totalHandovers = data.length;
    const activeHandovers = data.filter(item => 
      item.status && (item.status.toLowerCase() === 'open' || item.status.toLowerCase() === 'in progress')
    ).length;
    const completedHandovers = data.filter(item => 
      item.status && item.status.toLowerCase() === 'completed'
    ).length;

    // Calculate total tasks across all handovers
    const totalTasks = data.reduce((sum, item) => {
      return sum + (item.tasksCount || item.tasks?.length || item.task_count || 0);
    }, 0);

    // Get unique teams
    const teams = [...new Set(data.map(item => item.teamName || item.team_name).filter(Boolean))];

    // Status distribution
    const statusDistribution = data.reduce((acc, item) => {
      const status = item.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 5 handovers)
    const recentActivity = data
      .slice(0, 5)
      .map(item => ({
        handoverId: item.handover_id || item.id || item.handover_id_id,
        teamName: item.teamName || item.team_name,
        status: item.status,
        timestamp: item.lastUpdated || item.updatedAt || item.updated_date || item.creationTime || item.createdAt
      }));

    return {
      totalHandovers,
      activeHandovers,
      completedHandovers,
      totalTasks,
      teams: teams.slice(0, 5), // Show only first 5 teams
      teamCount: teams.length,
      statusDistribution,
      recentActivity
    };
  };

  const summary = calculateSummary(historyData);

  if (!historyData || historyData.length === 0) {
    return (
      <div className="summary-modal">
        <div className="modal-header">
          <h3>Handover Summary</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="no-summary-data">
          <p>No data available for summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-modal">
      <div className="modal-header">
        <h3>Handover Summary</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="summary-content">
        {/* Key Metrics */}
        <div className="summary-grid">
          <div className="summary-item total">
            <span className="summary-label">Total Handovers</span>
            <span className="summary-value">{summary.totalHandovers}</span>
          </div>
          <div className="summary-item active">
            <span className="summary-label">Active</span>
            <span className="summary-value">{summary.activeHandovers}</span>
          </div>
          <div className="summary-item completed">
            <span className="summary-label">Completed</span>
            <span className="summary-value">{summary.completedHandovers}</span>
          </div>
          <div className="summary-item tasks">
            <span className="summary-label">Total Tasks</span>
            <span className="summary-value">{summary.totalTasks}</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="status-distribution">
          <h4>Status Distribution</h4>
          <div className="status-bars">
            {Object.entries(summary.statusDistribution).map(([status, count]) => (
              <div key={status} className="status-bar-item">
                <div className="status-bar-header">
                  <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <span className="status-count">{count}</span>
                </div>
                <div className="status-bar">
                  <div 
                    className={`status-bar-fill ${status}`}
                    style={{ 
                      width: `${(count / summary.totalHandovers) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Overview */}
        {summary.teams.length > 0 && (
          <div className="teams-overview">
            <h4>Teams Overview</h4>
            <div className="teams-list">
              {summary.teams.map((team, index) => (
                <div key={index} className="team-tag">
                  {team}
                </div>
              ))}
              {summary.teamCount > 5 && (
                <div className="team-tag more">
                  +{summary.teamCount - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {summary.recentActivity.length > 0 && (
          <div className="recent-activity">
            <h4>Recent Activity</h4>
            <div className="activity-list">
              {summary.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-main">
                    <span className="activity-team">{activity.teamName}</span>
                    <span className={`activity-status ${activity.status?.toLowerCase()}`}>
                      {activity.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-id">ID: {activity.handoverId}</span>
                    <span className="activity-time">
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className="data-source">
          <p>Summary generated from {summary.totalHandovers} historical handover records</p>
        </div>
      </div>
    </div>
  );
};

const HandoverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [backendData, setBackendData] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ackDescription, setAckDescription] = useState('');
  const [ackStatus, setAckStatus] = useState('');
  const [error, setError] = useState('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    taskTitle: '',
    taskDesc: '',
    priority: 'Medium',
    status: 'open'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandoverData();
  }, [id]);

  const fetchHandoverData = async () => {
    setLoading(true);
    try {
      const data = await getHandovers();
      if (data && data.TeamHandoverDetails && data.Tasksdata) {
        const handoverDetail = data.TeamHandoverDetails.find(
          h => h.handover_id_id === parseInt(id)
        );
        const handoverTasks = data.Tasksdata.filter(
          t => t.handover_id_id === parseInt(id)
        );
        if (handoverDetail) {
          setBackendData({
            TeamHandoverDetails: [handoverDetail],
            Tasksdata: handoverTasks
          });
        } else {
          setBackendData(null);
        }
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (err) {
      setError('Failed to load handover details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return '-';
    }
  };

  const handleSummaryClick = async () => {
    setSummaryLoading(true);
    setShowSummaryModal(true);
    try {
      // Use the same history API but we'll process it differently for summary
      const history = await getHistoryHandovers();
      setHistoryData(history);
    } catch (err) {
      setError('Failed to load handover summary');
      console.error('Summary fetch error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleHistoryClick = async () => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      const history = await getHistoryHandovers();
      setHistoryData(history);
    } catch (err) {
      setError('Failed to load handover history');
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAcknowledgeClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
    setAckDescription(task.ackDesc || '');
    setAckStatus(task.status || 'open');
    setError('');
  };

  const handleAcknowledgeSubmit = async () => {
    if (!ackDescription.trim()) {
      setError('Description is required.');
      return;
    }

    const payload = {
      task_id: selectedTask.Taskid,
      taskTitle: selectedTask.taskTitle || '',
      taskDesc: selectedTask.taskDesc || '',
      status: ackStatus,
      priority: selectedTask.priority || 'Medium',
      acknowledgeStatus: 'Acknowledged',
      ackDesc: ackDescription
    };

    try {
      await updateTask(payload);

      const updatedTasks = backendData.Tasksdata.map(t =>
        t.Taskid === selectedTask.Taskid
          ? {
              ...t,
              status: ackStatus,
              acknowledgeStatus: 'Acknowledged',
              ackDesc: ackDescription,
              acknowledgeTime: new Date().toISOString(),
              statusUpdateTime: new Date().toISOString()
            }
          : t
      );

      setBackendData({
        ...backendData,
        Tasksdata: updatedTasks
      });

      setModalOpen(false);
      setSelectedTask(null);
      setAckDescription('');
      setAckStatus('');
      setError('');

      // Refresh the entire page after successful acknowledgment
      window.location.reload();
    } catch (err) {
      setError('Failed to update task on server!');
    }
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
    setNewTask({
      taskTitle: '',
      taskDesc: '',
      priority: 'Medium',
      status: 'open'
    });
    setError('');
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.taskTitle.trim() && !newTask.taskDesc.trim()) {
      setError('Please provide at least a title or description');
      return;
    }

    const payload = {
      taskTitle: newTask.taskTitle,
      taskDesc: newTask.taskDesc,
      status: newTask.status,
      priority: newTask.priority,
      acknowledgeStatus: 'Pending',
      ackDesc: '',
      handover_id_id: parseInt(id)
    };

    try {
      await createTask(payload);

      // Refresh data after creating task
      await fetchHandoverData();

      setShowCreateTaskModal(false);
      setError('');
    } catch (err) {
      console.error('Create task error:', err);
      setError('Failed to create task on server!');
    }
  };

  // Calculate task statistics
  const getTaskStats = (tasks) => {
    return {
      pending: tasks.filter(t => t.status === 'open' || t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in progress' || t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed' || t.status === 'closed').length
    };
  };

  if (loading) {
    return (
      <div className="handover-detail-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading handover details...</p>
        </div>
      </div>
    );
  }

  if (!backendData || !backendData.TeamHandoverDetails || backendData.TeamHandoverDetails.length === 0) {
    return (
      <div className="handover-detail-container">
        <div className="not-found">
          <h2>Handover not found</h2>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const handover = backendData.TeamHandoverDetails[0];
  const tasks = backendData.Tasksdata || [];
  const taskStats = getTaskStats(tasks);

  return (
    <div className="handover-detail-container">
      <div className="handover-detail-header">
        <h2>{handover.teamName} Team Handover</h2>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to List
        </button>
      </div>

      <div className="handover-detail-content">
        {/* Task Statistics */}
        {tasks.length > 0 && (
          <div className="task-stats">
            <div className="task-stat-card pending">
              <h4>Pending</h4>
              <div className="number">{taskStats.pending}</div>
            </div>
            <div className="task-stat-card in-progress">
              <h4>In Progress</h4>
              <div className="number">{taskStats.inProgress}</div>
            </div>
            <div className="task-stat-card completed">
              <h4>Completed</h4>
              <div className="number">{taskStats.completed}</div>
            </div>
          </div>
        )}

        {/* Handover Details */}
        <div className="detail-section">
          <h3>Handover Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Team Name</span>
              <span className="detail-value">{handover.teamName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Team ID</span>
              <span className="detail-value">{handover.TeamId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Team Lead ID</span>
              <span className="detail-value">{handover.teamLead_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Handover ID</span>
              <span className="detail-value">{handover.handover_id_id}</span>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h3>Tasks ({tasks.length})</h3>
              <button 
                className="history-button"
                onClick={handleHistoryClick}
                disabled={historyLoading}
              >
                {historyLoading ? 'Loading...' : 'View History'}
              </button>
              <button 
                className="summary-button"
                onClick={handleSummaryClick}
                disabled={summaryLoading}
              >
                {summaryLoading ? 'Loading...' : 'View Summary'}
              </button>
            </div>
            <button className="create-task-btn" onClick={handleCreateTask}>
              + Create New Task
            </button>
          </div>

          {tasks.length > 0 ? (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Ack Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.Taskid}>
                    <td>{task.Taskid}</td>
                    <td style={{ fontWeight: 600 }}>{task.taskTitle || 'Untitled'}</td>
                    <td>{task.taskDesc || '-'}</td>
                    <td>
                      <span className={`priority-badge priority-${(task.priority || 'medium').toLowerCase()}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${task.status === 'in progress' ? 'in-progress' : task.status}`}>
                        {task.status === 'in progress' ? 'In Progress' : task.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${task.acknowledgeStatus?.toLowerCase() === 'pending' ? 'pending' : 'completed'}`}>
                        {task.acknowledgeStatus || 'Pending'}
                      </span>
                    </td>
                    <td>{formatDate(task.creationTime)}</td>
                    <td>
                      <button className="acknowledge-btn" onClick={() => handleAcknowledgeClick(task)}>
                        Acknowledge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-tasks">
              <p>No tasks found for this handover.</p>
            </div>
          )}
        </div>

        {/* Acknowledge Modal */}
        {modalOpen && selectedTask && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div className="modal-form-container">
              <h2 className="modal-title">Acknowledge Task</h2>

              <div className="task-info-horizontal">
                <div className="info-column">
                  <strong>Task ID</strong>
                  <span>{selectedTask.Taskid}</span>
                </div>
                <div className="info-column">
                  <strong>Title</strong>
                  <span>{selectedTask.taskTitle || 'Untitled'}</span>
                </div>
                <div className="info-column">
                  <strong>Description</strong>
                  <span>{selectedTask.taskDesc || '-'}</span>
                </div>
              </div>

              {/* Timeline Component */}
              <AcknowledgeTimeline acknowledgeDetails={selectedTask.acknowledgeDetails} />

              <div className="form-group">
                <label>
                  Acknowledgment Description <span className="required">*</span>
                </label>
                <textarea
                  value={ackDescription}
                  onChange={e => setAckDescription(e.target.value)}
                  rows={4}
                  placeholder="Add your acknowledgment details..."
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Status</label>
                  <div className="current-status">
                    {selectedTask.status || 'open'}
                  </div>
                </div>
                <div className="form-group">
                  <label>Change Status</label>
                  <select
                    value={ackStatus}
                    onChange={e => setAckStatus(e.target.value)}
                    className="form-select"
                    disabled={!ackDescription.trim()}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {!ackDescription.trim() && (
                    <div className="form-hint">
                      Please fill description to enable status change.
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleAcknowledgeSubmit}
                  className="btn-primary"
                  disabled={!ackDescription.trim()}
                >
                  Submit Acknowledgment
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Create Task Modal */}
        {showCreateTaskModal && (
          <Modal open={showCreateTaskModal} onClose={() => setShowCreateTaskModal(false)}>
            <form onSubmit={handleCreateTaskSubmit} className="modal-form-container">
              <h2 className="modal-title">Create New Task</h2>

              <div className="form-group">
                <label>
                  Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.taskTitle}
                  onChange={e => setNewTask({ ...newTask, taskTitle: e.target.value })}
                  className="form-input"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.taskDesc}
                  onChange={e => setNewTask({ ...newTask, taskDesc: e.target.value })}
                  rows={3}
                  className="form-textarea"
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newTask.status}
                    onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newTask.taskTitle.trim()}
                >
                  Create Task
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* History Modal */}
        {showHistoryModal && (
          <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)}>
            <HistoryTable 
              historyData={historyData} 
              onClose={() => setShowHistoryModal(false)}
            />
          </Modal>
        )}

        {/* Summary Modal */}
        {showSummaryModal && (
          <Modal open={showSummaryModal} onClose={() => setShowSummaryModal(false)}>
            <SummaryModal 
              historyData={historyData} 
              onClose={() => setShowSummaryModal(false)}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default HandoverDetail;
