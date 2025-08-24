import React, { useState } from 'react';

const ShiftManager = ({ shifts, setShifts }) => {
  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift({
      ...newShift,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const shiftToAdd = {
      ...newShift,
      id: `shift-${Date.now()}`
    };
    setShifts([...shifts, shiftToAdd]);
    setNewShift({
      name: '',
      startTime: '',
      endTime: '',
      description: ''
    });
  };

  return (
    <div className="shift-manager">
      <h2>Shift Management</h2>
      
      <div className="shift-manager-content">
        <div className="shift-list">
          <h3>Existing Shifts</h3>
          {shifts.length === 0 ? (
            <div className="no-shifts">
              <div className="no-shifts-icon"></div>
              <p>No shifts defined yet</p>
            </div>
          ) : (
            <ul className="shifts-grid">
              {shifts.map(shift => (
                <li key={shift.id} className="shift-card">
                  <div className="shift-header">
                    <h4>{shift.name}</h4>
                    <span className="shift-time">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <p className="shift-description">{shift.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="shift-form">
          <h3>Create New Shift</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Shift Name*</label>
              <input
                type="text"
                name="name"
                value={newShift.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Time*</label>
                <input
                  type="time"
                  name="startTime"
                  value={newShift.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>End Time*</label>
                <input
                  type="time"
                  name="endTime"
                  value={newShift.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newShift.description}
                onChange={handleInputChange}
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Create Shift
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShiftManager;