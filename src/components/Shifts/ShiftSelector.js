import React from 'react';
import './ShiftSelector.css';

const ShiftSelector = ({ shifts, onSelect }) => {
  return (
    <div className="shift-selector-modal">
      <h3>Select Shift</h3>
      <div className="shifts-grid">
        {shifts.map(shift => (
          <div 
            key={shift.id} 
            className="shift-option"
            onClick={() => onSelect(shift)}
          >
            <h4>{shift.name}</h4>
            <p>{shift.startTime} - {shift.endTime}</p>
            {shift.description && <p className="shift-desc">{shift.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftSelector;