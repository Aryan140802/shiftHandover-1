import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

// Robust function to clear all cookies (within JS limitations)
function clearAllCookies() {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    // Remove cookie for root path
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    // Attempt to remove cookie for every path segment
    const pathSegments = window.location.pathname.split('/');
    let path = '';
    for (let i = 0; i < pathSegments.length; i++) {
      path += (path.endsWith('/') ? '' : '/') + pathSegments[i];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};`;
    }
  }
}

// Logout API call
async function callLogoutAPI(username) {
  try {
    const sessionId = localStorage.getItem('sessionid');

    if (!sessionId) {
      console.warn('No session ID found in local storage. Skipping API call.');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionId}`
    };

    const response = await fetch('https://10.191.171.12:5443/EISHOME_TEST/awthenticationService/newLogout/', {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.warn('Logout API call failed:', response.status, response.statusText);
    } else {
      console.log('Logout API call successful');
      localStorage.removeItem('sessionId');
    }
  } catch (error) {
    console.error('Error calling logout API:', error);
  }
}

const Header = ({ onLogout }) => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    uid: '',
    initials: ''
  });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('username') || 'Guest User';
    const uid = localStorage.getItem('uidd') || 'N/A';
    
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

  const handleLogout = async () => {
    await callLogoutAPI(userInfo.username);
    
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
    
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to specified URL
    window.location.href = 'https://10.191.171.12:5443/EISHOME/';
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🔄</span>
          <h1>ShiftHandover</h1>
        </Link>
      </div>
      
      <div className="header-right">
        <div 
          className="user-avatar-container"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="user-avatar">
            {userInfo.initials}
          </div>
          {showTooltip && (
            <div className="user-tooltip">
              <div className="tooltip-name">{userInfo.username}</div>
              <div className="tooltip-uid">UID: {userInfo.uid}</div>
              <button 
                onClick={handleLogout}
                className="tooltip-logout-btn"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
