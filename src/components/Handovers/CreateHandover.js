import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShiftSelector from '../Shifts/ShiftSelector';
import Modal from '../UI/Modal';
import './CreateHandover.css';

const CreateHandover = ({ shifts, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    fromShift: null,
    toShift: null,
    attachments: [],
    tasks: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftType, setShiftType] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files.map(file => ({
        name: file.name,
        type: file.type.split('/')[1] || 'file'
      }))]
    });
  };

  const handleShiftSelect = (shift) => {
    if (shiftType === 'from') {
      setFormData({ ...formData, fromShift: shift });
    } else {
      setFormData({ ...formData, toShift: shift });
    }
    setShowShiftModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="create-handover-container">
      <h2>Create New Shift Handover</h2>
      
      {success && (
        <div className="alert success">
          Handover created successfully! Redirecting...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>From Shift*</label>
            <div className="shift-selector">
              <input
                type="text"
                value={formData.fromShift?.name || ''}
                readOnly
                placeholder="Select shift"
                required
              />
              <button 
                type="button"
                className="select-shift-btn"
                onClick={() => {
                  setShiftType('from');
                  setShowShiftModal(true);
                }}
              >
                Select
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>To Shift*</label>
            <div className="shift-selector">
              <input
                type="text"
                value={formData.toShift?.name || ''}
                readOnly
                placeholder="Select shift"
                required
              />
              <button 
                type="button"
                className="select-shift-btn"
                onClick={() => {
                  setShiftType('to');
                  setShowShiftModal(true);
                }}
              >
                Select
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Attachments</label>
          <input
            type="file"
            onChange={handleFileUpload}
            multiple
          />
          {formData.attachments.length > 0 && (
            <div className="attachments-preview">
              <p>Files to upload:</p>
              <ul>
                {formData.attachments.map((file, index) => (
                  <li key={index}>
                    <span className={`file-icon ${file.type}`}></span>
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Tasks</label>
          <div className="task-input-container">
            <div className="task-input-group">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className="task-input"
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description (optional)"
                className="task-description"
              />
              <div className="task-controls">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="task-priority-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="task-status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              <button
                type="button"
                className="add-task-btn"
                onClick={() => {
                  if (newTask.title.trim()) {
                    setFormData({
                      ...formData,
                      tasks: [...formData.tasks, {
                        ...newTask,
                        title: newTask.title.trim(),
                        description: newTask.description.trim(),
                        createdAt: new Date().toISOString()
                      }]
                    });
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'medium',
                      status: 'pending'
                    });
                  }
                }}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

          {formData.tasks.length > 0 && (
            <div className="tasks-table-wrapper">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.tasks.map((task, index) => (
                    <tr key={index}>
                      <td>{task.title}</td>
                      <td>{task.description || '-'}</td>
                      <td>
                        <select
                          value={task.priority}
                          onChange={(e) => {
                            const updatedTasks = [...formData.tasks];
                            updatedTasks[index] = {
                              ...task,
                              priority: e.target.value
                            };
                            setFormData({
                              ...formData,
                              tasks: updatedTasks
                            });
                          }}
                          className={`priority-select priority-${task.priority}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={task.status}
                          onChange={(e) => {
                            const updatedTasks = [...formData.tasks];
                            updatedTasks[index] = {
                              ...task,
                              status: e.target.value,
                              lastUpdated: new Date().toISOString()
                            };
                            setFormData({
                              ...formData,
                              tasks: updatedTasks
                            });
                          }}
                          className={`status-select ${task.status}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td>{new Date(task.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          className="remove-task-btn"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              tasks: formData.tasks.filter((_, i) => i !== index)
                            });
                          }}
                          title="Remove task"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
          >
            Submit Handover
          </button>
        </div>
      </form>
      
      <Modal show={showShiftModal} onClose={() => setShowShiftModal(false)}>
        <ShiftSelector 
          shifts={shifts} 
          onSelect={handleShiftSelect} 
        />
      </Modal>
    </div>
  );
};

export default CreateHandover;