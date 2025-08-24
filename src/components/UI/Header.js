import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">
          <span className="logo-icon">🔄</span>
          <h1>ShiftHandover</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;