import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './HandoverDetail.css';
import Modal from '../UI/Modal';
import { getHandovers } from '../../Api/HandOverApi';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

// Enhanced Timeline Component with Connector Lines
const AcknowledgeTimeline = ({ acknowledgeDetails }) => {
  if (!acknowledgeDetails || acknowledgeDetails.length === 0) {
    return (
      <div className="timeline-container">
        <h4 className="timeline-title">Acknowledgment History</h4>
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
            {/* Connector Line - Only show between items */}
            {index < acknowledgeDetails.length - 1 && (
              <div className="timeline-connector"></div>
            )}
            
            <div className="timeline-marker">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-time">
                  {format(new Date(ack.acknowledgeTime), 'MMM d, yyyy h:mm a')}
                </span>
                <span className="timeline-user">
                  {ack.userAcknowleged_id}
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
      console.error('Fetch error:', err);
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
      // Call your API to update task
      // await updateTask(payload);

      const updatedTasks = backendData.Tasksdata.map(t =>
        t.Taskid === selectedTask.Taskid
          ? {
              ...t,
              status: ackStatus,
              acknowledgeStatus: 'Acknowledged',
              ackDesc: ackDescription,
              acknowledgeTime: new Date().toISOString(),
              statusUpdateTime: new Date().toISOString(),
              acknowledgeDetails: [
                ...(t.acknowledgeDetails || []),
                {
                  ackId: Date.now(),
                  userAcknowleged_id: 'current_user', // Replace with actual user ID
                  acknowledgeTime: new Date().toISOString(),
                  ackDesc: ackDescription
                }
              ]
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
    } catch (err) {
      setError('Failed to update task on server!');
      console.error('Update error:', err);
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
      // Call your API to create task
      // await createTask(payload);

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
            <h3>Tasks ({tasks.length})</h3>
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

        {/* Acknowledge Modal with Enhanced Styling */}
        {modalOpen && selectedTask && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div className="modal-form-container">
              <h2 className="modal-title">Acknowledge Task</h2>

              <div className="task-info-box">
                {/* Horizontal Layout for Task ID, Title, Description */}
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
                
                {/* Enhanced Timeline Component with Connector Lines */}
                <AcknowledgeTimeline 
                  acknowledgeDetails={selectedTask.acknowledgeDetails || []} 
                />
              </div>

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
      </div>
    </div>
  );
};

export default HandoverDetail;
