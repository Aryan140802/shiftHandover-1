import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './HandoverDetail.css';
// import TaskCard from '../common/TaskCard';
import Modal from '../UI/Modal';
import { v4 as uuidv4 } from 'uuid';

const statusOptions = [
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const HandoverDetail = ({ handovers }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handover = handovers.find(h => h.id === id);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tasks, setTasks] = useState(handover.tasks || []);
  const [ackDescription, setAckDescription] = useState('');
  const [ackStatus, setAckStatus] = useState('');
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });

  const handleAcknowledgeClick = (task) => {
    setSelectedTask(task);
    setSelectedTaskId(task.id);
    setModalOpen(true);
    setAckDescription('');
    setAckStatus(task.status);
    setShowStatusSelect(false);
    setError('');
  };

  const handleAcknowledgeNext = () => {
    if (!ackDescription.trim()) {
      setError('Description is required.');
      return;
    }
    setError('');
    setShowStatusSelect(true);
  };

  const handleAcknowledgeSubmit = () => {
    if (!ackDescription.trim()) {
      setError('Description is required.');
      return;
    }
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === selectedTaskId
          ? { ...t, status: ackStatus, lastAcknowledgment: ackDescription }
          : t
      )
    );
    setModalOpen(false);
    setSelectedTask(null);
    setSelectedTaskId(null);
    setAckDescription('');
    setAckStatus('');
    setShowStatusSelect(false);
    setError('');
    // Optionally, send acknowledgment to backend here
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    });
  };

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setTasks(prevTasks => [
      ...prevTasks,
      {
        ...newTask,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      }
    ]);
    setShowCreateTaskModal(false);
  };

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

        {tasks && tasks.length > 0 && (
          <div className="detail-section">
            <h3>Tasks ({tasks.length})</h3>
            <table className="tasks-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Description</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Priority</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Completed</th>
                  <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Acknowledge</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', fontWeight: 600 }}>{task.title}</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{task.description}</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textTransform: 'capitalize' }}>{task.priority}</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textTransform: 'uppercase', fontWeight: 500 }}>{task.status.replace('_', ' ')}</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', color: task.status === 'completed' ? '#28a745' : '#dc3545', fontWeight: 600 }}>
                      {task.status === 'completed' ? 'Yes' : 'No'}
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
                  transition: 'background 0.2s'
                }}
                onClick={handleCreateTask}
              >
                + Create New Task
              </button>
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

        {modalOpen && (
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
              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontWeight: 600, color: '#34495e', marginBottom: 8, display: 'block', fontSize: '16px' }}>
                  Description <span style={{ color: '#e74c3c' }}>*</span>
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
                  placeholder="Add your acknowledgment..."
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
                      textAlign: 'center'
                    }}
                  >
                    {selectedTask?.status.replace('_', ' ').toUpperCase()}
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
                    transition: 'background 0.2s'
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
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
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
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
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
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
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
                    transition: 'background 0.2s'
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
                    transition: 'background 0.2s'
                  }}
                  disabled={!newTask.title.trim()}
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