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
    // 1. Retrieve the session ID from local storage
    const sessionId = localStorage.getItem('sessionid');

    // Check if session ID exists before proceeding
    if (!sessionId) {
      console.warn('No session ID found in local storage. Skipping API call.');
      return;
    }

    // 2. Prepare the headers object with the correct Authorization format
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

  // Enhanced logout handler with API call and complete cleanup
  const handleLogout = async () => {
    // Call logout API
    await callLogoutAPI(userInfo.username);
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
    
    // Call parent onLogout if provided
    if (onLogout) {
      onLogout();
    }
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
        <div className="user-avatar-container">
          <div className="user-avatar">
            {userInfo.initials}
          </div>
          <div className="user-tooltip">
            <div className="tooltip-name">{userInfo.username}</div>
            <div className="tooltip-uid">UID: {userInfo.uid}</div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
