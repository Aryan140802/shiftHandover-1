import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiClock, FiBarChart2 } from 'react-icons/fi';
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
          <NavLink to="/create" className="nav-link">
            <FiFileText className="nav-icon" />
            <span>Create Handover</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/shifts" className="nav-link">
            <FiClock className="nav-icon" />
            <span>Shift Management</span>
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