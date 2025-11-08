import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ onLogout }) => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    uid: '',
    initials: ''
  });

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem('username') || 'Guest User';
    const uid = localStorage.getItem('uidd') || 'N/A';

    // Generate initials from username
    const getInitials = (name) => {
      if (!name) return 'GU';
      const parts = name.trim().split(' ');
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    setUserInfo({
      username,
      uid,
      initials: getInitials(username)
    });
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🔄</span>
          <h1>ShiftHandover</h1>
        </Link>
      </div>

      <div className="header-right">
        <div className="user-avatar-container">
          <div className="user-avatar">
            {userInfo.initials}
          </div>
          <div className="user-tooltip">
            <div className="tooltip-name">{userInfo.username}</div>
            <div className="tooltip-uid">UID: {userInfo.uid}</div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="logout-btn"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
