
import React from 'react';
import './Modal.css';

// Add 'actionButton' to the destructuring of props
const Modal = ({ open, onClose, children, actionButton }) => { // <-- Added actionButton
  if (!open) return null;
  console.log('Modal is open');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>

        {/* The existing close button remains at the top right */}
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        {children}



      </div>
    </div>
  );
};

export default Modal;
