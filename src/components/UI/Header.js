import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🔄</span>
          <h1>ShiftHandover</h1>
        </Link>
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
