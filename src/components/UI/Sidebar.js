import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2 } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="app-sidebar">
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/" className="nav-link">
            <FiHome className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>
       
        
        <li>
          <NavLink to="/reports" className="nav-link">
            <FiBarChart2 className="nav-icon" />
            <span>Reports</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;