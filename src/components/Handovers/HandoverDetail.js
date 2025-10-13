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
      console.log('Fetching handover data for ID:', id);
      const data = await getHandovers();
      
      console.log('Fetched data:', data);
      
      if (data && data.TeamHandoverDetails && data.Tasksdata) {
        // Find the specific handover by ID
        const handoverDetail = data.TeamHandoverDetails.find(
          h => h.handover_id_id === parseInt(id)
        );
        
        // Filter tasks for this specific handover
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
      console.error('Error fetching handover:', err);
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

  if (loading) {
    return <div className="loading-message">Loading handover details...</div>;
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

  const handleAcknowledgeClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
    setAckDescription(task.acknowledgeDesc || '');
    setAckStatus(task.status || 'open');
    setError('');
  };

  const handleAcknowledgeSubmit = () => {
    if (!ackDescription.trim()) {
      setError('Description is required.');
      return;
    }

    const updatedTasks = backendData.Tasksdata.map(t =>
      t.Taskid === selectedTask.Taskid
        ? { 
            ...t, 
            status: ackStatus,
            acknowledgeStatus: 'Acknowledged',
            acknowledgeDesc: ackDescription,
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
    
    // TODO: Send update to backend API
    console.log('Task acknowledged:', {
      taskId: selectedTask.Taskid,
      status: ackStatus,
      acknowledgeDesc: ackDescription
    });
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
    setNewTask({
      taskTitle: '',
      taskDesc: '',
      priority: 'Medium',
      status: 'open'
    });
  };

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.taskTitle.trim() && !newTask.taskDesc.trim()) return;

    const maxTaskId = Math.max(...backendData.Tasksdata.map(t => t.Taskid), 0);
    
    const newTaskData = {
      Taskid: maxTaskId + 1,
      taskTitle: newTask.taskTitle,
      taskDesc: newTask.taskDesc,
      priority: newTask.priority,
      status: newTask.status,
      userCreated_id: null,
      userAccepted_id: null,
      creationTime: new Date().toISOString(),
      acknowledgeStatus: 'Pending',
      acknowledgeDesc: '',
      acknowledgeTime: '',
      statusUpdateTime: '',
      handover_id_id: parseInt(id)
    };

    setBackendData({
      ...backendData,
      Tasksdata: [...backendData.Tasksdata, newTaskData]
    });

    setShowCreateTaskModal(false);
    
    // TODO: Send new task to backend API
    console.log('New task created:', newTaskData);
  };

  return (
    <div className="handover-detail-container">
      <div className="handover-detail-header">
        <h2>{handover.teamName} Team Handover</h2>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to List
        </button>
      </div>

      <div className="handover-detail-content">
        <div className="detail-section">
          <h3>Handover Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Team Name:</span>
              <span className="detail-value">{handover.teamName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Team ID:</span>
              <span className="detail-value">{handover.TeamId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Team Lead ID:</span>
              <span className="detail-value">{handover.teamLead_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Handover ID:</span>
              <span className="detail-value">{handover.handover_id_id}</span>
            </div>
          </div>
        </div>

        {tasks && tasks.length > 0 ? (
          <div className="detail-section">
            <h3>Tasks ({tasks.length})</h3>
            <table className="tasks-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Task ID</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Title</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Description</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Priority</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Ack Status</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Created</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.Taskid}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{task.Taskid}</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', fontWeight: 600 }}>
                      {task.taskTitle || 'Untitled'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{task.taskDesc || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                      <span className={`priority-badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textTransform: 'capitalize', fontWeight: 500 }}>
                      {task.status || 'open'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                      <span className={`status-badge ${task.acknowledgeStatus?.toLowerCase() === 'pending' ? 'pending' : 'completed'}`}>
                        {task.acknowledgeStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                      {formatDate(task.creationTime)}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                      <button
                        className="acknowledge-btn"
                        style={{ padding: '7px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}
                        onClick={() => handleAcknowledgeClick(task)}
                      >
                        Acknowledge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button
                style={{
                  padding: '10px 22px',
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '16px',
                  boxShadow: '0 1px 4px rgba(44,62,80,0.08)',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onClick={handleCreateTask}
              >
                + Create New Task
              </button>
            </div>
          </div>
        ) : (
          <div className="detail-section">
            <h3>Tasks (0)</h3>
            <p>No tasks found for this handover.</p>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button
                style={{
                  padding: '10px 22px',
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '16px',
                  boxShadow: '0 1px 4px rgba(44,62,80,0.08)',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onClick={handleCreateTask}
              >
                + Create New Task
              </button>
            </div>
          </div>
        )}

        {modalOpen && selectedTask && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div
              style={{
                padding: '40px',
                minWidth: '480px',
                maxWidth: '600px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%)',
                borderRadius: '18px',
                boxShadow: '0 12px 36px rgba(44,62,80,0.16)',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                position: 'relative'
              }}
            >
              <h2
                style={{
                  marginBottom: '24px',
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#2c3e50',
                  letterSpacing: '0.5px',
                  textAlign: 'center'
                }}
              >
                Acknowledge Task
              </h2>
              
              <div style={{ marginBottom: '18px', background: '#f0f4f8', padding: '12px', borderRadius: '8px' }}>
                <strong>Task ID:</strong> {selectedTask.Taskid}
                <br />
                <strong>Title:</strong> {selectedTask.taskTitle || 'Untitled'}
                <br />
                <strong>Description:</strong> {selectedTask.taskDesc || '-'}
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 8, display: 'block', fontSize: '16px' }}>
                  Acknowledgment Description <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <textarea
                  value={ackDescription}
                  onChange={e => setAckDescription(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    borderRadius: '10px',
                    border: '1.5px solid #bcdffb',
                    padding: '14px',
                    fontSize: '17px',
                    background: '#f5f7fa',
                    color: '#222',
                    boxShadow: '0 1px 6px rgba(44,62,80,0.06)',
                    resize: 'vertical'
                  }}
                  placeholder="Add your acknowledgment details..."
                />
              </div>
              
              <div style={{ marginBottom: '22px', display: 'flex', gap: '32px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 8, display: 'block', fontSize: '16px' }}>
                    Current Status
                  </label>
                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 600,
                      color: '#007bff',
                      fontSize: '17px',
                      letterSpacing: '0.5px',
                      background: '#eaf6ff',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      textAlign: 'center',
                      textTransform: 'capitalize'
                    }}
                  >
                    {selectedTask.status || 'open'}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 8, display: 'block', fontSize: '16px' }}>
                    Change Status
                  </label>
                  <select
                    value={ackStatus}
                    onChange={e => setAckStatus(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 8,
                      borderRadius: '10px',
                      border: '1.5px solid #bcdffb',
                      padding: '14px',
                      fontSize: '17px',
                      background: ackDescription.trim() ? '#f5f7fa' : '#f0f0f0',
                      color: '#222',
                      boxShadow: '0 1px 6px rgba(44,62,80,0.06)'
                    }}
                    disabled={!ackDescription.trim()}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {!ackDescription.trim() && (
                    <div style={{ color: '#e74c3c', fontSize: '13px', marginTop: '6px' }}>
                      Please fill description to enable status change.
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 500, textAlign: 'center' }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '12px 28px',
                    background: '#f1f5f9',
                    color: '#222',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '17px',
                    boxShadow: '0 1px 6px rgba(44,62,80,0.06)',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcknowledgeSubmit}
                  style={{
                    padding: '12px 28px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '17px',
                    boxShadow: '0 1px 6px rgba(44,62,80,0.12)',
                    transition: 'background 0.2s',
                    opacity: ackDescription.trim() ? 1 : 0.6,
                    cursor: ackDescription.trim() ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!ackDescription.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showCreateTaskModal && (
          <Modal open={showCreateTaskModal} onClose={() => setShowCreateTaskModal(false)}>
            <form
              onSubmit={handleCreateTaskSubmit}
              style={{
                padding: '32px',
                minWidth: '400px',
                maxWidth: '500px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(44,62,80,0.12)',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                position: 'relative'
              }}
            >
              <h2 style={{
                marginBottom: '18px',
                fontSize: '22px',
                fontWeight: 700,
                color: '#2c3e50',
                letterSpacing: '0.5px'
              }}>
                Create New Task
              </h2>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 6, display: 'block' }}>
                  Title <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newTask.taskTitle}
                  onChange={e => setNewTask({ ...newTask, taskTitle: e.target.value })}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #dbeafe',
                    padding: '12px',
                    fontSize: '16px',
                    background: '#f5f7fa',
                    color: '#222'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 6, display: 'block' }}>
                  Description
                </label>
                <textarea
                  value={newTask.taskDesc}
                  onChange={e => setNewTask({ ...newTask, taskDesc: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #dbeafe',
                    padding: '12px',
                    fontSize: '16px',
                    background: '#f5f7fa',
                    color: '#222'
                  }}
                />
              </div>
              <div style={{ marginBottom: '18px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 6, display: 'block' }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #dbeafe',
                      padding: '12px',
                      fontSize: '16px',
                      background: '#f5f7fa',
                      color: '#222'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 6, display: 'block' }}>
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #dbeafe',
                      padding: '12px',
                      fontSize: '16px',
                      background: '#f5f7fa',
                      color: '#222'
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  style={{
                    padding: '10px 22px',
                    background: '#f1f5f9',
                    color: '#222',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '16px',
                    boxShadow: '0 1px 4px rgba(44,62,80,0.04)',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '16px',
                    boxShadow: '0 1px 4px rgba(44,62,80,0.08)',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
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