import React from 'react';
import './Modal.css';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  console.log('Modal is open');
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;